from __future__ import annotations

import hashlib
import hmac
import json
import re
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from threading import Lock
from time import monotonic
from typing import Any

from fastapi import HTTPException
from sqlalchemy import delete, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.idempotency import IdempotencyRecord
from app.core.config import settings
from app.services.analysis_crypto import decrypt_json_for_user, encrypt_json_for_user


_KEY_PATTERN = re.compile(r"^[A-Za-z0-9._:+\-/]{8,255}$")
_IN_PROGRESS_TIMEOUT = timedelta(minutes=10)
_RECORD_RETENTION = timedelta(hours=24)
_CLEANUP_INTERVAL_SECONDS = 5 * 60
_cleanup_lock = Lock()
_last_cleanup_monotonic = 0.0


@dataclass(frozen=True)
class IdempotencyAttempt:
    record: IdempotencyRecord
    lease_token: str | None = None
    replay_response: dict[str, Any] | None = None

    @property
    def is_replay(self) -> bool:
        return self.replay_response is not None

    @property
    def lease_marker(self) -> str | None:
        return f"lease:{self.lease_token}" if self.lease_token else None


def canonical_request_hash(value: Any) -> str:
    serialized = json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
        default=str,
    )
    return _digest(serialized)


def normalize_idempotency_key(value: str | None) -> str | None:
    key = (value or "").strip()
    if not key:
        return None
    if not _KEY_PATTERN.fullmatch(key):
        raise HTTPException(
            status_code=400,
            detail="Idempotency-Key must be 8-255 URL-safe characters.",
        )
    return key


def keyed_fingerprint(value: str) -> str:
    """Return a non-reversible stable identifier for a provider reference."""
    return _digest(value)


def provider_idempotency_key(
    prefix: str,
    *,
    operation: str,
    scope: str,
    key: str,
) -> str:
    """Build a provider key with explicit operation and tenant scoping."""
    safe_prefix = re.sub(r"[^A-Za-z0-9_-]", "-", prefix).strip("-")[:40] or "request"
    digest = _digest(f"{operation}\x00{scope}\x00{key}")
    return f"{safe_prefix}-{digest}"


def begin_idempotent_request(
    db: Session,
    *,
    operation: str,
    scope: str,
    key: str,
    request_hash: str,
    user_id: int | None,
) -> IdempotencyAttempt:
    """Reserve a request or return its encrypted completed response.

    The unique database constraint is the cross-process lock.  An interrupted
    request may be retried after ten minutes; normal retries while work is in
    progress receive 409 and must not consume quota again.
    """
    normalized_key = normalize_idempotency_key(key)
    if normalized_key is None:  # Defensive; callers only invoke this with a key.
        raise ValueError("An idempotency key is required")

    operation_value = operation.strip().lower()[:64]
    scope_hash = _digest(scope)
    key_hash = _digest(normalized_key)
    lease_token = secrets.token_hex(32)
    lease_marker = f"lease:{lease_token}"
    # Opportunistic bounded retention: encrypted generated content is only
    # needed for immediate network retries, never as long-term history.
    _cleanup_expired_records(db)
    record = IdempotencyRecord(
        operation=operation_value,
        scope_hash=scope_hash,
        key_hash=key_hash,
        request_hash=request_hash,
        status="in_progress",
        user_id=user_id,
        response_encrypted=lease_marker,
    )
    try:
        db.add(record)
        db.commit()
        db.refresh(record)
        return IdempotencyAttempt(record=record, lease_token=lease_token)
    except IntegrityError:
        db.rollback()

    existing = (
        db.query(IdempotencyRecord)
        .filter(
            IdempotencyRecord.operation == operation_value,
            IdempotencyRecord.scope_hash == scope_hash,
            IdempotencyRecord.key_hash == key_hash,
        )
        .first()
    )
    if existing is None:
        # A concurrent transaction may not be visible yet.  Returning a
        # conflict is safer than executing the unsafe operation twice.
        raise HTTPException(
            status_code=409,
            detail="The same request is already being processed.",
            headers={"Retry-After": "3"},
        )
    if existing.request_hash != request_hash:
        raise HTTPException(
            status_code=409,
            detail="Idempotency-Key was already used with a different request.",
        )

    if existing.status == "completed":
        replay_user_id = existing.user_id or user_id
        replay = (
            decrypt_json_for_user(replay_user_id, existing.response_encrypted)
            if replay_user_id
            else None
        )
        if isinstance(replay, dict):
            return IdempotencyAttempt(record=existing, replay_response=replay)
        # Never execute again when a completed record cannot be decrypted.
        raise HTTPException(
            status_code=409,
            detail="The completed request cannot be replayed safely.",
        )

    if existing.status == "in_progress" and not _is_stale(existing.updated_at):
        raise HTTPException(
            status_code=409,
            detail="The same request is already being processed.",
            headers={"Retry-After": "3"},
        )

    # Failed or abandoned work is reclaimed using a compare-and-swap.  Only
    # one concurrent retry can replace the observed status/lease marker.
    if not _claim_existing_record(
        db,
        existing=existing,
        user_id=user_id,
        lease_marker=lease_marker,
    ):
        raise HTTPException(
            status_code=409,
            detail="The same request is already being processed.",
            headers={"Retry-After": "3"},
        )
    db.refresh(existing)
    return IdempotencyAttempt(record=existing, lease_token=lease_token)


def complete_idempotent_request(
    db: Session,
    *,
    attempt: IdempotencyAttempt,
    user_id: int,
    response: dict[str, Any],
    resource_id: int | None = None,
    commit: bool = True,
) -> None:
    lease_marker = attempt.lease_marker
    if not lease_marker:
        raise RuntimeError("Cannot complete an idempotency replay without a lease")
    encrypted = encrypt_json_for_user(user_id, response)
    if not encrypted:
        # A response must never be persisted in plaintext as a fallback.
        raise RuntimeError("Unable to encrypt idempotent response")
    result = db.execute(
        update(IdempotencyRecord)
        .where(
            IdempotencyRecord.id == attempt.record.id,
            IdempotencyRecord.status == "in_progress",
            IdempotencyRecord.response_encrypted == lease_marker,
        )
        .values(
            status="completed",
            user_id=user_id,
            resource_id=resource_id,
            response_encrypted=encrypted,
            updated_at=datetime.now(timezone.utc),
        )
    )
    if (result.rowcount or 0) != 1:
        raise RuntimeError("Idempotency lease was lost before completion")
    if commit:
        db.commit()


def fail_idempotent_request(
    db: Session,
    *,
    attempt: IdempotencyAttempt | None,
) -> None:
    if attempt is None or not attempt.lease_marker:
        return
    try:
        db.execute(
            update(IdempotencyRecord)
            .where(
                IdempotencyRecord.id == attempt.record.id,
                IdempotencyRecord.status == "in_progress",
                IdempotencyRecord.response_encrypted == attempt.lease_marker,
            )
            .values(
                status="failed",
                response_encrypted=None,
                updated_at=datetime.now(timezone.utc),
            )
        )
        db.commit()
    except Exception:
        db.rollback()


def _is_stale(value: datetime | None) -> bool:
    if value is None:
        return True
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return datetime.now(timezone.utc) - value > _IN_PROGRESS_TIMEOUT


def _claim_existing_record(
    db: Session,
    *,
    existing: IdempotencyRecord,
    user_id: int | None,
    lease_marker: str,
) -> bool:
    conditions = [
        IdempotencyRecord.id == existing.id,
        IdempotencyRecord.status == existing.status,
        IdempotencyRecord.request_hash == existing.request_hash,
    ]
    if existing.response_encrypted is None:
        conditions.append(IdempotencyRecord.response_encrypted.is_(None))
    else:
        conditions.append(IdempotencyRecord.response_encrypted == existing.response_encrypted)
    result = db.execute(
        update(IdempotencyRecord)
        .where(*conditions)
        .values(
            status="in_progress",
            response_encrypted=lease_marker,
            resource_id=None,
            user_id=user_id or existing.user_id,
            updated_at=datetime.now(timezone.utc),
        )
    )
    if (result.rowcount or 0) != 1:
        db.rollback()
        return False
    db.commit()
    return True


def _cleanup_expired_records(db: Session) -> None:
    global _last_cleanup_monotonic
    current_monotonic = monotonic()
    if current_monotonic - _last_cleanup_monotonic < _CLEANUP_INTERVAL_SECONDS:
        return
    with _cleanup_lock:
        current_monotonic = monotonic()
        if current_monotonic - _last_cleanup_monotonic < _CLEANUP_INTERVAL_SECONDS:
            return
        db.execute(
            delete(IdempotencyRecord).where(
                IdempotencyRecord.created_at < datetime.now(timezone.utc) - _RECORD_RETENTION
            )
        )
        _last_cleanup_monotonic = current_monotonic


def _digest(value: str) -> str:
    """Keyed digest prevents offline guessing of emails/CV/password material."""
    return hmac.new(
        settings.jwt_secret.encode("utf-8"),
        value.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

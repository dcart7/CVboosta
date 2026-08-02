import hashlib
import hmac
import json
import logging
import secrets
import time
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import func, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
try:
    import stripe  # type: ignore
except ModuleNotFoundError:  # pragma: no cover
    stripe = None  # type: ignore

from app.api.routes.auth import get_current_user
from app.core.config import get_cors_origins, settings
from app.db.session import get_db
from app.models.activity import ActivityLog
from app.models.billing import (
    AppStorePurchaseOwner,
    AppStoreTransaction,
    PendingStripeCheckout,
    StripePaymentApplication,
)
from app.models.user import User
from app.services.activity_logger import record_activity
from app.services.analysis_crypto import decrypt_json_for_user, encrypt_json_for_user
from app.services.app_store import (
    get_app_store_product_config,
    get_app_store_scan_credit_balance,
    get_or_create_billing_entitlement,
    millis_to_datetime,
    normalize_app_store_environment,
    refresh_app_store_entitlement_from_transactions,
    verify_and_decode_app_store_transaction,
)
from app.services.idempotency import (
    begin_idempotent_request,
    canonical_request_hash,
    complete_idempotent_request,
    fail_idempotent_request,
    keyed_fingerprint,
    normalize_idempotency_key,
    provider_idempotency_key,
)
from app.services.entitlements import lifetime_tier_is_verified

router = APIRouter()
logger = logging.getLogger(__name__)

SIGNATURE_MAX_AGE_SECONDS = 5 * 60


class StripeCheckoutRequest(BaseModel):
    tier: str = Field(min_length=1, max_length=32)
    billing_cycle: str | None = Field(default=None, max_length=16)
    success_url: str | None = Field(default=None, max_length=2048)
    cancel_url: str | None = Field(default=None, max_length=2048)


class AppStoreSyncRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    product_id: str = Field(min_length=1, max_length=120)
    transaction_id: str = Field(min_length=1, max_length=128)
    original_transaction_id: str | None = Field(default=None, max_length=128)
    transaction_jws: str = Field(min_length=20, max_length=20000)
    expires_at: datetime | None = None
    environment: str | None = None
    quantity: int = Field(default=1, ge=1, le=1)


def _safe_checkout_redirect_url(
    candidate_url: str | None,
    *,
    allowed_origins: set[str],
    fallback_url: str,
) -> str:
    value = (candidate_url or "").strip()
    if not value:
        return fallback_url
    # Prevent open redirect abuse: only allow redirects to trusted frontend origins.
    origin = _extract_origin(value)
    if origin and origin in allowed_origins:
        return value
    return fallback_url


def _normalize_origin(value: str | None) -> str | None:
    raw = (value or "").strip()
    if not raw:
        return None
    return raw.rstrip("/")


def _extract_origin(url: str | None) -> str | None:
    raw = (url or "").strip()
    if not raw:
        return None
    parsed = urlparse(raw)
    if parsed.scheme and parsed.netloc:
        return f"{parsed.scheme}://{parsed.netloc}".rstrip("/")
    return None


def _stripe_to_dict(value: Any) -> dict[str, Any]:
    if isinstance(value, dict):
        return value
    to_dict_recursive = getattr(value, "to_dict_recursive", None)
    if callable(to_dict_recursive):
        result = to_dict_recursive()
        if isinstance(result, dict):
            return result
    try:
        return dict(value)
    except Exception:
        return {}


def _price_id_from_line_items(value: Any) -> str | None:
    value_dict = _stripe_to_dict(value)
    rows = value_dict.get("data") if value_dict else getattr(value, "data", None)
    if not isinstance(rows, list) or not rows:
        return None
    first = rows[0]
    first_dict = _stripe_to_dict(first)
    price = first_dict.get("price") if first_dict else getattr(first, "price", None)
    price_dict = _stripe_to_dict(price)
    price_id = price_dict.get("id") if price_dict else getattr(price, "id", None)
    return str(price_id).strip() if price_id else None


def _from_unix_ts(value: Any) -> datetime | None:
    if isinstance(value, (int, float)):
        try:
            return datetime.fromtimestamp(value, tz=timezone.utc)
        except Exception:
            return None
    return None


def _parse_paddle_signature(signature_header: str) -> tuple[int, str] | None:
    try:
        parts = [p.strip() for p in signature_header.split(";") if p.strip()]
        values: dict[str, str] = {}
        for part in parts:
            if "=" not in part:
                continue
            key, value = part.split("=", 1)
            values[key.strip()] = value.strip()
        ts_raw = values.get("ts")
        h1 = values.get("h1")
        if not ts_raw or not h1:
            return None
        return int(ts_raw), h1
    except Exception:
        return None


def verify_paddle_webhook(
    request_body: bytes,
    signature_header: str | None,
    secret: str | None,
) -> bool:
    if not secret or not signature_header:
        return False
    parsed = _parse_paddle_signature(signature_header)
    if not parsed:
        return False

    timestamp, provided_signature = parsed
    now = int(time.time())
    if abs(now - timestamp) > SIGNATURE_MAX_AGE_SECONDS:
        return False

    signed_payload = f"{timestamp}:".encode("utf-8") + request_body
    expected_signature = hmac.new(
        secret.encode("utf-8"),
        signed_payload,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected_signature, provided_signature)


def _extract_email(payload: dict[str, Any]) -> str | None:
    customer = payload.get("customer") or {}
    custom_data = payload.get("custom_data") or {}
    email = (
        customer.get("email")
        or payload.get("customer_email")
        or custom_data.get("email")
    )
    if isinstance(email, str) and email.strip():
        return email.strip().lower()
    return None


def _extract_price_ids(payload: dict[str, Any]) -> set[str]:
    ids: set[str] = set()
    items = payload.get("items") or []
    if isinstance(items, list):
        for item in items:
            if not isinstance(item, dict):
                continue
            price_obj = item.get("price")
            if isinstance(price_obj, dict):
                pid = price_obj.get("id")
                if isinstance(pid, str) and pid:
                    ids.add(pid)
            pid_direct = item.get("price_id")
            if isinstance(pid_direct, str) and pid_direct:
                ids.add(pid_direct)
    return ids


def _resolve_tier(payload: dict[str, Any]) -> str | None:
    custom_data = payload.get("custom_data") or {}
    tier = custom_data.get("tier")
    if isinstance(tier, str) and tier.strip():
        normalized = tier.strip().lower()
        mapping = {
            "single_scan": "single",
            "single": "single",
            "go": "go",
            "pro": "pro",
            "lifetime": "lifetime",
        }
        if normalized in mapping:
            return mapping[normalized]

    price_ids = _extract_price_ids(payload)
    id_map = {
        settings.paddle_price_single_scan: "single",
        settings.paddle_price_go_weekly: "go",
        settings.paddle_price_go_monthly: "go",
        settings.paddle_price_pro_weekly: "pro",
        settings.paddle_price_pro_monthly: "pro",
        settings.paddle_price_lifetime: "lifetime",
    }
    for price_id, mapped_tier in id_map.items():
        if price_id and price_id in price_ids:
            return mapped_tier
    return None


def _resolve_stripe_tier_by_price_id(price_id: str | None) -> str | None:
    if not price_id:
        return None
    price_map = {
        settings.stripe_price_single_scan: "single",
        settings.stripe_price_go_weekly: "go",
        settings.stripe_price_go_monthly: "go",
        settings.stripe_price_pro_weekly: "pro",
        settings.stripe_price_pro_monthly: "pro",
        settings.stripe_price_lifetime: "lifetime",
    }
    return price_map.get(price_id)


def _resolve_stripe_cycle_by_price_id(price_id: str | None) -> str | None:
    if not price_id:
        return None
    weekly_prices = {
        settings.stripe_price_go_weekly,
        settings.stripe_price_pro_weekly,
    }
    monthly_prices = {
        settings.stripe_price_go_monthly,
        settings.stripe_price_pro_monthly,
    }
    if price_id in weekly_prices:
        return "week"
    if price_id in monthly_prices:
        return "month"
    return None


def _resolve_stripe_price_for_checkout(tier: str, billing_cycle: str | None) -> tuple[str, str]:
    tier_key = (tier or "").strip().lower()
    cycle_key = (billing_cycle or "").strip().lower()
    if tier_key == "single":
        if not settings.stripe_price_single_scan:
            raise HTTPException(status_code=500, detail="Stripe single scan price is not configured.")
        return settings.stripe_price_single_scan, "payment"
    if tier_key == "lifetime":
        if not settings.stripe_price_lifetime:
            raise HTTPException(status_code=500, detail="Stripe lifetime price is not configured.")
        return settings.stripe_price_lifetime, "payment"
    if tier_key == "go":
        if cycle_key == "week":
            if not settings.stripe_price_go_weekly:
                raise HTTPException(status_code=500, detail="Stripe Go weekly price is not configured.")
            return settings.stripe_price_go_weekly, "subscription"
        if not settings.stripe_price_go_monthly:
            raise HTTPException(status_code=500, detail="Stripe Go monthly price is not configured.")
        return settings.stripe_price_go_monthly, "subscription"
    if tier_key == "pro":
        if cycle_key == "week":
            if not settings.stripe_price_pro_weekly:
                raise HTTPException(status_code=500, detail="Stripe Pro weekly price is not configured.")
            return settings.stripe_price_pro_weekly, "subscription"
        if not settings.stripe_price_pro_monthly:
            raise HTTPException(status_code=500, detail="Stripe Pro monthly price is not configured.")
        return settings.stripe_price_pro_monthly, "subscription"
    raise HTTPException(status_code=400, detail="Unknown checkout tier.")


def _extract_stripe_subscription_tier(subscription_obj: dict[str, Any]) -> str | None:
    items = subscription_obj.get("items", {}).get("data", [])
    if not isinstance(items, list) or not items:
        return None
    first_item = items[0] if isinstance(items[0], dict) else {}
    price_obj = first_item.get("price", {})
    if not isinstance(price_obj, dict):
        return None
    return _resolve_stripe_tier_by_price_id(price_obj.get("id"))


_NONTERMINAL_STRIPE_SUBSCRIPTION_STATUSES = {
    "active",
    "incomplete",
    "past_due",
    "paused",
    "trialing",
    "unpaid",
}
_ACCESS_GRANTING_STRIPE_SUBSCRIPTION_STATUSES = {"active", "trialing"}
_PENDING_CHECKOUT_LEASE_TIMEOUT = timedelta(minutes=10)


@dataclass(frozen=True)
class _PendingCheckoutAttempt:
    record_id: int
    lease_token: str | None
    generation: int
    old_session_id: str | None = None
    old_session_active: bool = False
    replay_response: dict[str, Any] | None = None


def _as_aware(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _verified_current_period_end(value: Any) -> datetime | None:
    period_end = _from_unix_ts(value)
    aware = _as_aware(period_end)
    if aware is None or aware <= datetime.now(timezone.utc):
        return None
    return aware


def _begin_pending_subscription_checkout(
    db: Session,
    *,
    user_id: int,
    request_hash: str,
) -> _PendingCheckoutAttempt:
    now = datetime.now(timezone.utc)
    lease_token = secrets.token_hex(32)
    existing = (
        db.query(PendingStripeCheckout)
        .filter(PendingStripeCheckout.user_id == user_id)
        .first()
    )
    if existing is None:
        record = PendingStripeCheckout(
            user_id=user_id,
            request_hash=request_hash,
            status="creating",
            lease_token=lease_token,
            generation=1,
        )
        try:
            db.add(record)
            db.commit()
            db.refresh(record)
            return _PendingCheckoutAttempt(record.id, lease_token, 1)
        except IntegrityError:
            db.rollback()
            existing = (
                db.query(PendingStripeCheckout)
                .filter(PendingStripeCheckout.user_id == user_id)
                .first()
            )
            if existing is None:
                raise HTTPException(status_code=409, detail="Checkout is already being prepared.")

    expires_at = _as_aware(existing.expires_at)
    if (
        existing.status == "ready"
        and existing.request_hash == request_hash
        and expires_at is not None
        and expires_at > now
        and existing.response_encrypted
    ):
        replay = decrypt_json_for_user(user_id, existing.response_encrypted)
        if isinstance(replay, dict):
            return _PendingCheckoutAttempt(
                existing.id,
                None,
                int(existing.generation or 1),
                replay_response=replay,
            )

    updated_at = _as_aware(existing.updated_at)
    if (
        existing.status == "creating"
        and updated_at is not None
        and now - updated_at <= _PENDING_CHECKOUT_LEASE_TIMEOUT
    ):
        raise HTTPException(
            status_code=409,
            detail="Checkout is already being prepared.",
            headers={"Retry-After": "3"},
        )

    old_session_id = existing.session_id if existing.status == "ready" else None
    next_generation = int(existing.generation or 0) + 1
    result = db.execute(
        update(PendingStripeCheckout)
        .where(
            PendingStripeCheckout.id == existing.id,
            PendingStripeCheckout.status == existing.status,
            PendingStripeCheckout.request_hash == existing.request_hash,
            PendingStripeCheckout.generation == existing.generation,
        )
        .values(
            request_hash=request_hash,
            status="creating",
            lease_token=lease_token,
            generation=next_generation,
            session_id=None,
            response_encrypted=None,
            expires_at=None,
            updated_at=now,
        )
    )
    if (result.rowcount or 0) != 1:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Checkout is already being prepared.",
            headers={"Retry-After": "3"},
        )
    db.commit()
    return _PendingCheckoutAttempt(
        existing.id,
        lease_token,
        next_generation,
        old_session_id=old_session_id,
        old_session_active=bool(expires_at and expires_at > now),
    )


def _complete_pending_subscription_checkout(
    db: Session,
    *,
    attempt: _PendingCheckoutAttempt,
    user_id: int,
    session_id: str,
    response: dict[str, Any],
    expires_at: datetime,
) -> None:
    encrypted = encrypt_json_for_user(user_id, response)
    if not encrypted or not attempt.lease_token:
        raise RuntimeError("Unable to persist pending checkout safely")
    result = db.execute(
        update(PendingStripeCheckout)
        .where(
            PendingStripeCheckout.id == attempt.record_id,
            PendingStripeCheckout.status == "creating",
            PendingStripeCheckout.lease_token == attempt.lease_token,
            PendingStripeCheckout.generation == attempt.generation,
        )
        .values(
            status="ready",
            lease_token=None,
            session_id=session_id,
            response_encrypted=encrypted,
            expires_at=expires_at,
            updated_at=datetime.now(timezone.utc),
        )
    )
    if (result.rowcount or 0) != 1:
        db.rollback()
        raise RuntimeError("Pending checkout lease was lost")
    db.commit()


def _fail_pending_subscription_checkout(
    db: Session,
    attempt: _PendingCheckoutAttempt | None,
) -> None:
    if attempt is None or not attempt.lease_token:
        return
    try:
        db.execute(
            update(PendingStripeCheckout)
            .where(
                PendingStripeCheckout.id == attempt.record_id,
                PendingStripeCheckout.status == "creating",
                PendingStripeCheckout.lease_token == attempt.lease_token,
                PendingStripeCheckout.generation == attempt.generation,
            )
            .values(
                status="failed",
                lease_token=None,
                updated_at=datetime.now(timezone.utc),
            )
        )
        db.commit()
    except Exception:
        db.rollback()


def _ensure_no_existing_recurring_plan(
    db: Session,
    *,
    current_user: User,
) -> None:
    """Fail safely before creating a second recurring subscription."""
    if (current_user.subscription_tier or "").strip().lower() == "lifetime":
        if lifetime_tier_is_verified(db, current_user):
            raise HTTPException(
                status_code=409,
                detail="This account already has lifetime access.",
            )
        current_user.subscription_tier = "free"
        current_user.subscription_active_until = None
        db.add(current_user)
        db.commit()
    app_store_entitlement = refresh_app_store_entitlement_from_transactions(db, current_user.id)
    if (
        app_store_entitlement
        and app_store_entitlement.is_active
        and app_store_entitlement.plan in {"go", "pro", "lifetime"}
    ):
        raise HTTPException(
            status_code=409,
            detail="An active App Store plan already exists. Manage it in Apple subscriptions first.",
        )

    subscription_id = (current_user.paddle_subscription_id or "").strip()
    if subscription_id:
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
        except Exception as exc:
            # A transient Stripe failure must not open a path to double billing.
            raise HTTPException(
                status_code=503,
                detail="Unable to verify the current subscription. Please try again shortly.",
            ) from exc
        subscription_data = _stripe_to_dict(subscription)
        status = str(subscription_data.get("status") or "").lower()
        if status in _NONTERMINAL_STRIPE_SUBSCRIPTION_STATUSES:
            raise HTTPException(
                status_code=409,
                detail="An active subscription already exists. Manage or cancel it before changing plans.",
            )
        if status in {"canceled", "incomplete_expired"}:
            current_user.paddle_subscription_id = None
            current_user.subscription_active_until = None
            db.add(current_user)
            db.commit()

    customer_id = (current_user.paddle_customer_id or "").strip()
    if not customer_id.startswith("cus_"):
        return
    try:
        subscriptions = stripe.Subscription.list(customer=customer_id, status="all", limit=10)
        subscription_rows = getattr(subscriptions, "data", None)
        if subscription_rows is None and isinstance(subscriptions, dict):
            subscription_rows = subscriptions.get("data", [])
        for subscription in subscription_rows or []:
            subscription_data = _stripe_to_dict(subscription)
            status = str(subscription_data.get("status") or "").lower()
            if status in _NONTERMINAL_STRIPE_SUBSCRIPTION_STATUSES:
                raise HTTPException(
                    status_code=409,
                    detail="An active subscription already exists. Manage or cancel it before changing plans.",
                )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Unable to verify existing subscriptions. Please try again shortly.",
        ) from exc


def _get_or_create_stripe_customer(db: Session, *, current_user: User) -> str:
    customer_id = (current_user.paddle_customer_id or "").strip()
    if customer_id.startswith("cus_"):
        return customer_id
    try:
        customer = stripe.Customer.create(
            email=current_user.email,
            metadata={"user_id": str(current_user.id)},
            idempotency_key=provider_idempotency_key(
                "cvboosta-customer",
                operation="stripe.customer.create",
                scope=f"user:{current_user.id}",
                key="v1",
            ),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Unable to prepare the billing customer. Please try again.",
        ) from exc
    customer_data = _stripe_to_dict(customer)
    created_customer_id = str(
        customer_data.get("id") or getattr(customer, "id", "") or ""
    ).strip()
    if not created_customer_id.startswith("cus_"):
        raise HTTPException(status_code=502, detail="Stripe returned an invalid customer.")
    current_user.paddle_customer_id = created_customer_id
    db.add(current_user)
    db.commit()
    return created_customer_id


def _has_stronger_non_stripe_entitlement(db: Session, user: User) -> bool:
    if (
        (user.subscription_tier or "").strip().lower() == "lifetime"
        and lifetime_tier_is_verified(db, user)
    ):
        return True
    entitlement = refresh_app_store_entitlement_from_transactions(db, user.id)
    return bool(
        entitlement
        and entitlement.is_active
        and entitlement.plan in {"go", "pro", "lifetime"}
    )


def _preserve_entitlement_on_stripe_downgrade(db: Session, user: User) -> bool:
    return (
        (user.subscription_tier or "").strip().lower() == "single"
        or _has_stronger_non_stripe_entitlement(db, user)
    )


def _apply_paid_tier_to_user(
    user: User,
    *,
    resolved_tier: str,
    customer_id: str | None = None,
    subscription_id: str | None = None,
    period_end_dt: datetime | None = None,
) -> None:
    previous_tier = (user.subscription_tier or "").lower()
    user.subscription_tier = resolved_tier
    if resolved_tier == "single":
        if previous_tier != "single":
            user.daily_scans_count = 0
            user.daily_cl_count = 0
            user.daily_prep_count = 0
        # Single Scan is credit-based: each purchase adds one full bundle.
        user.daily_scans_count += 1
        user.daily_cl_count += 1
        user.daily_prep_count += 1
        user.paddle_subscription_id = None
        user.subscription_active_until = None
    else:
        # Non-single tiers are usage-based; keep counters as usage counters.
        user.daily_scans_count = 0
        user.daily_cl_count = 0
        user.daily_prep_count = 0
    if customer_id:
        user.paddle_customer_id = customer_id
    if subscription_id:
        user.paddle_subscription_id = subscription_id
    if period_end_dt is not None:
        user.subscription_active_until = period_end_dt


def _find_user_for_stripe_object(db: Session, payload: dict[str, Any]) -> User | None:
    metadata = payload.get("metadata") or {}
    id_candidates = [
        metadata.get("user_id"),
        payload.get("client_reference_id"),
    ]
    for candidate in id_candidates:
        if candidate is None:
            continue
        try:
            user_id = int(str(candidate).strip())
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                return user
        except Exception:
            continue

    emails: list[str] = []
    if isinstance(payload.get("customer_details"), dict):
        details_email = payload.get("customer_details", {}).get("email")
        if isinstance(details_email, str) and details_email.strip():
            emails.append(details_email.strip())
    for value in [metadata.get("email"), payload.get("customer_email")]:
        if isinstance(value, str) and value.strip():
            emails.append(value.strip())
    for email in emails:
        normalized = email.lower()
        user = db.query(User).filter(func.lower(User.email) == normalized).first()
        if user:
            return user

    customer_id = payload.get("customer")
    if isinstance(customer_id, str) and customer_id:
        return db.query(User).filter(User.paddle_customer_id == customer_id).first()
    return None


def _session_already_applied(
    db: Session,
    *,
    user_id: int,
    session_id: str | None,
    resolved_tier: str,
) -> bool:
    sid = str(session_id or "").strip()
    if not sid:
        return False
    durable = (
        db.query(StripePaymentApplication)
        .filter(
            StripePaymentApplication.provider == "stripe_checkout",
            StripePaymentApplication.reference_id == sid,
        )
        .first()
    )
    if durable is not None:
        if durable.user_id != user_id or durable.tier != resolved_tier:
            raise HTTPException(status_code=409, detail="Stripe payment ownership conflict.")
        return True
    try:
        return (
            db.query(ActivityLog.id)
            .filter(ActivityLog.user_id == user_id)
            .filter(ActivityLog.action.in_(["Stripe purchase applied", "Stripe checkout completed"]))
            .filter(ActivityLog.meta["session_id"].as_string() == sid)
            .first()
            is not None
        )
    except Exception:
        db.rollback()
        logs = (
            db.query(ActivityLog)
            .filter(ActivityLog.user_id == user_id)
            .filter(ActivityLog.action.in_(["Stripe purchase applied", "Stripe checkout completed"]))
            .all()
        )
    for log in logs:
        meta = log.meta if isinstance(log.meta, dict) else {}
        if str(meta.get("session_id") or "").strip() == sid:
            return True
    return False


def _reserve_stripe_payment_application(
    db: Session,
    *,
    user_id: int,
    session_id: str,
    resolved_tier: str,
) -> bool:
    """Reserve a permanent payment ledger row in the caller's transaction."""
    existing = (
        db.query(StripePaymentApplication)
        .filter(
            StripePaymentApplication.provider == "stripe_checkout",
            StripePaymentApplication.reference_id == session_id,
        )
        .first()
    )
    if existing is not None:
        if existing.user_id != user_id or existing.tier != resolved_tier:
            raise HTTPException(status_code=409, detail="Stripe payment ownership conflict.")
        return False

    ledger = StripePaymentApplication(
        provider="stripe_checkout",
        reference_id=session_id,
        user_id=user_id,
        tier=resolved_tier,
    )
    try:
        # A savepoint confines a concurrent unique-key loss to this insert.
        # The caller's idempotency lease and other transaction state survive.
        with db.begin_nested():
            db.add(ledger)
            db.flush()
        return True
    except IntegrityError:
        pass

    existing = (
        db.query(StripePaymentApplication)
        .filter(
            StripePaymentApplication.provider == "stripe_checkout",
            StripePaymentApplication.reference_id == session_id,
        )
        .first()
    )
    if existing is None:
        raise HTTPException(
            status_code=409,
            detail="The payment is already being applied.",
            headers={"Retry-After": "3"},
        )
    if existing.user_id != user_id or existing.tier != resolved_tier:
        raise HTTPException(status_code=409, detail="Stripe payment ownership conflict.")
    return False


def _record_historical_stripe_application(
    db: Session,
    *,
    user_id: int,
    session_id: str,
    resolved_tier: str,
) -> None:
    """Backfill the durable ledger for purchases applied before it existed."""
    try:
        if _reserve_stripe_payment_application(
            db,
            user_id=user_id,
            session_id=session_id,
            resolved_tier=resolved_tier,
        ):
            db.commit()
    except HTTPException:
        db.rollback()


@router.post("/stripe/checkout-session")
def create_stripe_checkout_session(
    payload: StripeCheckoutRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
):
    if stripe is None or not settings.stripe_secret_key:
        raise HTTPException(status_code=500, detail="Stripe secret key is not configured.")
    stripe.api_key = settings.stripe_secret_key

    price_id, mode = _resolve_stripe_price_for_checkout(payload.tier, payload.billing_cycle)

    request_origin = f"{request.url.scheme}://{request.url.netloc}".rstrip("/")
    request_header_origin = _normalize_origin(request.headers.get("origin"))
    referer_origin = _extract_origin(request.headers.get("referer"))

    allowed_origins: set[str] = {request_origin}
    for value in get_cors_origins():
        normalized = _normalize_origin(value)
        if normalized:
            allowed_origins.add(normalized)

    payload_success_origin = _extract_origin(payload.success_url)
    payload_cancel_origin = _extract_origin(payload.cancel_url)
    preferred_frontend_origin = next(
        (
            origin
            for origin in [
                payload_success_origin,
                payload_cancel_origin,
                request_header_origin,
                referer_origin,
            ]
            if origin and origin in allowed_origins
        ),
        None,
    )
    if not preferred_frontend_origin:
        preferred_frontend_origin = next(
            (
                origin
                for origin in allowed_origins
                if origin.startswith("https://")
                and "localhost" not in origin
                and "127.0.0.1" not in origin
                and origin != request_origin
            ),
            request_origin,
        )

    success_fallback = (
        f"{preferred_frontend_origin}/account?billing=success&session_id={{CHECKOUT_SESSION_ID}}"
    )
    cancel_fallback = f"{preferred_frontend_origin}/pricing?billing=cancel"
    success_url = _safe_checkout_redirect_url(
        payload.success_url, allowed_origins=allowed_origins, fallback_url=success_fallback
    )
    cancel_url = _safe_checkout_redirect_url(
        payload.cancel_url, allowed_origins=allowed_origins, fallback_url=cancel_fallback
    )

    metadata = {
        "user_id": str(current_user.id),
        "tier": payload.tier.lower(),
        "period": (payload.billing_cycle or "one_time").lower(),
        "price_id": price_id,
    }

    request_fingerprint = canonical_request_hash(
        {
            "tier": payload.tier.strip().lower(),
            "billing_cycle": (payload.billing_cycle or "").strip().lower(),
            "price_id": price_id,
            "mode": mode,
            "success_url": success_url,
            "cancel_url": cancel_url,
        }
    )
    normalized_key = normalize_idempotency_key(idempotency_key)
    if normalized_key is None:
        # Backward-compatible protection for older clients.  Subscription
        # checkout sessions are reusable for 30 minutes; one-time payments use
        # a shorter window so intentional repeat purchases remain possible.
        window_seconds = 1800 if mode == "subscription" else 60
        normalized_key = (
            f"auto:{current_user.id}:{int(time.time() // window_seconds)}:{request_fingerprint[:24]}"
        )
    attempt = begin_idempotent_request(
        db,
        operation="stripe.checkout",
        scope=f"user:{current_user.id}",
        key=normalized_key,
        request_hash=request_fingerprint,
        user_id=current_user.id,
    )
    if attempt.is_replay:
        return attempt.replay_response

    pending_attempt: _PendingCheckoutAttempt | None = None
    try:
        _ensure_no_existing_recurring_plan(db, current_user=current_user)
        stripe_customer_id = _get_or_create_stripe_customer(db, current_user=current_user)
        if mode == "subscription":
            pending_attempt = _begin_pending_subscription_checkout(
                db,
                user_id=current_user.id,
                request_hash=request_fingerprint,
            )
            if pending_attempt.replay_response is not None:
                complete_idempotent_request(
                    db,
                    attempt=attempt,
                    user_id=current_user.id,
                    response=pending_attempt.replay_response,
                )
                return pending_attempt.replay_response
            if pending_attempt.old_session_id and pending_attempt.old_session_active:
                # A different plan/cycle replaces—not coexists with—the prior
                # open recurring checkout for this account.
                stripe.checkout.Session.expire(pending_attempt.old_session_id)

        session_params: dict[str, Any] = {
            "mode": mode,
            "line_items": [{"price": price_id, "quantity": 1}],
            "success_url": success_url,
            "cancel_url": cancel_url,
            "customer": stripe_customer_id,
            "client_reference_id": str(current_user.id),
            "metadata": metadata,
        }
        if mode == "subscription":
            session_params["subscription_data"] = {"metadata": metadata}
            session_params["expires_at"] = int(time.time()) + 31 * 60
            metadata["checkout_fingerprint"] = request_fingerprint
        provider_key = normalized_key
        if mode == "subscription" and pending_attempt is not None:
            # Reuse only identical Stripe parameters. A generation changes
            # after an expired/replaced session so Stripe can create a fresh one.
            provider_key = (
                f"pending-recurring:{request_fingerprint}:"
                f"{pending_attempt.generation}"
            )
        stripe_idempotency_key = provider_idempotency_key(
            "cvboosta-checkout",
            operation="stripe.checkout.create",
            scope=f"user:{current_user.id}",
            key=provider_key,
        )
        checkout_session = stripe.checkout.Session.create(
            **session_params,
            idempotency_key=stripe_idempotency_key,
        )
    except Exception as exc:
        _fail_pending_subscription_checkout(db, pending_attempt)
        fail_idempotent_request(db, attempt=attempt)
        raise HTTPException(status_code=502, detail="Stripe checkout failed. Please try again.") from exc

    checkout_response = {
        "checkout_url": checkout_session.url,
        "session_id": checkout_session.id,
    }
    try:
        if mode == "subscription" and pending_attempt is not None:
            _complete_pending_subscription_checkout(
                db,
                attempt=pending_attempt,
                user_id=current_user.id,
                session_id=checkout_session.id,
                response=checkout_response,
                expires_at=datetime.now(timezone.utc) + timedelta(minutes=31),
            )
        complete_idempotent_request(
            db,
            attempt=attempt,
            user_id=current_user.id,
            response=checkout_response,
        )
    except Exception as exc:
        # Stripe's idempotency key still guarantees a retry resolves to the same
        # Checkout Session even when our local response cache cannot commit.
        fail_idempotent_request(db, attempt=attempt)
        raise HTTPException(
            status_code=503,
            detail="Checkout was created but could not be finalized. Retry the same request.",
        ) from exc
    return checkout_response


@router.post("/stripe/cancel-subscription")
def cancel_stripe_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=500, detail="Stripe secret key is not configured.")
    if not current_user.paddle_subscription_id:
        raise HTTPException(status_code=400, detail="No active subscription found.")

    stripe.api_key = settings.stripe_secret_key
    try:
        current = stripe.Subscription.retrieve(current_user.paddle_subscription_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to load subscription.") from exc

    current_data = _stripe_to_dict(current)
    status = str(current_data.get("status") or "").lower()
    if status in {"canceled", "incomplete_expired", "unpaid"}:
        current_user.subscription_tier = "free"
        current_user.paddle_subscription_id = None
        current_user.subscription_active_until = None
        db.add(current_user)
        db.commit()
        return {
            "status": "already_inactive",
            "cancel_at_period_end": False,
            "active_until": None,
        }

    updated = current
    if not bool(current_data.get("cancel_at_period_end")):
        try:
            updated = stripe.Subscription.modify(
                current_user.paddle_subscription_id,
                cancel_at_period_end=True,
            )
        except Exception as exc:
            raise HTTPException(status_code=400, detail="Unable to cancel subscription.") from exc

    updated_data = _stripe_to_dict(updated)
    period_end_dt = _from_unix_ts(updated_data.get("current_period_end"))
    current_user.subscription_active_until = period_end_dt
    db.add(current_user)
    db.commit()
    record_activity(
        db,
        user_id=current_user.id,
        action="Stripe cancellation scheduled",
        meta={"subscription_id": current_user.paddle_subscription_id},
    )
    return {
        "status": "scheduled",
        "cancel_at_period_end": bool(updated_data.get("cancel_at_period_end")),
        "active_until": period_end_dt.isoformat() if period_end_dt else None,
    }


@router.post("/stripe/finalize-session")
def finalize_stripe_checkout_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=500, detail="Stripe secret key is not configured.")
    stripe.api_key = settings.stripe_secret_key

    try:
        checkout_raw = stripe.checkout.Session.retrieve(
            session_id,
            expand=["line_items.data.price"],
        )
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail={"code": "stripe_unavailable", "message": "Unable to load checkout session."},
            headers={"Retry-After": "3"},
        ) from exc

    checkout = _stripe_to_dict(checkout_raw)
    payment_status = str(checkout.get("payment_status") or "").lower()
    if payment_status not in {"paid", "no_payment_required"}:
        raise HTTPException(
            status_code=425,
            detail={"code": "payment_pending", "message": "Checkout session is not paid yet."},
            headers={"Retry-After": "3"},
        )

    metadata = checkout.get("metadata") or {}
    checkout_email = str((checkout.get("customer_details") or {}).get("email") or "").strip().lower()
    if checkout_email and checkout_email != current_user.email.lower():
        raise HTTPException(
            status_code=403,
            detail={"code": "foreign_checkout", "message": "This checkout session does not belong to current user."},
        )
    ref_user_id = str(checkout.get("client_reference_id") or "").strip()
    metadata_user_id = str(metadata.get("user_id") or "").strip()
    current_user_id = str(current_user.id)
    owner_ids = [value for value in (ref_user_id, metadata_user_id) if value]
    if not owner_ids or any(value != current_user_id for value in owner_ids):
        raise HTTPException(
            status_code=403,
            detail={"code": "foreign_checkout", "message": "This checkout session does not belong to current user."},
        )

    tier = str(metadata.get("tier") or "").strip().lower()
    metadata_tier = None
    if tier in {"single", "single_scan", "go", "pro", "lifetime"}:
        metadata_tier = "single" if tier in {"single", "single_scan"} else tier

    purchased_price_id = _price_id_from_line_items(checkout.get("line_items", {}))
    resolved_tier = _resolve_stripe_tier_by_price_id(purchased_price_id)
    if not resolved_tier or (metadata_tier and metadata_tier != resolved_tier):
        raise HTTPException(
            status_code=422,
            detail={"code": "invalid_checkout", "message": "Checkout price does not match a configured tier."},
        )

    billing_cycle = str(metadata.get("period") or "").strip().lower()
    if billing_cycle not in {"week", "month", "one_time"}:
        billing_cycle = _resolve_stripe_cycle_by_price_id(purchased_price_id) or "one_time"
    amount_raw = checkout.get("amount_total")
    amount = int(amount_raw) if isinstance(amount_raw, (int, float)) else None
    currency = str(checkout.get("currency") or "").strip().lower() or None
    provider_transaction = checkout.get("payment_intent")
    if isinstance(provider_transaction, dict):
        provider_transaction = provider_transaction.get("id")
    transaction_id = str(provider_transaction or session_id)

    def success_payload() -> dict[str, Any]:
        return {
            "status": "ok",
            "tier": resolved_tier,
            "billing_cycle": billing_cycle,
            "amount": amount,
            "currency": currency,
            "transaction_id": transaction_id,
        }

    if _session_already_applied(
        db,
        user_id=current_user.id,
        session_id=session_id,
        resolved_tier=resolved_tier,
    ):
        _record_historical_stripe_application(
            db,
            user_id=current_user.id,
            session_id=session_id,
            resolved_tier=resolved_tier,
        )
        return success_payload()

    purchase_attempt = begin_idempotent_request(
        db,
        operation="stripe.purchase.apply",
        scope=f"user:{current_user.id}",
        key=f"session:{session_id}",
        request_hash=canonical_request_hash(
            {"session_id": session_id, "tier": resolved_tier}
        ),
        user_id=current_user.id,
    )
    if purchase_attempt.is_replay:
        return purchase_attempt.replay_response

    customer_id = checkout.get("customer")
    customer_id_value = customer_id if isinstance(customer_id, str) else None
    subscription_id = checkout.get("subscription")
    subscription_id_value = subscription_id if isinstance(subscription_id, str) else None
    period_end_dt = None
    if subscription_id_value:
        try:
            subscription = stripe.Subscription.retrieve(subscription_id_value)
            sub_data = _stripe_to_dict(subscription)
            subscription_status = str(sub_data.get("status") or "").lower()
            period_end_dt = _verified_current_period_end(sub_data.get("current_period_end"))
            if (
                subscription_status not in _ACCESS_GRANTING_STRIPE_SUBSCRIPTION_STATUSES
                or period_end_dt is None
            ):
                fail_idempotent_request(db, attempt=purchase_attempt)
                raise HTTPException(
                    status_code=425,
                    detail={"code": "subscription_pending", "message": "The subscription is not active yet."},
                    headers={"Retry-After": "3"},
                )
        except HTTPException:
            raise
        except Exception as exc:
            fail_idempotent_request(db, attempt=purchase_attempt)
            raise HTTPException(
                status_code=503,
                detail="Unable to verify the subscription status.",
            ) from exc

    ledger_reserved = _reserve_stripe_payment_application(
        db,
        user_id=current_user.id,
        session_id=session_id,
        resolved_tier=resolved_tier,
    )
    if not ledger_reserved:
        purchase_response = success_payload()
        complete_idempotent_request(
            db,
            attempt=purchase_attempt,
            user_id=current_user.id,
            response=purchase_response,
        )
        return purchase_response

    try:
        _apply_paid_tier_to_user(
            current_user,
            resolved_tier=resolved_tier,
            customer_id=customer_id_value,
            subscription_id=subscription_id_value,
            period_end_dt=period_end_dt,
        )
        db.add(current_user)
        purchase_response = success_payload()
        complete_idempotent_request(
            db,
            attempt=purchase_attempt,
            user_id=current_user.id,
            response=purchase_response,
            commit=False,
        )
        db.commit()
    except Exception as exc:
        db.rollback()
        fail_idempotent_request(db, attempt=purchase_attempt)
        raise HTTPException(status_code=500, detail="Unable to apply the purchase safely.") from exc
    record_activity(
        db,
        user_id=current_user.id,
        action="Stripe purchase applied",
        meta={"tier": current_user.subscription_tier, "session_id": session_id, "source": "finalize"},
    )
    return purchase_response


@router.post("/stripe/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
    stripe_signature: str | None = Header(default=None, alias="Stripe-Signature"),
):
    if stripe is None or not settings.stripe_secret_key:
        raise HTTPException(status_code=500, detail="Stripe secret key is not configured.")
    stripe.api_key = settings.stripe_secret_key

    body = await request.body()
    event: dict[str, Any]
    if settings.stripe_webhook_secret:
        if not stripe_signature:
            raise HTTPException(status_code=400, detail="Missing Stripe-Signature")
        try:
            verified_event = stripe.Webhook.construct_event(
                payload=body,
                sig_header=stripe_signature,
                secret=settings.stripe_webhook_secret,
            )
        except Exception as exc:
            raise HTTPException(status_code=400, detail="Invalid webhook signature") from exc
        event = _stripe_to_dict(verified_event)
    else:
        if settings.app_env.lower() not in {"local", "dev", "development", "test"}:
            # Never accept unsigned billing events in production.
            raise HTTPException(status_code=503, detail="Stripe webhook verification is not configured.")
        try:
            parsed_event = json.loads(body.decode("utf-8"))
            event = parsed_event if isinstance(parsed_event, dict) else {}
        except Exception as exc:
            raise HTTPException(status_code=400, detail="Invalid webhook payload") from exc

    event_type = event.get("type")
    obj = event.get("data", {}).get("object", {})
    if not isinstance(obj, dict):
        return {"status": "ok"}

    user = _find_user_for_stripe_object(db, obj)
    if not user:
        return {"status": "ok", "message": "User not found"}

    if event_type in {
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
    }:
        payment_status = str(obj.get("payment_status") or "").lower()
        if payment_status not in {"paid", "no_payment_required"}:
            return {"status": "ok", "message": "Checkout payment is not complete"}
        metadata = obj.get("metadata") or {}
        session_id = obj.get("id") if isinstance(obj.get("id"), str) else None
        tier = (metadata.get("tier") or "").strip().lower()
        metadata_tier = None
        if tier in {"single", "single_scan", "go", "pro", "lifetime"}:
            metadata_tier = "single" if tier in {"single", "single_scan"} else tier
        if not session_id:
            raise HTTPException(status_code=400, detail="Stripe checkout session id is missing.")
        try:
            price_id = _price_id_from_line_items(obj.get("line_items", {}))
            if not price_id:
                line_items = stripe.checkout.Session.list_line_items(session_id, limit=1)
                price_id = _price_id_from_line_items(line_items)
        except Exception as exc:
            raise HTTPException(
                status_code=503,
                detail="Unable to verify Stripe checkout price.",
            ) from exc
        resolved_tier = _resolve_stripe_tier_by_price_id(price_id)
        if not resolved_tier or (metadata_tier and metadata_tier != resolved_tier):
            raise HTTPException(status_code=400, detail="Stripe checkout price is invalid.")

        if resolved_tier:
            if _session_already_applied(
                db,
                user_id=user.id,
                session_id=session_id,
                resolved_tier=resolved_tier,
            ):
                _record_historical_stripe_application(
                    db,
                    user_id=user.id,
                    session_id=session_id,
                    resolved_tier=resolved_tier,
                )
                return {"status": "ok"}
            purchase_attempt = begin_idempotent_request(
                db,
                operation="stripe.purchase.apply",
                scope=f"user:{user.id}",
                key=f"session:{session_id}",
                request_hash=canonical_request_hash(
                    {"session_id": session_id, "tier": resolved_tier}
                ),
                user_id=user.id,
            )
            if purchase_attempt.is_replay:
                return {"status": "ok"}
            customer_id = obj.get("customer")
            customer_id_value = customer_id if isinstance(customer_id, str) else None
            subscription_id = obj.get("subscription")
            subscription_id_value = subscription_id if isinstance(subscription_id, str) else None
            period_end_dt = None
            if subscription_id_value:
                try:
                    sub = stripe.Subscription.retrieve(subscription_id_value)
                    sub_data = _stripe_to_dict(sub)
                    subscription_status = str(sub_data.get("status") or "").lower()
                    period_end_dt = _verified_current_period_end(
                        sub_data.get("current_period_end")
                    )
                    if (
                        subscription_status not in _ACCESS_GRANTING_STRIPE_SUBSCRIPTION_STATUSES
                        or period_end_dt is None
                    ):
                        # Keep the current entitlement while payment/activation
                        # is pending; only record the provider ids to prevent a
                        # second subscription from being created.
                        user.paddle_subscription_id = subscription_id_value
                        if customer_id_value:
                            user.paddle_customer_id = customer_id_value
                        user.subscription_active_until = None
                        db.add(user)
                        db.commit()
                        fail_idempotent_request(db, attempt=purchase_attempt)
                        return {
                            "status": "ok",
                            "message": "Subscription is awaiting activation",
                        }
                except Exception as exc:
                    fail_idempotent_request(db, attempt=purchase_attempt)
                    raise HTTPException(
                        status_code=503,
                        detail="Unable to verify the subscription status.",
                    ) from exc
            ledger_reserved = _reserve_stripe_payment_application(
                db,
                user_id=user.id,
                session_id=session_id,
                resolved_tier=resolved_tier,
            )
            if not ledger_reserved:
                complete_idempotent_request(
                    db,
                    attempt=purchase_attempt,
                    user_id=user.id,
                    response={"status": "ok", "tier": user.subscription_tier},
                )
                return {"status": "ok"}
            try:
                _apply_paid_tier_to_user(
                    user,
                    resolved_tier=resolved_tier,
                    customer_id=customer_id_value,
                    subscription_id=subscription_id_value,
                    period_end_dt=period_end_dt,
                )
                db.add(user)
                complete_idempotent_request(
                    db,
                    attempt=purchase_attempt,
                    user_id=user.id,
                    response={"status": "ok", "tier": user.subscription_tier},
                    commit=False,
                )
                db.commit()
            except Exception as exc:
                db.rollback()
                fail_idempotent_request(db, attempt=purchase_attempt)
                raise HTTPException(status_code=500, detail="Unable to apply the purchase safely.") from exc
            record_activity(
                db,
                user_id=user.id,
                action="Stripe checkout completed",
                meta={
                    "tier": user.subscription_tier,
                    "event": event_type,
                    "session_id": session_id,
                    "source": "webhook",
                },
            )

    elif event_type in {"customer.subscription.deleted"}:
        event_subscription_id = obj.get("id") if isinstance(obj.get("id"), str) else None
        current_subscription_id = (user.paddle_subscription_id or "").strip()
        if not current_subscription_id or event_subscription_id != current_subscription_id:
            return {"status": "ok", "message": "Stale subscription event ignored"}
        if not _preserve_entitlement_on_stripe_downgrade(db, user):
            user.subscription_tier = "free"
        user.paddle_subscription_id = None
        user.subscription_active_until = None
        db.add(user)
        db.commit()
        record_activity(db, user_id=user.id, action="Stripe subscription canceled", meta={"event": event_type})

    elif event_type in {"customer.subscription.updated", "customer.subscription.created"}:
        items = obj.get("items", {}).get("data", [])
        price_id = None
        if isinstance(items, list) and items:
            price_obj = items[0].get("price", {})
            if isinstance(price_obj, dict):
                price_id = price_obj.get("id")
        tier = _resolve_stripe_tier_by_price_id(price_id)
        status = (obj.get("status") or "").lower()
        event_subscription_id = obj.get("id") if isinstance(obj.get("id"), str) else None
        stored_subscription_id = (user.paddle_subscription_id or "").strip()
        if not stored_subscription_id or event_subscription_id != stored_subscription_id:
            return {"status": "ok", "message": "Stale subscription event ignored"}
        verified_period_end = _verified_current_period_end(obj.get("current_period_end"))
        if status in {"canceled", "incomplete_expired"}:
            if not _preserve_entitlement_on_stripe_downgrade(db, user):
                user.subscription_tier = "free"
            user.paddle_subscription_id = None
            user.subscription_active_until = None
        elif (
            status in _ACCESS_GRANTING_STRIPE_SUBSCRIPTION_STATUSES
            and tier
            and verified_period_end is not None
        ):
            if not _has_stronger_non_stripe_entitlement(db, user):
                user.subscription_tier = tier
                user.subscription_active_until = verified_period_end
            customer_id = obj.get("customer")
            if isinstance(customer_id, str):
                user.paddle_customer_id = customer_id
        else:
            # incomplete/paused/past_due/unpaid and unknown statuses do not
            # grant access. Retain provider identifiers to prevent creation of
            # a second subscription while Stripe may still recover this one.
            if not _preserve_entitlement_on_stripe_downgrade(db, user):
                user.subscription_tier = "free"
            user.subscription_active_until = None
            if event_subscription_id:
                user.paddle_subscription_id = event_subscription_id
            customer_id = obj.get("customer")
            if isinstance(customer_id, str):
                user.paddle_customer_id = customer_id
        db.add(user)
        db.commit()
        record_activity(
            db,
            user_id=user.id,
            action="Stripe subscription updated",
            meta={"event": event_type, "status": status, "tier": user.subscription_tier},
        )

    return {"status": "ok"}

@router.post("/webhook")
async def paddle_webhook(
    request: Request,
    db: Session = Depends(get_db),
    paddle_signature: str = Header(None, alias="Paddle-Signature")
):
    if not settings.paddle_enabled:
        raise HTTPException(status_code=404, detail="Webhook provider is disabled.")
    body = await request.body()
    secret = settings.paddle_webhook_secret
    
    if not verify_paddle_webhook(body, paddle_signature, secret):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    try:
        data = json.loads(body)
        event_type = data.get("event_type") or data.get("eventType") or data.get("event")
        payload = data.get("data", {})
        if not isinstance(payload, dict):
            return {"status": "ok", "message": "No payload data"}

        email = _extract_email(payload)
        if not email:
            return {"status": "ok", "message": "No email found in event"}

        user = db.query(User).filter(User.email == email).first()
        if not user:
            return {"status": "ok", "message": "User not found"}

        subscription_events = {
            "subscription.created",
            "subscription.updated",
            "subscription.resumed",
            "subscription.activated",
        }
        cancel_events = {"subscription.canceled", "subscription.paused"}
        one_time_events = {"transaction.completed"}

        if event_type in subscription_events:
            resolved_tier = _resolve_tier(payload) or "go"
            user.subscription_tier = resolved_tier
            if isinstance(payload.get("id"), str):
                user.paddle_subscription_id = payload.get("id")
            if isinstance(payload.get("customer_id"), str):
                user.paddle_customer_id = payload.get("customer_id")
            db.add(user)
            db.commit()
            record_activity(
                db,
                user_id=user.id,
                action="Subscription updated",
                meta={"tier": user.subscription_tier, "event": event_type},
            )

        elif event_type in one_time_events:
            resolved_tier = _resolve_tier(payload)
            if resolved_tier in {"single", "lifetime"}:
                customer_id = payload.get("customer_id")
                customer_id_value = customer_id if isinstance(customer_id, str) else None
                _apply_paid_tier_to_user(
                    user,
                    resolved_tier=resolved_tier,
                    customer_id=customer_id_value,
                )
                db.add(user)
                db.commit()
                record_activity(
                    db,
                    user_id=user.id,
                    action="One-time purchase applied",
                    meta={"tier": user.subscription_tier, "event": event_type},
                )

        elif event_type == "subscription.canceled":
            user.subscription_tier = "free"
            user.paddle_subscription_id = None
            db.add(user)
            db.commit()
            record_activity(
                db,
                user_id=user.id,
                action="Subscription canceled",
                meta={"event": event_type},
            )
        elif event_type in cancel_events:
            user.subscription_tier = "free"
            user.paddle_subscription_id = None
            db.add(user)
            db.commit()
            record_activity(
                db,
                user_id=user.id,
                action="Subscription stopped",
                meta={"event": event_type},
            )

        return {"status": "ok"}
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        # Return a retryable failure without leaking customer or provider data.
        logger.exception("Paddle webhook processing failed")
        raise HTTPException(status_code=500, detail="Webhook processing failed") from exc

def _maybe_auto_downgrade_single_tier(current_user: User, db: Session) -> str:
    tier = current_user.subscription_tier
    if tier != "single":
        return tier
    if (
        current_user.daily_scans_count <= 0
        and current_user.daily_cl_count <= 0
        and current_user.daily_prep_count <= 0
    ):
        current_user.subscription_tier = "free"
        current_user.paddle_subscription_id = None
        current_user.subscription_active_until = None
        db.add(current_user)
        db.commit()
        record_activity(
            db,
            user_id=current_user.id,
            action="Single Scan quota exhausted",
            meta={"event": "single_scan_auto_downgrade"},
        )
        return "free"
    return tier


def _build_subscription_status(current_user: User, db: Session) -> dict[str, Any]:
    app_store_entitlement = refresh_app_store_entitlement_from_transactions(db, current_user.id)
    scan_credit_balance = get_app_store_scan_credit_balance(db, current_user.id)
    tier = current_user.subscription_tier
    active_until = current_user.subscription_active_until
    billing_cycle = None
    cancel_at_period_end = False
    source = "free"

    if (
        app_store_entitlement
        and app_store_entitlement.is_active
        and app_store_entitlement.plan in {"go", "pro", "lifetime"}
    ):
        tier = app_store_entitlement.plan
        active_until = app_store_entitlement.expires_at
        billing_cycle = "month" if tier in {"go", "pro"} else None
        source = "app_store"
        if current_user.subscription_tier == "single" and tier != "single":
            current_user.daily_scans_count = 0
            current_user.daily_cl_count = 0
            current_user.daily_prep_count = 0
        if tier != current_user.subscription_tier or active_until != current_user.subscription_active_until:
            current_user.subscription_tier = tier
            current_user.subscription_active_until = active_until
            db.add(current_user)
            db.commit()
    else:
        if tier == "lifetime" and not lifetime_tier_is_verified(
            db,
            current_user,
            app_store_entitlement=app_store_entitlement,
        ):
            current_user.subscription_tier = "free"
            current_user.subscription_active_until = None
            db.add(current_user)
            db.commit()
            tier = "free"
            active_until = None

        if tier in {"go", "pro"} and not current_user.paddle_subscription_id:
            current_user.subscription_tier = "free"
            current_user.subscription_active_until = None
            db.add(current_user)
            db.commit()
            tier = "free"
            active_until = None

        tier = _maybe_auto_downgrade_single_tier(current_user, db)
        active_until = current_user.subscription_active_until

        if settings.stripe_secret_key and current_user.paddle_subscription_id and stripe is not None:
            stripe.api_key = settings.stripe_secret_key
            try:
                sub = stripe.Subscription.retrieve(current_user.paddle_subscription_id)
                sub_data = _stripe_to_dict(sub)
                status = str(sub_data.get("status") or "").lower()
                if status in {"canceled", "incomplete_expired"}:
                    if not _preserve_entitlement_on_stripe_downgrade(db, current_user):
                        current_user.subscription_tier = "free"
                    current_user.paddle_subscription_id = None
                    current_user.subscription_active_until = None
                    db.add(current_user)
                    db.commit()
                    tier = current_user.subscription_tier
                    active_until = None
                elif status in _ACCESS_GRANTING_STRIPE_SUBSCRIPTION_STATUSES:
                    mapped_tier = _extract_stripe_subscription_tier(sub_data)
                    items = sub_data.get("items", {}).get("data", [])
                    if isinstance(items, list) and items:
                        price_obj = items[0].get("price", {})
                        if isinstance(price_obj, dict):
                            billing_cycle = _resolve_stripe_cycle_by_price_id(price_obj.get("id"))
                    verified_period_end = _from_unix_ts(sub_data.get("current_period_end"))
                    period_is_current = bool(
                        verified_period_end
                        and _as_aware(verified_period_end) > datetime.now(timezone.utc)
                    )
                    if mapped_tier and period_is_current and mapped_tier != current_user.subscription_tier:
                        current_user.subscription_tier = mapped_tier
                        db.add(current_user)
                        db.commit()
                        tier = mapped_tier
                    elif mapped_tier and period_is_current:
                        tier = current_user.subscription_tier
                    else:
                        if not _preserve_entitlement_on_stripe_downgrade(db, current_user):
                            current_user.subscription_tier = "free"
                        tier = current_user.subscription_tier
                    cancel_at_period_end = bool(sub_data.get("cancel_at_period_end"))
                    active_until = verified_period_end if period_is_current else None
                    current_user.subscription_active_until = active_until
                    db.add(current_user)
                    db.commit()
                    source = "stripe"
                else:
                    # incomplete, past_due, paused, unpaid and unknown states
                    # retain the provider id to prevent duplicate billing, but
                    # never expose paid product access.
                    if not _preserve_entitlement_on_stripe_downgrade(db, current_user):
                        current_user.subscription_tier = "free"
                    current_user.subscription_active_until = None
                    tier = current_user.subscription_tier
                    active_until = None
                    source = "stripe"
                    db.add(current_user)
                    db.commit()
            except HTTPException:
                raise
            except Exception as exc:
                raise HTTPException(
                    status_code=503,
                    detail="Unable to verify billing status. Please try again.",
                ) from exc
        elif current_user.paddle_subscription_id and tier in {"go", "pro"}:
            raise HTTPException(
                status_code=503,
                detail="Stripe billing verification is not configured.",
            )
        else:
            source = "web" if tier in {"single", "go", "pro", "lifetime"} else "free"

    if source == "free" and scan_credit_balance > 0:
        source = "app_store"
    elif (
        source == "free"
        and app_store_entitlement
        and app_store_entitlement.source == "app_store"
    ):
        source = "app_store"

    if current_user.reset_usage_if_needed():
        db.add(current_user)
        db.commit()

    limits = current_user.get_limits()
    usage = {
        "scans": current_user.daily_scans_count,
        "cl": current_user.daily_cl_count,
        "prep": current_user.daily_prep_count,
    }
    scans_remaining_today = (
        max(0, usage["scans"])
        if tier == "single"
        else max(0, int(limits.get("scans", 0)) - int(usage["scans"]))
    )
    expires_at = active_until.isoformat() if active_until else None

    return {
        "tier": tier,
        "plan": tier,
        "entitlement": tier,
        "source": source,
        "expires_at": expires_at,
        "scans_remaining_today": scans_remaining_today,
        "scan_credit_balance": scan_credit_balance,
        "limits": limits,
        "usage": usage,
        "single_scan_remaining": max(0, usage["scans"]) if tier == "single" else None,
        "billing_cycle": billing_cycle,
        "cancel_at_period_end": cancel_at_period_end,
        "subscription_active_until": expires_at,
    }


@router.post("/app-store/sync")
def sync_app_store_purchase(
    payload: AppStoreSyncRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    try:
        verified_payload = verify_and_decode_app_store_transaction(payload.transaction_jws)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    product_id = str(verified_payload.get("productId") or "").strip()
    if not product_id or product_id != payload.product_id.strip():
        raise HTTPException(status_code=400, detail="App Store product_id mismatch.")

    product_config = get_app_store_product_config(product_id)
    if not product_config:
        raise HTTPException(status_code=400, detail="Unsupported App Store product.")

    transaction_id = str(verified_payload.get("transactionId") or "").strip()
    if not transaction_id or transaction_id != payload.transaction_id.strip():
        raise HTTPException(status_code=400, detail="App Store transaction_id mismatch.")

    original_transaction_id = str(verified_payload.get("originalTransactionId") or "").strip() or None
    if (
        payload.original_transaction_id
        and original_transaction_id
        and payload.original_transaction_id.strip() != original_transaction_id
    ):
        raise HTTPException(status_code=400, detail="App Store original_transaction_id mismatch.")
    if not original_transaction_id:
        raise HTTPException(status_code=400, detail="Signed original transaction identifier is missing.")

    verified_quantity_raw = verified_payload.get("quantity", 1)
    try:
        verified_quantity = int(verified_quantity_raw)
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail="Invalid signed App Store quantity.") from exc
    # Every configured SKU represents exactly one entitlement unit. Never use
    # a client quantity as a fallback or multiplier.
    if verified_quantity != 1 or payload.quantity != 1:
        raise HTTPException(status_code=400, detail="Unsupported App Store quantity.")

    owner = (
        db.query(AppStorePurchaseOwner)
        .filter(AppStorePurchaseOwner.original_transaction_id == original_transaction_id)
        .first()
    )
    if owner and owner.user_id != current_user.id:
        raise HTTPException(status_code=409, detail="This App Store purchase is linked to another account.")
    if owner is None:
        try:
            owner = AppStorePurchaseOwner(
                original_transaction_id=original_transaction_id,
                user_id=current_user.id,
            )
            db.add(owner)
            db.flush()
        except IntegrityError as exc:
            db.rollback()
            owner = (
                db.query(AppStorePurchaseOwner)
                .filter(AppStorePurchaseOwner.original_transaction_id == original_transaction_id)
                .first()
            )
            if owner is None or owner.user_id != current_user.id:
                raise HTTPException(
                    status_code=409,
                    detail="This App Store purchase is linked to another account.",
                ) from exc

    environment = normalize_app_store_environment(str(verified_payload.get("environment") or ""))
    requested_environment = normalize_app_store_environment(payload.environment)
    if requested_environment and environment and requested_environment != environment:
        raise HTTPException(status_code=400, detail="App Store environment mismatch.")
    if (
        settings.app_env.lower() not in {"local", "dev", "development", "test"}
        and environment != "Production"
    ):
        raise HTTPException(
            status_code=400,
            detail="Sandbox App Store transactions are not accepted in production.",
        )

    verified_expires_at = millis_to_datetime(verified_payload.get("expiresDate"))
    verified_revocation_at = millis_to_datetime(verified_payload.get("revocationDate"))
    if product_config.get("kind") == "subscription" and verified_expires_at is None:
        # Never trust the client-provided expires_at for a recurring entitlement.
        raise HTTPException(status_code=400, detail="Signed subscription expiry is missing.")

    existing_transaction = (
        db.query(AppStoreTransaction)
        .filter(AppStoreTransaction.transaction_id == transaction_id)
        .first()
    )
    if existing_transaction:
        if existing_transaction.user_id != current_user.id:
            raise HTTPException(status_code=409, detail="This App Store transaction is already linked.")
        if (
            existing_transaction.product_id != product_id
            or existing_transaction.original_transaction_id != original_transaction_id
        ):
            raise HTTPException(status_code=409, detail="App Store transaction identity conflict.")
        # The same transaction can later carry revocation/upgrade state. Update
        # signed mutable fields without granting credit a second time.
        existing_transaction.expires_at = verified_expires_at
        was_revoked = existing_transaction.revocation_at is not None
        existing_transaction.revocation_at = verified_revocation_at
        existing_transaction.signed_at = millis_to_datetime(verified_payload.get("signedDate"))
        existing_transaction.is_upgraded = bool(verified_payload.get("isUpgraded") or False)
        existing_transaction.environment = environment
        existing_transaction.transaction_jws = payload.transaction_jws
        existing_transaction.raw_payload = verified_payload
        db.add(existing_transaction)
        if (
            not was_revoked
            and verified_revocation_at is not None
            and product_config.get("kind") == "credit"
        ):
            entitlement = get_or_create_billing_entitlement(db, current_user.id)
            entitlement.scan_credit_balance = max(
                0,
                int(entitlement.scan_credit_balance or 0) - int(existing_transaction.quantity or 1),
            )
            db.add(entitlement)
        refresh_app_store_entitlement_from_transactions(db, current_user.id)
        db.commit()
        return _build_subscription_status(current_user, db)

    transaction = AppStoreTransaction(
        user_id=current_user.id,
        product_id=product_id,
        transaction_id=transaction_id,
        original_transaction_id=original_transaction_id,
        web_order_line_item_id=str(verified_payload.get("webOrderLineItemId") or "").strip() or None,
        environment=environment,
        quantity=verified_quantity,
        transaction_type=str(verified_payload.get("type") or "").strip() or None,
        ownership_type=str(verified_payload.get("inAppOwnershipType") or "").strip() or None,
        bundle_id=str(verified_payload.get("bundleId") or "").strip() or None,
        purchase_at=millis_to_datetime(verified_payload.get("purchaseDate")),
        expires_at=verified_expires_at,
        revocation_at=verified_revocation_at,
        signed_at=millis_to_datetime(verified_payload.get("signedDate")),
        is_upgraded=bool(verified_payload.get("isUpgraded") or False),
        transaction_jws=payload.transaction_jws,
        raw_payload=verified_payload,
    )
    db.add(transaction)

    entitlement = get_or_create_billing_entitlement(db, current_user.id)
    if product_config.get("kind") == "credit" and verified_revocation_at is None:
        entitlement.scan_credit_balance = int(entitlement.scan_credit_balance or 0) + verified_quantity
        entitlement.source = "app_store"
        entitlement.last_synced_at = datetime.now(timezone.utc)
        db.add(entitlement)

    refreshed_entitlement = refresh_app_store_entitlement_from_transactions(db, current_user.id)
    if (
        refreshed_entitlement
        and refreshed_entitlement.is_active
        and refreshed_entitlement.plan in {"go", "pro", "lifetime"}
    ):
        if current_user.subscription_tier == "single":
            current_user.daily_scans_count = 0
            current_user.daily_cl_count = 0
            current_user.daily_prep_count = 0
        current_user.subscription_tier = refreshed_entitlement.plan
        current_user.subscription_active_until = refreshed_entitlement.expires_at
        db.add(current_user)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        winner = (
            db.query(AppStoreTransaction)
            .filter(AppStoreTransaction.transaction_id == transaction_id)
            .first()
        )
        if winner and winner.user_id == current_user.id:
            refresh_app_store_entitlement_from_transactions(db, current_user.id)
            db.commit()
            return _build_subscription_status(current_user, db)
        raise HTTPException(
            status_code=409,
            detail="This App Store transaction is already linked.",
        ) from exc
    record_activity(
        db,
        user_id=current_user.id,
        action="App Store purchase synced",
        meta={"product_id": product_id},
    )
    return _build_subscription_status(current_user, db)


@router.get("/status")
def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    return _build_subscription_status(current_user, db)

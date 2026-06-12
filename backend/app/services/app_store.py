from __future__ import annotations

import base64
import json
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from typing import Any

from cryptography import x509
from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec, padding, rsa
from jose import jws
from sqlalchemy import update
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.billing import AppStoreTransaction, UserBillingEntitlement

APP_STORE_PRODUCT_MAP: dict[str, dict[str, str]] = {
    "com.cvboosta.app.go.monthly": {"plan": "go", "kind": "subscription", "billing_cycle": "month"},
    "com.cvboosta.app.pro.monthly": {"plan": "pro", "kind": "subscription", "billing_cycle": "month"},
    "com.cvboosta.app.lifetime": {"plan": "lifetime", "kind": "lifetime", "billing_cycle": "one_time"},
    "com.cvboosta.app.single_scan": {"plan": "free", "kind": "credit", "billing_cycle": "one_time"},
}

APP_STORE_PLAN_RANK = {
    "free": 0,
    "single": 1,
    "go": 2,
    "pro": 3,
    "lifetime": 4,
}

_APPLE_LEAF_TRANSACTION_OID = "1.2.840.113635.100.6.11.1"
_APPLE_INTERMEDIATE_OID = "1.2.840.113635.100.6.2.1"
_APPLE_ROOT_CERT_FILES = (
    "AppleIncRootCertificate.cer",
    "AppleRootCA-G2.cer",
    "AppleRootCA-G3.cer",
)


class AppStoreVerificationError(ValueError):
    pass


def get_app_store_product_config(product_id: str | None) -> dict[str, str] | None:
    if not product_id:
        return None
    return APP_STORE_PRODUCT_MAP.get(product_id.strip())


def normalize_app_store_environment(value: str | None) -> str | None:
    normalized = (value or "").strip().lower()
    if not normalized:
        return None
    mapping = {
        "production": "Production",
        "prod": "Production",
        "sandbox": "Sandbox",
        "xcode": "Xcode",
        "local_testing": "LocalTesting",
        "localtesting": "LocalTesting",
    }
    return mapping.get(normalized, value.strip())


def millis_to_datetime(value: Any) -> datetime | None:
    if value in (None, "", 0):
        return None
    try:
        raw = float(value)
    except (TypeError, ValueError):
        return None
    if raw <= 0:
        return None
    if raw > 10_000_000_000:
        raw = raw / 1000.0
    try:
        return datetime.fromtimestamp(raw, tz=timezone.utc)
    except (OverflowError, OSError, ValueError):
        return None


def _aware_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _b64url_decode(value: str) -> bytes:
    padding_needed = (-len(value)) % 4
    return base64.urlsafe_b64decode(value + ("=" * padding_needed))


def _decode_jws_segment(signed_value: str, index: int) -> dict[str, Any]:
    parts = signed_value.split(".")
    if len(parts) != 3:
        raise AppStoreVerificationError("Invalid App Store JWS format.")
    try:
        decoded = _b64url_decode(parts[index]).decode("utf-8")
        payload = json.loads(decoded)
    except (ValueError, json.JSONDecodeError) as exc:
        raise AppStoreVerificationError("Invalid App Store JWS payload.") from exc
    if not isinstance(payload, dict):
        raise AppStoreVerificationError("Invalid App Store JWS payload.")
    return payload


def _verify_certificate_signature(
    certificate: x509.Certificate,
    issuer_certificate: x509.Certificate,
) -> None:
    public_key = issuer_certificate.public_key()
    try:
        if isinstance(public_key, rsa.RSAPublicKey):
            public_key.verify(
                certificate.signature,
                certificate.tbs_certificate_bytes,
                padding.PKCS1v15(),
                certificate.signature_hash_algorithm,
            )
            return
        if isinstance(public_key, ec.EllipticCurvePublicKey):
            public_key.verify(
                certificate.signature,
                certificate.tbs_certificate_bytes,
                ec.ECDSA(certificate.signature_hash_algorithm),
            )
            return
    except InvalidSignature as exc:
        raise AppStoreVerificationError("App Store certificate signature is invalid.") from exc
    raise AppStoreVerificationError("Unsupported App Store certificate key type.")


def _ensure_certificate_valid_at(certificate: x509.Certificate, when: datetime) -> None:
    not_before = _aware_utc(certificate.not_valid_before)
    not_after = _aware_utc(certificate.not_valid_after)
    if not_before is None or not_after is None:
        raise AppStoreVerificationError("Invalid App Store certificate validity.")
    if when < not_before or when > not_after:
        raise AppStoreVerificationError("App Store certificate has expired.")


def _require_extension(certificate: x509.Certificate, oid_value: str) -> None:
    try:
        certificate.extensions.get_extension_for_oid(x509.ObjectIdentifier(oid_value))
    except x509.ExtensionNotFound as exc:
        raise AppStoreVerificationError("App Store certificate chain is invalid.") from exc


@lru_cache(maxsize=1)
def _load_apple_root_certificates() -> tuple[x509.Certificate, ...]:
    certs_dir = Path(__file__).resolve().parents[1] / "certs" / "apple"
    certificates: list[x509.Certificate] = []
    for filename in _APPLE_ROOT_CERT_FILES:
        path = certs_dir / filename
        if not path.exists():
            raise AppStoreVerificationError(f"Missing Apple root certificate: {filename}")
        certificates.append(x509.load_der_x509_certificate(path.read_bytes()))
    return tuple(certificates)


def _verify_x5c_chain_and_get_public_key(x5c_values: list[str], effective_time: datetime) -> bytes:
    if len(x5c_values) != 3:
        raise AppStoreVerificationError("Unexpected App Store certificate chain length.")
    try:
        leaf_certificate = x509.load_der_x509_certificate(base64.b64decode(x5c_values[0], validate=True))
        intermediate_certificate = x509.load_der_x509_certificate(base64.b64decode(x5c_values[1], validate=True))
    except ValueError as exc:
        raise AppStoreVerificationError("Invalid App Store certificate chain.") from exc

    trusted_roots = _load_apple_root_certificates()
    matching_root = next(
        (root for root in trusted_roots if root.subject == intermediate_certificate.issuer),
        None,
    )
    if matching_root is None:
        raise AppStoreVerificationError("App Store certificate root is not trusted.")

    _ensure_certificate_valid_at(leaf_certificate, effective_time)
    _ensure_certificate_valid_at(intermediate_certificate, effective_time)
    _ensure_certificate_valid_at(matching_root, effective_time)
    _verify_certificate_signature(leaf_certificate, intermediate_certificate)
    _verify_certificate_signature(intermediate_certificate, matching_root)
    _require_extension(leaf_certificate, _APPLE_LEAF_TRANSACTION_OID)
    _require_extension(intermediate_certificate, _APPLE_INTERMEDIATE_OID)
    return leaf_certificate.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )


def verify_and_decode_app_store_transaction(transaction_jws: str) -> dict[str, Any]:
    header = _decode_jws_segment(transaction_jws, 0)
    payload = _decode_jws_segment(transaction_jws, 1)

    algorithm = str(header.get("alg") or "").strip()
    if algorithm != "ES256":
        raise AppStoreVerificationError("Unsupported App Store JWS algorithm.")

    x5c_values = header.get("x5c")
    if not isinstance(x5c_values, list) or not x5c_values:
        raise AppStoreVerificationError("Missing App Store certificate chain.")

    effective_time = millis_to_datetime(payload.get("signedDate")) or datetime.now(timezone.utc)
    public_key = _verify_x5c_chain_and_get_public_key(x5c_values, effective_time)

    try:
        verified_payload = jws.verify(transaction_jws, public_key, algorithms=["ES256"])
    except Exception as exc:
        raise AppStoreVerificationError("App Store transaction signature verification failed.") from exc

    try:
        decoded_payload = json.loads(
            verified_payload.decode("utf-8") if isinstance(verified_payload, bytes) else verified_payload
        )
    except (TypeError, ValueError, json.JSONDecodeError) as exc:
        raise AppStoreVerificationError("Invalid verified App Store transaction payload.") from exc

    if not isinstance(decoded_payload, dict):
        raise AppStoreVerificationError("Invalid verified App Store transaction payload.")

    expected_bundle_id = (settings.app_store_bundle_id or "").strip()
    bundle_id = str(decoded_payload.get("bundleId") or "").strip()
    if expected_bundle_id and bundle_id != expected_bundle_id:
        raise AppStoreVerificationError("App Store bundle identifier mismatch.")

    return decoded_payload


def get_or_create_billing_entitlement(db: Session, user_id: int) -> UserBillingEntitlement:
    entitlement = (
        db.query(UserBillingEntitlement)
        .filter(UserBillingEntitlement.user_id == user_id)
        .first()
    )
    if entitlement:
        return entitlement
    entitlement = UserBillingEntitlement(user_id=user_id)
    db.add(entitlement)
    db.flush()
    return entitlement


def refresh_app_store_entitlement_from_transactions(
    db: Session,
    user_id: int,
) -> UserBillingEntitlement | None:
    entitlement = (
        db.query(UserBillingEntitlement)
        .filter(UserBillingEntitlement.user_id == user_id)
        .first()
    )
    transactions = (
        db.query(AppStoreTransaction)
        .filter(AppStoreTransaction.user_id == user_id)
        .all()
    )
    if entitlement is None and not transactions:
        return None
    if entitlement is None:
        entitlement = UserBillingEntitlement(user_id=user_id)
        db.add(entitlement)
        db.flush()

    now = datetime.now(timezone.utc)
    chosen_transaction: AppStoreTransaction | None = None
    chosen_key: tuple[int, int, int] | None = None

    for transaction in transactions:
        config = get_app_store_product_config(transaction.product_id)
        if not config or config.get("kind") == "credit":
            continue
        plan = str(config.get("plan") or "free")
        if transaction.revocation_at is not None:
            continue
        if plan != "lifetime":
            expires_at = _aware_utc(transaction.expires_at)
            if expires_at is None or expires_at <= now:
                continue
            expires_key = int(expires_at.timestamp())
        else:
            expires_key = 2_147_483_647
        event_at = _aware_utc(transaction.signed_at or transaction.purchase_at or transaction.created_at)
        event_key = int(event_at.timestamp()) if event_at else 0
        candidate_key = (APP_STORE_PLAN_RANK.get(plan, 0), expires_key, event_key)
        if chosen_key is None or candidate_key > chosen_key:
            chosen_key = candidate_key
            chosen_transaction = transaction

    if chosen_transaction is None:
        entitlement.plan = "free"
        entitlement.entitlement = "free"
        entitlement.is_active = False
        entitlement.expires_at = None
        entitlement.original_transaction_id = None
        entitlement.latest_transaction_id = None
        entitlement.environment = None
        entitlement.source = "app_store" if entitlement.scan_credit_balance > 0 or transactions else "free"
        entitlement.last_synced_at = now
        db.add(entitlement)
        return entitlement

    chosen_config = get_app_store_product_config(chosen_transaction.product_id) or {}
    chosen_plan = str(chosen_config.get("plan") or "free")
    entitlement.plan = chosen_plan
    entitlement.entitlement = chosen_plan
    entitlement.source = "app_store"
    entitlement.is_active = True
    entitlement.expires_at = None if chosen_plan == "lifetime" else chosen_transaction.expires_at
    entitlement.original_transaction_id = chosen_transaction.original_transaction_id
    entitlement.latest_transaction_id = chosen_transaction.transaction_id
    entitlement.environment = chosen_transaction.environment
    entitlement.last_synced_at = now
    db.add(entitlement)
    return entitlement


def get_app_store_scan_credit_balance(db: Session, user_id: int) -> int:
    entitlement = (
        db.query(UserBillingEntitlement)
        .filter(UserBillingEntitlement.user_id == user_id)
        .first()
    )
    if not entitlement:
        return 0
    return max(0, int(entitlement.scan_credit_balance or 0))


def consume_app_store_scan_credit(db: Session, user_id: int) -> bool:
    result = db.execute(
        update(UserBillingEntitlement)
        .where(UserBillingEntitlement.user_id == user_id)
        .where(UserBillingEntitlement.scan_credit_balance > 0)
        .values(
            scan_credit_balance=UserBillingEntitlement.scan_credit_balance - 1,
            updated_at=datetime.now(timezone.utc),
        )
    )
    return (result.rowcount or 0) > 0

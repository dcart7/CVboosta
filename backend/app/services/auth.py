from __future__ import annotations

from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import re
import unicodedata

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.models.user import User

PASSWORD_MIN_LENGTH = 10
PASSWORD_PBKDF2_ROUNDS = 600_000
_PASSWORD_SYMBOLS = frozenset('!@#$%^&*(),.?":{}|<>')

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto",
    pbkdf2_sha256__default_rounds=PASSWORD_PBKDF2_ROUNDS,
    pbkdf2_sha256__min_rounds=PASSWORD_PBKDF2_ROUNDS,
)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return pwd_context.verify(password, password_hash)
    except (TypeError, ValueError):
        return False


def password_hash_needs_update(password_hash: str) -> bool:
    try:
        return pwd_context.needs_update(password_hash)
    except (TypeError, ValueError):
        return True


def normalize_password_input(password: str) -> str:
    # Normalize Unicode variants, drop invisible control chars, and trim edge whitespace
    # that often appears from mobile autofill/copy-paste flows.
    normalized = unicodedata.normalize("NFKC", password or "")
    invisible_chars = {"\u200b", "\u200c", "\u200d", "\ufeff", "\u2060"}
    cleaned = "".join(ch for ch in normalized if ch not in invisible_chars)
    cleaned = cleaned.replace("\u00A0", " ").replace("\u202F", " ")
    return cleaned.strip()


def validate_new_password(password: str) -> str:
    """Normalize and enforce the single server-side policy for new secrets.

    Login deliberately does not use this function so accounts created under
    the previous eight-character policy remain accessible and can be rehashed.
    """
    normalized = normalize_password_input(password)
    if (
        len(normalized) < PASSWORD_MIN_LENGTH
        or not re.search(r"[0-9]", normalized)
        or not any(character in _PASSWORD_SYMBOLS for character in normalized)
    ):
        raise ValueError(
            "Password must be at least 10 characters and include a number and a symbol."
        )
    return normalized


def create_access_token(user: User) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "ph": _password_hash_fingerprint(user.password_hash),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.jwt_exp_minutes)).timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
    except JWTError as exc:
        raise ValueError("Invalid token") from exc


def _password_hash_fingerprint(password_hash: str) -> str:
    return hmac.new(
        settings.jwt_secret.encode("utf-8"),
        password_hash.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()[:24]


def validate_access_token_for_user(payload: dict, user: User) -> None:
    if str(payload.get("sub", "")) != str(user.id):
        raise ValueError("Token user mismatch")
    token_fingerprint = str(payload.get("ph", ""))
    current_fingerprint = _password_hash_fingerprint(user.password_hash)
    if not token_fingerprint or not hmac.compare_digest(token_fingerprint, current_fingerprint):
        raise ValueError("Token has been revoked")


def create_password_reset_token(user: User) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "purpose": "password_reset",
        "ph": _password_hash_fingerprint(user.password_hash),
        "iat": int(now.timestamp()),
        "exp": int(
            (
                now + timedelta(minutes=max(5, settings.password_reset_exp_minutes))
            ).timestamp()
        ),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_password_reset_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
    except JWTError as exc:
        raise ValueError("Invalid or expired token") from exc
    if payload.get("purpose") != "password_reset":
        raise ValueError("Invalid token purpose")
    return payload


def validate_password_reset_token_for_user(payload: dict, user: User) -> None:
    if str(payload.get("sub", "")) != str(user.id):
        raise ValueError("Token user mismatch")
    token_fingerprint = str(payload.get("ph", ""))
    current_fingerprint = _password_hash_fingerprint(user.password_hash)
    if not token_fingerprint or token_fingerprint != current_fingerprint:
        raise ValueError("Token has already been invalidated")

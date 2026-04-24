from __future__ import annotations

from datetime import datetime, timedelta, timezone
import hashlib
import unicodedata

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.models.user import User

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def normalize_password_input(password: str) -> str:
    # Normalize Unicode variants and trim accidental edge whitespace from mobile keyboards.
    return unicodedata.normalize("NFKC", password or "").strip()


def create_access_token(user: User) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.id),
        "email": user.email,
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
    return hashlib.sha256(password_hash.encode("utf-8")).hexdigest()[:16]


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

from __future__ import annotations

import base64
import hashlib
import hmac
import json
from typing import Any

from cryptography.fernet import Fernet, InvalidToken

from app.core.config import settings

_ENC_PREFIX = "enc:v1:"


def _fernet_for_user(user_id: int) -> Fernet:
    digest = hmac.new(
        settings.jwt_secret.encode("utf-8"),
        f"analysis:{user_id}".encode("utf-8"),
        hashlib.sha256,
    ).digest()
    key = base64.urlsafe_b64encode(digest)
    return Fernet(key)


def encrypt_text_for_user(user_id: int, plaintext: str | None) -> str | None:
    if not plaintext:
        return None
    token = _fernet_for_user(user_id).encrypt(plaintext.encode("utf-8")).decode("utf-8")
    return f"{_ENC_PREFIX}{token}"


def decrypt_text_for_user(user_id: int, ciphertext: str | None) -> str | None:
    if not ciphertext:
        return None
    if not ciphertext.startswith(_ENC_PREFIX):
        # Backward compatibility with legacy plaintext rows.
        return ciphertext
    token = ciphertext[len(_ENC_PREFIX) :]
    try:
        return _fernet_for_user(user_id).decrypt(token.encode("utf-8")).decode("utf-8")
    except (InvalidToken, ValueError):
        return None


def encrypt_json_for_user(user_id: int, value: Any) -> str | None:
    if value is None:
        return None
    payload = json.dumps(value, ensure_ascii=False)
    return encrypt_text_for_user(user_id, payload)


def decrypt_json_for_user(user_id: int, ciphertext: str | None) -> Any:
    plaintext = decrypt_text_for_user(user_id, ciphertext)
    if not plaintext:
        return None
    try:
        return json.loads(plaintext)
    except json.JSONDecodeError:
        return None

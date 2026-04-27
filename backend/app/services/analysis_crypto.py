from __future__ import annotations

import base64
import hashlib
import hmac
import json
from typing import Any

from cryptography.fernet import Fernet, InvalidToken

from app.core.config import settings

_ENC_PREFIX = "enc:v1:"


def _key_materials() -> list[str]:
    primary = (settings.analysis_encryption_key or settings.jwt_secret or "").strip()
    legacy = [str(item).strip() for item in (settings.analysis_encryption_legacy_keys or []) if str(item).strip()]
    materials = [primary] if primary else []
    for item in legacy:
        if item not in materials:
            materials.append(item)
    return materials


def _fernet_for_user(user_id: int, key_material: str) -> Fernet:
    digest = hmac.new(
        key_material.encode("utf-8"),
        f"analysis:{user_id}".encode("utf-8"),
        hashlib.sha256,
    ).digest()
    key = base64.urlsafe_b64encode(digest)
    return Fernet(key)


def encrypt_text_for_user(user_id: int, plaintext: str | None) -> str | None:
    if not plaintext:
        return None
    materials = _key_materials()
    if not materials:
        return None
    token = _fernet_for_user(user_id, materials[0]).encrypt(plaintext.encode("utf-8")).decode("utf-8")
    return f"{_ENC_PREFIX}{token}"


def decrypt_text_for_user(user_id: int, ciphertext: str | None) -> str | None:
    if not ciphertext:
        return None
    if not ciphertext.startswith(_ENC_PREFIX):
        # Backward compatibility with legacy plaintext rows.
        return ciphertext
    token = ciphertext[len(_ENC_PREFIX) :]
    for material in _key_materials():
        try:
            return _fernet_for_user(user_id, material).decrypt(token.encode("utf-8")).decode("utf-8")
        except (InvalidToken, ValueError):
            continue
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

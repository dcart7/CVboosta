from __future__ import annotations

import json
import time
import urllib.request
import urllib.parse
from typing import Any

from jose import jwt

from app.core.config import settings

_JWKS_CACHE: dict[str, tuple[float, dict[str, Any]]] = {}
_JWKS_TTL_SECONDS = 60 * 60

_PROVIDER_CONFIG = {
    "google": {
        "issuer": {"https://accounts.google.com", "accounts.google.com"},
        "jwks_url": "https://www.googleapis.com/oauth2/v3/certs",
    },
    "apple": {
        "issuer": {"https://appleid.apple.com"},
        "jwks_url": "https://appleid.apple.com/auth/keys",
    },
}


def _get_provider_audiences(provider: str) -> list[str]:
    if provider == "google":
        if not settings.google_oauth_client_id:
            raise ValueError("Google OAuth is not configured")
        return [settings.google_oauth_client_id]
    if provider == "apple":
        values = []
        primary = (settings.apple_oauth_client_id or "").strip()
        if primary:
            values.append(primary)
        values.extend(value.strip() for value in settings.apple_oauth_client_ids if value.strip())
        unique_values = list(dict.fromkeys(values))
        if not unique_values:
            raise ValueError("Apple OAuth is not configured")
        return unique_values
    raise ValueError("Unsupported OAuth provider")


def _fetch_jwks(provider: str) -> dict[str, Any]:
    now = time.time()
    cached = _JWKS_CACHE.get(provider)
    if cached and cached[0] > now:
        return cached[1]

    config = _PROVIDER_CONFIG.get(provider)
    if not config:
        raise ValueError("Unsupported OAuth provider")

    with urllib.request.urlopen(config["jwks_url"], timeout=8) as response:
        payload = json.loads(response.read().decode("utf-8"))

    _JWKS_CACHE[provider] = (now + _JWKS_TTL_SECONDS, payload)
    return payload


def verify_oauth_id_token(provider: str, token: str) -> dict[str, Any]:
    provider = provider.strip().lower()
    config = _PROVIDER_CONFIG.get(provider)
    if not config:
        raise ValueError("Unsupported OAuth provider")

    allowed_audiences = _get_provider_audiences(provider)
    unverified_header = jwt.get_unverified_header(token)
    kid = str(unverified_header.get("kid", ""))
    if not kid:
        raise ValueError("Invalid token header")

    jwks = _fetch_jwks(provider)
    keys = jwks.get("keys") or []
    key = next((item for item in keys if item.get("kid") == kid), None)
    if not key:
        _JWKS_CACHE.pop(provider, None)
        jwks = _fetch_jwks(provider)
        keys = jwks.get("keys") or []
        key = next((item for item in keys if item.get("kid") == kid), None)
    if not key:
        raise ValueError("Unable to validate token key")

    claims = jwt.decode(
        token,
        key,
        algorithms=[key.get("alg", "RS256")],
        issuer=list(config["issuer"]),
        options={"verify_at_hash": False, "verify_aud": False},
    )

    if not _audience_matches(claims.get("aud"), allowed_audiences):
        raise ValueError("OAuth audience mismatch")

    email = str(claims.get("email", "")).strip().lower()
    if email:
        claims["email"] = email
        email_verified = claims.get("email_verified")
        if isinstance(email_verified, str):
            email_verified = email_verified.lower() == "true"
        if email_verified is False:
            raise ValueError("Provider email is not verified")

    return claims


def verify_google_access_token(token: str) -> dict[str, Any]:
    audience = _get_provider_audiences("google")[0]
    url = "https://www.googleapis.com/oauth2/v3/tokeninfo?" + urllib.parse.urlencode({"access_token": token})
    with urllib.request.urlopen(url, timeout=8) as response:
        claims = json.loads(response.read().decode("utf-8"))

    token_audience = str(claims.get("aud", "")).strip()
    if token_audience != audience:
        raise ValueError("Google access token audience mismatch")

    email = str(claims.get("email", "")).strip().lower()
    if not email:
        raise ValueError("Email is missing in Google access token")

    email_verified = claims.get("email_verified")
    if isinstance(email_verified, str):
        email_verified = email_verified.lower() == "true"
    if email_verified is False:
        raise ValueError("Provider email is not verified")

    claims["email"] = email
    return claims


def _audience_matches(raw_audience: Any, allowed_audiences: list[str]) -> bool:
    normalized_allowed = {value.strip() for value in allowed_audiences if value.strip()}
    if not normalized_allowed:
        return False

    if isinstance(raw_audience, str):
        return raw_audience.strip() in normalized_allowed

    if isinstance(raw_audience, list):
        return any(str(value).strip() in normalized_allowed for value in raw_audience)

    return False

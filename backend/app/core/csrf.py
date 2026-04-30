from __future__ import annotations

from urllib.parse import urlparse

from fastapi import Request
from starlette.responses import JSONResponse

from app.core.config import get_cors_origins, settings


_SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}
_CSRF_EXEMPT_PREFIXES = (
    "/billing/webhook",
    "/billing/stripe/webhook",
)
_CSRF_EXEMPT_PATHS = {
    "/health",
    "/openapi.json",
}


def _normalize_origin(value: str | None) -> str | None:
    raw = (value or "").strip()
    if not raw:
        return None
    return raw.rstrip("/")


def _origin_from_referer(referer: str | None) -> str | None:
    raw = (referer or "").strip()
    if not raw:
        return None
    parsed = urlparse(raw)
    if not parsed.scheme or not parsed.netloc:
        return None
    return f"{parsed.scheme}://{parsed.netloc}".rstrip("/")


def _provided_authorization_header(request: Request) -> bool:
    value = (request.headers.get("authorization") or "").strip()
    if not value:
        return False
    return value.lower() not in {"null", "undefined"}


async def csrf_protect_middleware(request: Request, call_next):  # type: ignore[no-untyped-def]
    """
    CSRF protection for cookie-based auth.

    If a request uses cookies for authentication (no Authorization header, but auth cookie present)
    and it's a state-changing method, require Origin/Referer to match our allowed frontend origins.
    """
    if request.method in _SAFE_METHODS:
        return await call_next(request)

    path = request.url.path
    if path in _CSRF_EXEMPT_PATHS or any(path.startswith(p) for p in _CSRF_EXEMPT_PREFIXES):
        return await call_next(request)
    if path.startswith("/docs"):
        return await call_next(request)

    # If the client uses Authorization header tokens, CSRF doesn't apply.
    if _provided_authorization_header(request):
        return await call_next(request)

    auth_cookie = (request.cookies.get(settings.auth_cookie_name) or "").strip()
    if not auth_cookie:
        return await call_next(request)

    allowed = {_normalize_origin(o) for o in get_cors_origins()}
    allowed.discard(None)

    origin = _normalize_origin(request.headers.get("origin")) or _origin_from_referer(
        request.headers.get("referer")
    )
    if not origin or origin not in allowed:
        return JSONResponse(
            status_code=403,
            content={"detail": "CSRF protection: invalid or missing Origin/Referer."},
        )

    return await call_next(request)


from __future__ import annotations

import json
import hashlib
import hmac
import time

from fastapi import Request
from starlette.responses import Response, StreamingResponse

from app.core.config import settings
from app.core.client_ip import client_ip
from app.db.session import get_sessionlocal
from app.models.request_log import RequestLog

_SKIP_PATHS = {
    "/health",
    "/openapi.json",
    "/auth/login",
    "/auth/register",
    "/auth/change-password",
    "/billing/webhook",
    "/billing/stripe/webhook",
}
_SENSITIVE_KEYS = {
    "password",
    "current_password",
    "new_password",
    "token",
    "access_token",
    "refresh_token",
    "authorization",
    "secret",
    "api_key",
    "cv_text",
    "job_text",
    "optimized_cv",
    "cover_letter",
    "raw_text",
    "pretty_json",
    "markdown",
}
_SENSITIVE_PATH_HINTS = (
    "/auth/",
    "/optimize",
    "/analyze",
    "/history",
    "/billing",
)


def _should_skip(path: str) -> bool:
    if path in _SKIP_PATHS or path.startswith("/health"):
        return True
    if path.startswith("/docs"):
        return True
    return False


def _truncate(text: str | None) -> str | None:
    if text is None:
        return None
    limit = settings.request_log_max_chars
    if len(text) <= limit:
        return text
    return text[:limit] + "…"


def _redact_value(value: object) -> object:
    if isinstance(value, dict):
        output: dict[str, object] = {}
        for key, nested in value.items():
            key_lower = str(key).lower()
            if key_lower in _SENSITIVE_KEYS or any(marker in key_lower for marker in ("password", "token", "secret")):
                output[str(key)] = "[redacted]"
            else:
                output[str(key)] = _redact_value(nested)
        return output
    if isinstance(value, list):
        return [_redact_value(item) for item in value]
    if isinstance(value, str):
        if len(value) > 200:
            return f"[string:{len(value)}]"
        return value
    return value


def _summarize_bytes(body: bytes, content_type: str | None) -> str | None:
    if not body:
        if content_type and "multipart/form-data" in content_type:
            return "[multipart payload omitted]"
        return None
    if content_type and "application/json" in content_type:
        try:
            parsed = json.loads(body.decode("utf-8"))
            redacted = _redact_value(parsed)
            return _truncate(json.dumps(redacted, ensure_ascii=False))
        except Exception:
            return _truncate(body.decode("utf-8", errors="replace"))
    if content_type and "application/x-www-form-urlencoded" in content_type:
        return "[form payload omitted]"
    if content_type and "text/" in content_type:
        return _truncate(body.decode("utf-8", errors="replace"))
    return _truncate(f"[{len(body)} bytes; content-type={content_type or 'unknown'}]")


async def capture_response_body(response: Response) -> tuple[Response, bytes]:
    if isinstance(response, StreamingResponse):
        # Never consume a stream for diagnostics: buffering large exports or a
        # long-lived stream can exhaust memory and changes response semantics.
        return response, b""

    body = getattr(response, "body", b"") or b""
    return response, body


def _pseudonymize_ip(value: str | None) -> str | None:
    if not value:
        return None
    digest = hmac.new(
        settings.jwt_secret.encode("utf-8"),
        value.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return f"hmac:{digest[:32]}"


def _coarse_user_agent(value: str | None) -> str | None:
    """Keep broad diagnostics without a fingerprintable raw UA string."""
    normalized = (value or "").lower()
    if not normalized:
        return None
    platform = "other"
    for marker, label in (
        ("iphone", "ios"),
        ("ipad", "ios"),
        ("android", "android"),
        ("windows", "windows"),
        ("macintosh", "macos"),
        ("linux", "linux"),
    ):
        if marker in normalized:
            platform = label
            break
    client = "other"
    for marker, label in (
        ("edg/", "edge"),
        ("chrome/", "chrome"),
        ("firefox/", "firefox"),
        ("safari/", "safari"),
        ("curl/", "curl"),
        ("bot", "bot"),
    ):
        if marker in normalized:
            client = label
            break
    return f"{platform}:{client}"


def _safe_commit(log: RequestLog) -> None:
    session_local = get_sessionlocal()
    if not session_local:
        return
    db = session_local()
    try:
        db.add(log)
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()


async def log_request_response(
    request: Request,
    response: Response,
    *,
    start_time: float,
    request_body: bytes,
    response_body: bytes,
) -> None:
    if not settings.request_logging_enabled:
        return

    path = request.url.path
    if _should_skip(path):
        return

    duration_ms = int((time.perf_counter() - start_time) * 1000)
    content_type = request.headers.get("content-type")

    # Body logs are useful for debugging, but for sensitive endpoints keep them redacted.
    path_lower = path.lower()
    is_sensitive_path = any(hint in path_lower for hint in _SENSITIVE_PATH_HINTS)
    request_body_summary = _summarize_bytes(request_body, content_type)
    response_body_summary = _summarize_bytes(
        response_body, response.headers.get("content-type")
    )
    if is_sensitive_path:
        request_body_summary = "[redacted-sensitive-endpoint]"
        response_body_summary = "[redacted-sensitive-endpoint]"

    log = RequestLog(
        method=request.method,
        path=path,
        status_code=response.status_code,
        duration_ms=duration_ms,
        client_ip=_pseudonymize_ip(client_ip(request)),
        user_agent=_coarse_user_agent(request.headers.get("user-agent")),
        content_type=content_type,
        request_body=request_body_summary,
        response_body=response_body_summary,
    )
    _safe_commit(log)

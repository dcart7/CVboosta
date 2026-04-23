from __future__ import annotations

import json
import ipaddress
import time

from fastapi import Request
from starlette.responses import Response, StreamingResponse

from app.core.config import settings
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
    if path in _SKIP_PATHS:
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
        return _truncate(body.decode("utf-8", errors="replace"))
    if content_type and "text/" in content_type:
        return _truncate(body.decode("utf-8", errors="replace"))
    return _truncate(f"[{len(body)} bytes; content-type={content_type or 'unknown'}]")


async def capture_response_body(response: Response) -> tuple[Response, bytes]:
    if isinstance(response, StreamingResponse):
        chunks: list[bytes] = []
        async for chunk in response.body_iterator:  # type: ignore[attr-defined]
            if isinstance(chunk, bytes):
                chunks.append(chunk)
            else:
                chunks.append(str(chunk).encode("utf-8"))
        body = b"".join(chunks)
        new_response = Response(
            content=body,
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.media_type,
        )
        return new_response, body

    body = getattr(response, "body", b"") or b""
    return response, body


def _client_ip(request: Request) -> str | None:
    remote_host = request.client.host if request.client and request.client.host else None
    if not remote_host:
        return None

    trusted_proxies = {ip.strip() for ip in settings.trusted_proxy_ips if ip.strip()}
    trust_all = "*" in trusted_proxies
    is_trusted_proxy = trust_all or remote_host in trusted_proxies
    if not is_trusted_proxy:
        try:
            remote_ip = ipaddress.ip_address(remote_host)
            for cidr in settings.trusted_proxy_cidrs:
                try:
                    if remote_ip in ipaddress.ip_network(cidr, strict=False):
                        is_trusted_proxy = True
                        break
                except ValueError:
                    continue
        except ValueError:
            pass

    if is_trusted_proxy:
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
            if client_ip:
                return client_ip

    return remote_host


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
        client_ip=_client_ip(request),
        user_agent=request.headers.get("user-agent"),
        content_type=content_type,
        request_body=request_body_summary,
        response_body=response_body_summary,
    )
    _safe_commit(log)

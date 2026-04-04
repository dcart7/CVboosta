from __future__ import annotations

import json
import time
from typing import Iterable

from fastapi import Request
from starlette.responses import Response, StreamingResponse

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.request_log import RequestLog

_SKIP_PATHS = {"/health", "/openapi.json", "/auth/login", "/auth/register"}


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


def _summarize_bytes(body: bytes, content_type: str | None) -> str | None:
    if not body:
        if content_type and "multipart/form-data" in content_type:
            return "[multipart payload omitted]"
        return None
    if content_type and "application/json" in content_type:
        try:
            parsed = json.loads(body.decode("utf-8"))
            return _truncate(json.dumps(parsed, ensure_ascii=False))
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
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return None


def _safe_commit(log: RequestLog) -> None:
    db = SessionLocal()
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

    log = RequestLog(
        method=request.method,
        path=path,
        status_code=response.status_code,
        duration_ms=duration_ms,
        client_ip=_client_ip(request),
        user_agent=request.headers.get("user-agent"),
        content_type=content_type,
        request_body=_summarize_bytes(request_body, content_type),
        response_body=_summarize_bytes(
            response_body, response.headers.get("content-type")
        ),
    )
    _safe_commit(log)

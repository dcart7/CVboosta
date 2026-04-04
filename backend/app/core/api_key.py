from __future__ import annotations

from fastapi import Request
from starlette.responses import JSONResponse

from app.core.config import settings


async def api_key_middleware(request: Request, call_next):  # type: ignore[no-untyped-def]
    if not settings.api_key_enabled:
        return await call_next(request)

    path = request.url.path
    if path in {"/health"} or path.startswith("/docs") or path == "/openapi.json":
        return await call_next(request)
    if path.startswith("/auth"):
        return await call_next(request)

    if not settings.api_key:
        return JSONResponse(
            status_code=500,
            content={"detail": "API key protection is enabled but API_KEY is not set."},
        )

    provided = request.headers.get("x-api-key")
    if not provided or provided != settings.api_key:
        return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

    return await call_next(request)

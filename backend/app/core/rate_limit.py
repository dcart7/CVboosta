from __future__ import annotations

from collections import deque
from threading import Lock
from time import monotonic

from fastapi import Request
from starlette.responses import JSONResponse

from app.core.config import settings


class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._store: dict[str, deque[float]] = {}
        self._lock = Lock()

    def check(self, key: str) -> tuple[bool, int, int]:
        now = monotonic()
        with self._lock:
            queue = self._store.get(key)
            if queue is None:
                queue = deque()
                self._store[key] = queue

            while queue and now - queue[0] > self.window_seconds:
                queue.popleft()

            if len(queue) >= self.max_requests:
                reset = int(self.window_seconds - (now - queue[0]))
                return False, 0, max(reset, 0)

            queue.append(now)
            remaining = max(self.max_requests - len(queue), 0)
            return True, remaining, int(self.window_seconds)


_rate_limiter = RateLimiter(
    max_requests=settings.rate_limit_requests,
    window_seconds=settings.rate_limit_window_seconds,
)


def _client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


async def rate_limit_middleware(request: Request, call_next):  # type: ignore[no-untyped-def]
    if not settings.rate_limit_enabled:
        return await call_next(request)

    path = request.url.path
    if path in {"/health"} or path.startswith("/docs") or path == "/openapi.json":
        return await call_next(request)

    allowed, remaining, reset = _rate_limiter.check(_client_ip(request))
    if not allowed:
        response = JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Try again later."},
        )
        response.headers["Retry-After"] = str(reset)
        response.headers["X-RateLimit-Limit"] = str(settings.rate_limit_requests)
        response.headers["X-RateLimit-Remaining"] = "0"
        response.headers["X-RateLimit-Reset"] = str(reset)
        return response

    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = str(settings.rate_limit_requests)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Reset"] = str(reset)
    return response

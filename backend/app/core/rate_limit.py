from __future__ import annotations

from collections import deque
import ipaddress
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
_auth_rate_limiter = RateLimiter(
    max_requests=settings.auth_rate_limit_requests,
    window_seconds=settings.auth_rate_limit_window_seconds,
)


def _client_ip(request: Request) -> str:
    remote_host = request.client.host if request.client and request.client.host else "unknown"

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

    # Trust proxy-provided client IP only when the immediate peer is trusted.
    if is_trusted_proxy:
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            ips = [ip.strip() for ip in forwarded_for.split(",") if ip.strip()]
            if ips:
                # Leftmost is the original client, right side are proxy hops.
                return ips[0]

        val = request.headers.get("x-real-ip")
        if val:
            return val.strip()

        val = request.headers.get("cf-connecting-ip")
        if val:
            return val.strip()

        val = request.headers.get("true-client-ip")
        if val:
            return val.strip()

    if remote_host:
        return remote_host
    return "unknown"


async def rate_limit_middleware(request: Request, call_next):  # type: ignore[no-untyped-def]
    if not settings.rate_limit_enabled:
        return await call_next(request)

    path = request.url.path
    if path in {"/health"} or path.startswith("/docs") or path == "/openapi.json":
        return await call_next(request)

    client_ip = _client_ip(request)
    is_auth_sensitive = (
        path == "/auth/login"
        or path.startswith("/auth/oauth/")
        or path == "/auth/register"
        or path == "/auth/forgot-password"
    )

    limiter = _auth_rate_limiter if is_auth_sensitive else _rate_limiter
    limit_value = (
        settings.auth_rate_limit_requests
        if is_auth_sensitive
        else settings.rate_limit_requests
    )
    key = f"auth:{client_ip}:{path}" if is_auth_sensitive else client_ip

    allowed, remaining, reset = limiter.check(key)
    if not allowed:
        response = JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Try again later."},
        )
        response.headers["Retry-After"] = str(reset)
        response.headers["X-RateLimit-Limit"] = str(limit_value)
        response.headers["X-RateLimit-Remaining"] = "0"
        response.headers["X-RateLimit-Reset"] = str(reset)
        return response

    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = str(limit_value)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Reset"] = str(reset)
    return response

from __future__ import annotations

from collections import deque
import hashlib
import hmac
import json
import logging
from threading import Lock
from time import monotonic, time

from fastapi import Request
from starlette.responses import JSONResponse

from app.core.config import settings
from app.core.client_ip import client_ip

logger = logging.getLogger(__name__)

try:
    import redis.asyncio as redis_async
except ImportError:  # pragma: no cover - deployment dependency guard
    redis_async = None


class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int, max_keys: int = 50000) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.max_keys = max(1000, max_keys)
        self._store: dict[str, deque[float]] = {}
        self._lock = Lock()
        self._checks = 0

    def check(self, key: str) -> tuple[bool, int, int]:
        now = monotonic()
        with self._lock:
            self._checks += 1
            if self._checks % 1000 == 0:
                self._prune(now)
            elif len(self._store) >= self.max_keys and key not in self._store:
                try:
                    self._store.pop(next(iter(self._store)), None)
                except StopIteration:
                    pass
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

    def _prune(self, now: float) -> None:
        stale_keys = [
            key
            for key, queue in self._store.items()
            if not queue or now - queue[-1] > self.window_seconds
        ]
        for key in stale_keys:
            self._store.pop(key, None)

        # Bound memory even during a high-cardinality burst before entries age
        # out. Evict least-recently-used subjects, never grow without limit.
        overflow = len(self._store) - self.max_keys + 1
        if overflow > 0:
            # ``dict`` preserves insertion order. Avoid sorting attacker-sized
            # key sets on every overflow request (which itself becomes a CPU
            # denial-of-service vector).
            for _ in range(overflow):
                try:
                    oldest_key = next(iter(self._store))
                except StopIteration:
                    break
                self._store.pop(oldest_key, None)


_rate_limiter = RateLimiter(
    max_requests=settings.rate_limit_requests,
    window_seconds=settings.rate_limit_window_seconds,
    max_keys=settings.rate_limit_max_keys,
)
_auth_rate_limiter = RateLimiter(
    max_requests=settings.auth_rate_limit_requests,
    window_seconds=settings.auth_rate_limit_window_seconds,
    max_keys=settings.rate_limit_max_keys,
)
_auth_target_rate_limiter = RateLimiter(
    max_requests=settings.auth_subject_rate_limit_requests,
    window_seconds=settings.auth_rate_limit_window_seconds,
    max_keys=settings.rate_limit_max_keys,
)
_expensive_rate_limiter = RateLimiter(
    max_requests=settings.expensive_rate_limit_requests,
    window_seconds=settings.expensive_rate_limit_window_seconds,
    max_keys=settings.rate_limit_max_keys,
)

_redis_client = None
_REDIS_FIXED_WINDOW_SCRIPT = """
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return current
"""


async def _shared_rate_check(
    key: str,
    *,
    max_requests: int,
    window_seconds: int,
) -> tuple[bool, int, int] | None:
    """Use Redis when configured; return None for allowed local fallback."""

    global _redis_client
    if not settings.redis_url:
        if settings.rate_limit_shared_required:
            raise RuntimeError("Shared rate limiting is required but REDIS_URL is unset")
        return None
    if redis_async is None:
        if settings.rate_limit_shared_required:
            raise RuntimeError("Redis client dependency is unavailable")
        return None
    try:
        if _redis_client is None:
            _redis_client = redis_async.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=0.5,
                socket_timeout=0.5,
            )
        bucket = int(time() // max(1, window_seconds))
        count = int(
            await _redis_client.eval(
                _REDIS_FIXED_WINDOW_SCRIPT,
                1,
                f"cvboosta:rate:v1:{bucket}:{key}",
                max(1, window_seconds) + 1,
            )
        )
        remaining = max(max_requests - count, 0)
        reset = max(1, int(window_seconds - (time() % max(1, window_seconds))))
        return count <= max_requests, remaining, reset
    except Exception:
        if settings.rate_limit_shared_required:
            raise
        logger.warning("Redis rate limiter unavailable; using bounded local fallback")
        return None


async def shared_rate_limit_ready() -> bool:
    """Readiness probe for deployments that require a shared limiter."""

    global _redis_client
    if not settings.rate_limit_shared_required:
        return True
    if not settings.redis_url or redis_async is None:
        return False
    try:
        if _redis_client is None:
            _redis_client = redis_async.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=0.5,
                socket_timeout=0.5,
            )
        return bool(await _redis_client.ping())
    except Exception:
        return False


def _authenticated_subject(request: Request) -> str | None:
    authorization = (request.headers.get("authorization") or "").strip()
    token = ""
    if authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()
    if not token:
        token = (request.cookies.get(settings.auth_cookie_name) or "").strip()
    if not token:
        return None
    try:
        # Local import avoids pulling auth dependencies into module startup.
        from app.services.auth import decode_access_token

        payload = decode_access_token(token)
        user_id = int(str(payload.get("sub") or "0"))
        if user_id > 0:
            return f"user:{user_id}"
    except Exception:
        return None
    return None


def _route_group(path: str) -> str:
    parts = [part for part in path.split("/") if part]
    return parts[0] if parts else "root"


def _is_expensive_path(path: str) -> bool:
    return path == "/optimize" or path in {
        "/analyze",
        "/analyze/upload",
        "/demo/optimize",
        "/optimize/cover-letter",
        "/analyze/cv",
        "/analyze/job",
        "/analyze/keywords",
        "/analyze/match",
        "/analyze/interview-prep",
    }


async def rate_limit_middleware(request: Request, call_next):  # type: ignore[no-untyped-def]
    if not settings.rate_limit_enabled:
        return await call_next(request)

    path = request.url.path
    if path in {"/health", "/health/live", "/health/ready"} or path.startswith("/docs") or path == "/openapi.json":
        return await call_next(request)

    resolved_client_ip = client_ip(request)
    is_auth_sensitive = (
        path == "/auth/login"
        or path.startswith("/auth/oauth/")
        or path == "/auth/register"
        or path == "/auth/forgot-password"
    )

    is_expensive = _is_expensive_path(path)
    if is_auth_sensitive:
        limiter = _auth_rate_limiter
        limit_value = settings.auth_rate_limit_requests
        key = f"auth:{resolved_client_ip}:{path}"
    elif is_expensive:
        limiter = _expensive_rate_limiter
        limit_value = settings.expensive_rate_limit_requests
        subject = _authenticated_subject(request) or f"ip:{resolved_client_ip}"
        key = f"expensive:{subject}"
    else:
        limiter = _rate_limiter
        limit_value = settings.rate_limit_requests
        subject = _authenticated_subject(request) or f"ip:{resolved_client_ip}"
        key = f"general:{subject}:{_route_group(path)}"

    checks = [(key, limiter, limit_value)]
    if path in {"/auth/login", "/auth/forgot-password"}:
        try:
            content_length = int(request.headers.get("content-length") or "0")
        except ValueError:
            content_length = 0
        if 0 < content_length <= 4096:
            try:
                body = await request.body()
                request._body = body
                parsed = json.loads(body)
                normalized_email = str(parsed.get("email") or "").strip().lower()
                if normalized_email:
                    digest = hmac.new(
                        settings.jwt_secret.encode("utf-8"),
                        normalized_email.encode("utf-8"),
                        hashlib.sha256,
                    ).hexdigest()
                    checks.append(
                        (
                            f"auth-target:{path}:{digest}",
                            _auth_target_rate_limiter,
                            settings.auth_subject_rate_limit_requests,
                        )
                    )
            except Exception:
                pass

    remaining = limit_value
    reset = limiter.window_seconds
    for check_key, check_limiter, check_limit in checks:
        try:
            shared_result = await _shared_rate_check(
                check_key,
                max_requests=check_limit,
                window_seconds=check_limiter.window_seconds,
            )
        except Exception:
            return JSONResponse(
                status_code=503,
                content={"detail": "Abuse protection is temporarily unavailable."},
                headers={"Retry-After": "3"},
            )
        allowed, key_remaining, key_reset = shared_result or check_limiter.check(check_key)
        remaining = min(remaining, key_remaining)
        reset = max(reset, key_reset)
        if not allowed:
            response = JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Try again later."},
            )
            response.headers["Retry-After"] = str(key_reset)
            response.headers["X-RateLimit-Limit"] = str(check_limit)
            response.headers["X-RateLimit-Remaining"] = "0"
            response.headers["X-RateLimit-Reset"] = str(key_reset)
            return response

    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = str(limit_value)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Reset"] = str(reset)
    return response

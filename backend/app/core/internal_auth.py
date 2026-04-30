import ipaddress

from fastapi import Header, HTTPException, Request

from app.core.config import settings


def _is_trusted_proxy(ip: str) -> bool:
    value = (ip or "").strip()
    if not value:
        return False
    if value in set(settings.trusted_proxy_ips or []):
        return True
    try:
        ip_obj = ipaddress.ip_address(value)
    except ValueError:
        return False
    for cidr in settings.trusted_proxy_cidrs or []:
        try:
            if ip_obj in ipaddress.ip_network(cidr, strict=False):
                return True
        except ValueError:
            continue
    return False


def _request_ip(request: Request) -> str:
    client_ip = request.client.host if request.client else ""
    xff = (request.headers.get("x-forwarded-for") or "").strip()
    if xff and _is_trusted_proxy(client_ip):
        # X-Forwarded-For: client, proxy1, proxy2
        # We accept the left-most entry as the original client when the immediate peer is trusted.
        return xff.split(",")[0].strip()
    return client_ip


def _is_allowed_internal_ip(ip: str) -> bool:
    allow = settings.internal_allowed_cidrs or []
    if not allow:
        return True
    try:
        ip_obj = ipaddress.ip_address((ip or "").strip())
    except ValueError:
        return False
    for cidr in allow:
        try:
            if ip_obj in ipaddress.ip_network(cidr, strict=False):
                return True
        except ValueError:
            continue
    return False


def require_internal_api_key(
    request: Request,
    x_internal_api_key: str | None = Header(default=None),
) -> None:
    configured_key = (settings.internal_api_key or "").strip()
    if not configured_key:
        raise HTTPException(status_code=500, detail="INTERNAL_API_KEY is not set")
    if not x_internal_api_key or x_internal_api_key.strip() != configured_key:
        raise HTTPException(status_code=401, detail="Unauthorized")
    ip = _request_ip(request)
    if not _is_allowed_internal_ip(ip):
        raise HTTPException(status_code=403, detail="Forbidden")

from __future__ import annotations

import ipaddress

from fastapi import Request

from app.core.config import settings


def _parsed_ip(value: str | None) -> ipaddress.IPv4Address | ipaddress.IPv6Address | None:
    try:
        return ipaddress.ip_address((value or "").strip())
    except ValueError:
        return None


def _is_trusted(value: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    if "*" in settings.trusted_proxy_ips:
        return True
    if str(value) in {item.strip() for item in settings.trusted_proxy_ips if item.strip()}:
        return True
    for raw_network in settings.trusted_proxy_cidrs:
        try:
            if value in ipaddress.ip_network(raw_network, strict=False):
                return True
        except ValueError:
            continue
    return False


def client_ip(request: Request) -> str:
    """Resolve an origin only through explicitly trusted proxy hops."""

    remote_raw = request.client.host if request.client and request.client.host else ""
    remote_ip = _parsed_ip(remote_raw)
    if remote_ip is None:
        return remote_raw or "unknown"
    if not _is_trusted(remote_ip):
        return str(remote_ip)

    forwarded = request.headers.get("x-forwarded-for") or ""
    chain = [
        parsed
        for parsed in (_parsed_ip(part) for part in forwarded.split(","))
        if parsed is not None
    ]
    if chain:
        for hop in reversed(chain):
            if not _is_trusted(hop):
                return str(hop)
        return str(chain[0])

    for header in ("x-real-ip", "cf-connecting-ip", "true-client-ip"):
        candidate = _parsed_ip(request.headers.get(header))
        if candidate is not None:
            return str(candidate)
    return str(remote_ip)

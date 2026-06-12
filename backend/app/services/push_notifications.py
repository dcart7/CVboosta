from __future__ import annotations

import json
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from http.client import HTTPSConnection

from jose import jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.device_push_token import DevicePushToken
from app.schemas.push import APNSDeviceRequest, PushDeliveryItem, PushDeliveryResponse, UserPushRequest

_PERMANENT_APNS_FAILURES = {
    "BadDeviceToken",
    "DeviceTokenNotForTopic",
    "TopicDisallowed",
    "Unregistered",
}
_cached_apns_jwt: str | None = None
_cached_apns_jwt_issued_at: int = 0


@dataclass
class APNSResult:
    token: str
    success: bool
    reason: str | None = None


def register_device_token(db: Session, user_id: int, payload: APNSDeviceRequest) -> DevicePushToken:
    device = db.query(DevicePushToken).filter(DevicePushToken.token == payload.token).first()
    now = datetime.now(timezone.utc)

    if device is None:
        device = DevicePushToken(
            user_id=user_id,
            token=payload.token,
            bundle_id=payload.bundle_id,
            platform="ios",
            apns_environment=payload.apns_environment,
            is_active=True,
            last_seen_at=now,
            deactivated_at=None,
        )
        db.add(device)
    else:
        device.user_id = user_id
        device.bundle_id = payload.bundle_id
        device.platform = "ios"
        device.apns_environment = payload.apns_environment
        device.is_active = True
        device.last_seen_at = now
        device.deactivated_at = None

    db.commit()
    db.refresh(device)
    return device


def deactivate_device_token(db: Session, user_id: int, payload: APNSDeviceRequest) -> bool:
    device = db.query(DevicePushToken).filter(DevicePushToken.token == payload.token).first()
    if device is None or device.user_id != user_id:
        return False

    device.bundle_id = payload.bundle_id
    device.apns_environment = payload.apns_environment
    device.is_active = False
    device.deactivated_at = datetime.now(timezone.utc)
    db.add(device)
    db.commit()
    return True


def send_push_to_user(db: Session, user_id: int, payload: UserPushRequest) -> PushDeliveryResponse:
    _ensure_apns_is_configured()
    devices = (
        db.query(DevicePushToken)
        .filter(DevicePushToken.user_id == user_id, DevicePushToken.is_active.is_(True))
        .all()
    )
    if not devices:
        return PushDeliveryResponse(requested=0, sent=0, failed=0, deactivated=0, results=[])

    results: list[PushDeliveryItem] = []
    sent = 0
    failed = 0
    deactivated = 0
    now = datetime.now(timezone.utc)

    for device in devices:
        result = send_push_to_device(device, payload)
        if result.success:
            sent += 1
            device.last_seen_at = now
            results.append(PushDeliveryItem(token=device.token, status="sent"))
            continue

        failed += 1
        if (result.reason or "") in _PERMANENT_APNS_FAILURES:
            device.is_active = False
            device.deactivated_at = now
            deactivated += 1

        results.append(PushDeliveryItem(token=device.token, status="failed", reason=result.reason))

    db.commit()
    return PushDeliveryResponse(
        requested=len(devices),
        sent=sent,
        failed=failed,
        deactivated=deactivated,
        results=results,
    )


def send_push_to_device(device: DevicePushToken, payload: UserPushRequest) -> APNSResult:
    headers = {
        "authorization": f"bearer {_get_apns_bearer_token()}",
        "apns-topic": device.bundle_id or settings.app_store_bundle_id,
        "apns-push-type": "alert",
        "content-type": "application/json",
    }
    if payload.collapse_id:
        headers["apns-collapse-id"] = payload.collapse_id

    request_payload = {
        "aps": {
            "alert": {
                "title": payload.alert.title,
                "body": payload.alert.body,
            }
        }
    }
    if payload.sound:
        request_payload["aps"]["sound"] = payload.sound
    if payload.badge is not None:
        request_payload["aps"]["badge"] = payload.badge
    if payload.data:
        request_payload.update(payload.data)

    host = "api.sandbox.push.apple.com" if device.apns_environment == "sandbox" else "api.push.apple.com"
    connection = HTTPSConnection(host, timeout=settings.apns_request_timeout_seconds)
    try:
        connection.request(
            "POST",
            f"/3/device/{device.token}",
            body=json.dumps(request_payload).encode("utf-8"),
            headers=headers,
        )
        response = connection.getresponse()
        raw_body = response.read().decode("utf-8", errors="replace")
    finally:
        connection.close()

    if response.status == 200:
        return APNSResult(token=device.token, success=True)

    reason = _extract_apns_reason(raw_body) or f"HTTP {response.status}"
    return APNSResult(token=device.token, success=False, reason=reason)


def _ensure_apns_is_configured() -> None:
    if not (settings.apns_key_id and settings.apns_team_id):
        raise RuntimeError("APNs credentials are not configured.")
    if not ((settings.apns_key_content or "").strip() or (settings.apns_key_path or "").strip()):
        raise RuntimeError("APNs private key is not configured.")


def _get_apns_bearer_token() -> str:
    global _cached_apns_jwt, _cached_apns_jwt_issued_at

    now = int(time.time())
    if _cached_apns_jwt and now - _cached_apns_jwt_issued_at < 50 * 60:
        return _cached_apns_jwt

    token = jwt.encode(
        {"iss": settings.apns_team_id, "iat": now},
        _load_apns_private_key(),
        algorithm="ES256",
        headers={"kid": settings.apns_key_id},
    )
    _cached_apns_jwt = token
    _cached_apns_jwt_issued_at = now
    return token


def _load_apns_private_key() -> str:
    inline_key = (settings.apns_key_content or "").strip()
    if inline_key:
        return inline_key.replace("\\n", "\n")

    path = (settings.apns_key_path or "").strip()
    if not path:
        raise RuntimeError("APNs private key is not configured.")
    with open(path, "r", encoding="utf-8") as file:
        return file.read()


def _extract_apns_reason(raw_body: str) -> str | None:
    if not raw_body:
        return None
    try:
        payload = json.loads(raw_body)
    except json.JSONDecodeError:
        return raw_body.strip() or None
    reason = payload.get("reason")
    if isinstance(reason, str) and reason.strip():
        return reason.strip()
    return raw_body.strip() or None

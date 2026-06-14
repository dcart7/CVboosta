from __future__ import annotations

import json
import logging
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from http.client import HTTPSConnection

from jose import jwt
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_sessionlocal
from app.models.device_push_token import DevicePushToken
from app.models.live_activity_start_token import LiveActivityStartToken
from app.models.live_activity_push_token import LiveActivityPushToken
from app.schemas.push import (
    APNSDeviceRequest,
    LiveActivityContentState,
    LiveActivityDeliveryItem,
    LiveActivityDeliveryResponse,
    LiveActivityEventRequest,
    LiveActivityStartRequest,
    LiveActivityStartTokenRequest,
    LiveActivityTokenRequest,
    PushAlert,
    PushDeliveryItem,
    PushDeliveryResponse,
    UserPushRequest,
)

_PERMANENT_APNS_FAILURES = {
    "BadDeviceToken",
    "DeviceTokenNotForTopic",
    "TopicDisallowed",
    "Unregistered",
}
logger = logging.getLogger(__name__)
_cached_apns_jwt: str | None = None
_cached_apns_jwt_issued_at: int = 0


@dataclass
class APNSResult:
    token: str
    success: bool
    reason: str | None = None


@dataclass
class LiveActivityAPNSResult:
    activity_id: str
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


def register_live_activity_token(db: Session, user_id: int, payload: LiveActivityTokenRequest) -> LiveActivityPushToken:
    activity = (
        db.query(LiveActivityPushToken)
        .filter(
            or_(
                LiveActivityPushToken.activity_id == payload.activity_id,
                LiveActivityPushToken.token == payload.token,
            )
        )
        .first()
    )
    now = datetime.now(timezone.utc)

    if activity is None:
        activity = LiveActivityPushToken(
            user_id=user_id,
            activity_id=payload.activity_id,
            token=payload.token,
            bundle_id=payload.bundle_id,
            platform="ios",
            mode=payload.mode,
            attributes_type=payload.attributes_type,
            apns_environment=payload.apns_environment,
            is_active=True,
            last_seen_at=now,
            deactivated_at=None,
        )
        db.add(activity)
    else:
        activity.user_id = user_id
        activity.activity_id = payload.activity_id
        activity.token = payload.token
        activity.bundle_id = payload.bundle_id
        activity.platform = "ios"
        activity.mode = payload.mode
        activity.attributes_type = payload.attributes_type
        activity.apns_environment = payload.apns_environment
        activity.is_active = True
        activity.last_seen_at = now
        activity.deactivated_at = None

    db.commit()
    db.refresh(activity)
    return activity


def deactivate_live_activity_token(db: Session, user_id: int, payload: LiveActivityTokenRequest) -> bool:
    activity = (
        db.query(LiveActivityPushToken)
        .filter(
            or_(
                LiveActivityPushToken.activity_id == payload.activity_id,
                LiveActivityPushToken.token == payload.token,
            )
        )
        .first()
    )
    if activity is None or activity.user_id != user_id:
        return False

    activity.token = payload.token
    activity.bundle_id = payload.bundle_id
    activity.mode = payload.mode
    activity.attributes_type = payload.attributes_type
    activity.apns_environment = payload.apns_environment
    activity.is_active = False
    activity.deactivated_at = datetime.now(timezone.utc)
    db.add(activity)
    db.commit()
    return True


def register_live_activity_start_token(
    db: Session,
    user_id: int,
    payload: LiveActivityStartTokenRequest,
) -> LiveActivityStartToken:
    start_token = db.query(LiveActivityStartToken).filter(LiveActivityStartToken.token == payload.token).first()
    now = datetime.now(timezone.utc)

    if start_token is None:
        start_token = LiveActivityStartToken(
            user_id=user_id,
            token=payload.token,
            bundle_id=payload.bundle_id,
            platform="ios",
            mode=payload.mode,
            attributes_type=payload.attributes_type,
            apns_environment=payload.apns_environment,
            is_active=True,
            last_seen_at=now,
            deactivated_at=None,
        )
        db.add(start_token)
    else:
        start_token.user_id = user_id
        start_token.token = payload.token
        start_token.bundle_id = payload.bundle_id
        start_token.platform = "ios"
        start_token.mode = payload.mode
        start_token.attributes_type = payload.attributes_type
        start_token.apns_environment = payload.apns_environment
        start_token.is_active = True
        start_token.last_seen_at = now
        start_token.deactivated_at = None

    db.commit()
    db.refresh(start_token)
    return start_token


def deactivate_live_activity_start_token(
    db: Session,
    user_id: int,
    payload: LiveActivityStartTokenRequest,
) -> bool:
    start_token = db.query(LiveActivityStartToken).filter(LiveActivityStartToken.token == payload.token).first()
    if start_token is None or start_token.user_id != user_id:
        return False

    start_token.bundle_id = payload.bundle_id
    start_token.mode = payload.mode
    start_token.attributes_type = payload.attributes_type
    start_token.apns_environment = payload.apns_environment
    start_token.is_active = False
    start_token.deactivated_at = datetime.now(timezone.utc)
    db.add(start_token)
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


def send_analysis_ready_push_best_effort(user_id: int, analysis_id: int | None = None) -> None:
    session_local = get_sessionlocal()
    if not session_local:
        logger.warning("Skipping analysis-ready push because DATABASE_URL is unavailable.", extra={"user_id": user_id})
        return

    db = session_local()
    try:
        send_push_to_user(
            db,
            user_id,
            UserPushRequest(
                alert=PushAlert(title="CVBoosta", body="Your analysis is ready"),
                badge=1,
                sound="default",
                data={
                    "event": "analysis_ready",
                    **({"analysis_id": analysis_id} if analysis_id is not None else {}),
                },
                collapse_id=f"analysis-ready-{analysis_id}" if analysis_id is not None else "analysis-ready",
            ),
        )
    except Exception:
        logger.exception(
            "Failed to send analysis-ready push notification.",
            extra={"user_id": user_id, "analysis_id": analysis_id},
        )
    finally:
        db.close()


def update_ats_live_activity_best_effort(user_id: int, progress: float, detail: str, eta_text: str) -> None:
    session_local = get_sessionlocal()
    if not session_local:
        logger.warning("Skipping ATS Live Activity update because DATABASE_URL is unavailable.", extra={"user_id": user_id})
        return

    db = session_local()
    try:
        send_live_activity_event_to_user(
            db,
            user_id,
            LiveActivityEventRequest(
                event="update",
                mode="atsOptimization",
                priority=5,
                state=LiveActivityContentState(
                    mode="atsOptimization",
                    title="ATS Scan running",
                    detail=detail,
                    progress=progress,
                    etaText=eta_text,
                ),
            ),
        )
    except Exception:
        logger.exception(
            "Failed to update ATS Live Activity remotely.",
            extra={"user_id": user_id, "progress": progress, "detail": detail},
        )
    finally:
        db.close()


def send_live_activity_event_to_user(
    db: Session,
    user_id: int,
    payload: LiveActivityEventRequest,
) -> LiveActivityDeliveryResponse:
    _ensure_apns_is_configured()
    target_mode = payload.mode or payload.state.mode
    activities = (
        db.query(LiveActivityPushToken)
        .filter(
            LiveActivityPushToken.user_id == user_id,
            LiveActivityPushToken.mode == target_mode,
            LiveActivityPushToken.is_active.is_(True),
        )
        .all()
    )
    if not activities:
        return LiveActivityDeliveryResponse(requested=0, sent=0, failed=0, deactivated=0, results=[])

    results: list[LiveActivityDeliveryItem] = []
    sent = 0
    failed = 0
    deactivated = 0
    now = datetime.now(timezone.utc)

    for activity in activities:
        result = send_live_activity_event_to_activity(activity, payload)
        if result.success:
            sent += 1
            activity.last_seen_at = now
            if payload.event == "end":
                activity.is_active = False
                activity.deactivated_at = now
                deactivated += 1
            results.append(
                LiveActivityDeliveryItem(
                    activity_id=activity.activity_id,
                    token=activity.token,
                    status="sent",
                )
            )
            continue

        failed += 1
        if (result.reason or "") in _PERMANENT_APNS_FAILURES:
            activity.is_active = False
            activity.deactivated_at = now
            deactivated += 1

        results.append(
            LiveActivityDeliveryItem(
                activity_id=activity.activity_id,
                token=activity.token,
                status="failed",
                reason=result.reason,
            )
        )

    db.commit()
    return LiveActivityDeliveryResponse(
        requested=len(activities),
        sent=sent,
        failed=failed,
        deactivated=deactivated,
        results=results,
    )


def send_live_activity_start_to_user(
    db: Session,
    user_id: int,
    payload: LiveActivityStartRequest,
) -> PushDeliveryResponse:
    _ensure_apns_is_configured()
    target_mode = payload.mode or payload.state.mode
    start_tokens = (
        db.query(LiveActivityStartToken)
        .filter(
            LiveActivityStartToken.user_id == user_id,
            LiveActivityStartToken.mode == target_mode,
            LiveActivityStartToken.attributes_type == payload.attributes_type,
            LiveActivityStartToken.is_active.is_(True),
        )
        .all()
    )
    if not start_tokens:
        return PushDeliveryResponse(requested=0, sent=0, failed=0, deactivated=0, results=[])

    results: list[PushDeliveryItem] = []
    sent = 0
    failed = 0
    deactivated = 0
    now = datetime.now(timezone.utc)

    for start_token in start_tokens:
        result = send_live_activity_start_to_token(start_token, payload)
        if result.success:
            sent += 1
            start_token.last_seen_at = now
            results.append(PushDeliveryItem(token=start_token.token, status="sent"))
            continue

        failed += 1
        if (result.reason or "") in _PERMANENT_APNS_FAILURES:
            start_token.is_active = False
            start_token.deactivated_at = now
            deactivated += 1

        results.append(PushDeliveryItem(token=start_token.token, status="failed", reason=result.reason))

    db.commit()
    return PushDeliveryResponse(
        requested=len(start_tokens),
        sent=sent,
        failed=failed,
        deactivated=deactivated,
        results=results,
    )


def end_ats_live_activity_best_effort(user_id: int, final_score: int) -> None:
    session_local = get_sessionlocal()
    if not session_local:
        logger.warning("Skipping ATS Live Activity end because DATABASE_URL is unavailable.", extra={"user_id": user_id})
        return

    db = session_local()
    try:
        send_live_activity_event_to_user(
            db,
            user_id,
            LiveActivityEventRequest(
                event="end",
                mode="atsOptimization",
                priority=10,
                state=LiveActivityContentState(
                    mode="atsOptimization",
                    title="ATS Scan Complete",
                    detail=f"Final score: {final_score}",
                    progress=1.0,
                    etaText="",
                ),
            ),
        )
    except Exception:
        logger.exception(
            "Failed to end ATS Live Activity remotely.",
            extra={"user_id": user_id, "final_score": final_score},
        )
    finally:
        db.close()


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

    status_code, raw_body = _send_apns_request(
        token=device.token,
        apns_environment=device.apns_environment,
        headers=headers,
        request_payload=request_payload,
    )

    if status_code == 200:
        return APNSResult(token=device.token, success=True)

    reason = _extract_apns_reason(raw_body) or f"HTTP {status_code}"
    return APNSResult(token=device.token, success=False, reason=reason)


def send_live_activity_event_to_activity(
    activity: LiveActivityPushToken,
    payload: LiveActivityEventRequest,
) -> LiveActivityAPNSResult:
    headers = _live_activity_headers(activity.bundle_id or settings.app_store_bundle_id, payload.priority)
    request_payload = {
        "aps": {
            "timestamp": int(time.time()),
            "event": payload.event,
            "content-state": payload.state.to_apns_dict(),
        }
    }
    if payload.stale_date is not None:
        request_payload["aps"]["stale-date"] = payload.stale_date
    if payload.dismissal_date is not None:
        request_payload["aps"]["dismissal-date"] = payload.dismissal_date
    if payload.alert:
        request_payload["aps"]["alert"] = {
            "title": payload.alert.title,
            "body": payload.alert.body,
        }

    status_code, raw_body = _send_apns_request(
        token=activity.token,
        apns_environment=activity.apns_environment,
        headers=headers,
        request_payload=request_payload,
    )
    if status_code == 200:
        return LiveActivityAPNSResult(activity_id=activity.activity_id, token=activity.token, success=True)

    reason = _extract_apns_reason(raw_body) or f"HTTP {status_code}"
    return LiveActivityAPNSResult(
        activity_id=activity.activity_id,
        token=activity.token,
        success=False,
        reason=reason,
    )


def send_live_activity_start_to_token(
    start_token: LiveActivityStartToken,
    payload: LiveActivityStartRequest,
) -> APNSResult:
    headers = _live_activity_headers(start_token.bundle_id or settings.app_store_bundle_id, payload.priority)
    request_payload = {
        "aps": {
            "timestamp": int(time.time()),
            "event": "start",
            "attributes-type": payload.attributes_type,
            "attributes": {
                "activityName": payload.activity_name,
            },
            "content-state": payload.state.to_apns_dict(),
        }
    }
    if payload.stale_date is not None:
        request_payload["aps"]["stale-date"] = payload.stale_date
    if payload.dismissal_date is not None:
        request_payload["aps"]["dismissal-date"] = payload.dismissal_date
    if payload.alert:
        request_payload["aps"]["alert"] = {
            "title": payload.alert.title,
            "body": payload.alert.body,
        }

    status_code, raw_body = _send_apns_request(
        token=start_token.token,
        apns_environment=start_token.apns_environment,
        headers=headers,
        request_payload=request_payload,
    )
    if status_code == 200:
        return APNSResult(token=start_token.token, success=True)

    reason = _extract_apns_reason(raw_body) or f"HTTP {status_code}"
    return APNSResult(token=start_token.token, success=False, reason=reason)


def _live_activity_headers(bundle_id: str, priority: int) -> dict[str, str]:
    return {
        "authorization": f"bearer {_get_apns_bearer_token()}",
        "apns-topic": f"{bundle_id}.push-type.liveactivity",
        "apns-push-type": "liveactivity",
        "apns-priority": str(priority),
        "content-type": "application/json",
    }


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


def _send_apns_request(
    *,
    token: str,
    apns_environment: str,
    headers: dict[str, str],
    request_payload: dict[str, object],
) -> tuple[int, str]:
    host = "api.sandbox.push.apple.com" if apns_environment == "sandbox" else "api.push.apple.com"
    connection = HTTPSConnection(host, timeout=settings.apns_request_timeout_seconds)
    try:
        connection.request(
            "POST",
            f"/3/device/{token}",
            body=json.dumps(request_payload).encode("utf-8"),
            headers=headers,
        )
        response = connection.getresponse()
        raw_body = response.read().decode("utf-8", errors="replace")
        return response.status, raw_body
    finally:
        connection.close()


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

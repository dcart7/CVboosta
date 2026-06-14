from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.push import APNSDeviceRequest, LiveActivityStartTokenRequest, LiveActivityTokenRequest, MessageResponse
from app.services.push_notifications import (
    deactivate_device_token,
    deactivate_live_activity_start_token,
    deactivate_live_activity_token,
    register_device_token,
    register_live_activity_start_token,
    register_live_activity_token,
)

router = APIRouter()


@router.post("/devices/apns", response_model=MessageResponse)
def register_apns_device(
    payload: APNSDeviceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    register_device_token(db, current_user.id, payload)
    return MessageResponse(message="APNs token registered.")


@router.post("/devices/apns/deactivate", response_model=MessageResponse)
def deactivate_apns_device(
    payload: APNSDeviceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    deactivated = deactivate_device_token(db, current_user.id, payload)
    if deactivated:
        return MessageResponse(message="APNs token deactivated.")
    return MessageResponse(message="APNs token already inactive.")


@router.post("/live-activities/apns", response_model=MessageResponse)
def register_live_activity_apns_token(
    payload: LiveActivityTokenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    register_live_activity_token(db, current_user.id, payload)
    return MessageResponse(message="Live Activity push token registered.")


@router.post("/live-activities/apns/deactivate", response_model=MessageResponse)
def deactivate_live_activity_apns_token(
    payload: LiveActivityTokenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    deactivated = deactivate_live_activity_token(db, current_user.id, payload)
    if deactivated:
        return MessageResponse(message="Live Activity push token deactivated.")
    return MessageResponse(message="Live Activity push token already inactive.")


@router.post("/live-activities/apns/push-to-start", response_model=MessageResponse)
def register_live_activity_push_to_start_token(
    payload: LiveActivityStartTokenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    register_live_activity_start_token(db, current_user.id, payload)
    return MessageResponse(message="Live Activity push-to-start token registered.")


@router.post("/live-activities/apns/push-to-start/deactivate", response_model=MessageResponse)
def deactivate_live_activity_push_to_start_token(
    payload: LiveActivityStartTokenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    deactivated = deactivate_live_activity_start_token(db, current_user.id, payload)
    if deactivated:
        return MessageResponse(message="Live Activity push-to-start token deactivated.")
    return MessageResponse(message="Live Activity push-to-start token already inactive.")

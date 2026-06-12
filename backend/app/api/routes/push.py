from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.push import APNSDeviceRequest, MessageResponse
from app.services.push_notifications import deactivate_device_token, register_device_token

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

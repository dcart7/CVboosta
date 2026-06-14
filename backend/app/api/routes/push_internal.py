from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.internal_auth import require_internal_api_key
from app.db.session import get_db
from app.schemas.push import (
    LiveActivityDeliveryResponse,
    LiveActivityEventRequest,
    LiveActivityStartRequest,
    PushDeliveryResponse,
    UserPushRequest,
)
from app.services.push_notifications import send_live_activity_event_to_user, send_live_activity_start_to_user, send_push_to_user

router = APIRouter(dependencies=[Depends(require_internal_api_key)])


@router.post("/notifications/users/{user_id}/push", response_model=PushDeliveryResponse)
def push_user_notification(
    user_id: int,
    payload: UserPushRequest,
    db: Session = Depends(get_db),
) -> PushDeliveryResponse:
    try:
        return send_push_to_user(db, user_id, payload)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/live-activities/users/{user_id}", response_model=LiveActivityDeliveryResponse)
def push_live_activity_update(
    user_id: int,
    payload: LiveActivityEventRequest,
    db: Session = Depends(get_db),
) -> LiveActivityDeliveryResponse:
    try:
        return send_live_activity_event_to_user(db, user_id, payload)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/live-activities/users/{user_id}/start", response_model=PushDeliveryResponse)
def push_live_activity_start(
    user_id: int,
    payload: LiveActivityStartRequest,
    db: Session = Depends(get_db),
) -> PushDeliveryResponse:
    try:
        return send_live_activity_start_to_user(db, user_id, payload)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

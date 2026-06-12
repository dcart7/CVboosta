from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.internal_auth import require_internal_api_key
from app.db.session import get_db
from app.schemas.push import PushDeliveryResponse, UserPushRequest
from app.services.push_notifications import send_push_to_user

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

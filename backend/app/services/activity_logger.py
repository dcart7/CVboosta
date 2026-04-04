from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.activity import ActivityLog


def record_activity(
    db: Session,
    *,
    user_id: int,
    action: str,
    meta: dict | None = None,
) -> None:
    log = ActivityLog(user_id=user_id, action=action, meta=meta or {})
    db.add(log)
    db.commit()

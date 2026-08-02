from __future__ import annotations

import logging

from sqlalchemy.orm import Session

from app.models.activity import ActivityLog


logger = logging.getLogger(__name__)


def record_activity(
    db: Session,
    *,
    user_id: int,
    action: str,
    meta: dict | None = None,
) -> bool:
    """Write non-critical activity telemetry without affecting business data.

    Activity logging used to commit or roll back the caller's transaction and a
    telemetry outage could therefore turn a successful purchase/optimization
    into an API error.  A short-lived isolated session keeps this best-effort.
    """
    activity_db = Session(bind=db.get_bind())
    try:
        log = ActivityLog(user_id=user_id, action=action[:120], meta=meta or {})
        activity_db.add(log)
        activity_db.commit()
        return True
    except Exception:
        activity_db.rollback()
        logger.warning(
            "Activity telemetry write failed",
            extra={"activity_action": action[:120]},
        )
        return False
    finally:
        activity_db.close()

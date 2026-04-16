from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.activity import ActivityLog
from app.models.user import User

FAIR_USE_TIERS = {"pro", "lifetime"}
FAIR_USE_MAX_PER_MINUTE = 10
FAIR_USE_MAX_PER_DAY = 100
FAIR_USE_ACTIONS = (
    "CV optimized",
    "Cover letter generated",
    "Interview prep",
)


def _is_fair_use_tier(user: User) -> bool:
    return (user.subscription_tier or "").lower() in FAIR_USE_TIERS


def enforce_fair_use_or_raise(db: Session, user: User) -> None:
    """Apply fair-use caps for unlimited tiers using persisted activity logs."""
    if user.email == "dcartheartist@gmail.com":
        return
    if not _is_fair_use_tier(user):
        return

    now = datetime.now(timezone.utc)
    minute_ago = now - timedelta(minutes=1)
    day_ago = now - timedelta(days=1)

    minute_count = (
        db.query(ActivityLog)
        .filter(
            ActivityLog.user_id == user.id,
            ActivityLog.action.in_(FAIR_USE_ACTIONS),
            ActivityLog.created_at >= minute_ago,
        )
        .count()
    )
    if minute_count >= FAIR_USE_MAX_PER_MINUTE:
        raise HTTPException(
            status_code=429,
            detail=(
                "Fair Use Policy limit reached: maximum 10 requests per minute "
                "for this plan. Please try again shortly."
            ),
        )

    day_count = (
        db.query(ActivityLog)
        .filter(
            ActivityLog.user_id == user.id,
            ActivityLog.action.in_(FAIR_USE_ACTIONS),
            ActivityLog.created_at >= day_ago,
        )
        .count()
    )
    if day_count >= FAIR_USE_MAX_PER_DAY:
        raise HTTPException(
            status_code=429,
            detail=(
                "Fair Use Policy limit reached: maximum 100 requests per day "
                "for this plan."
            ),
        )

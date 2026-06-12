from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import case, update
from sqlalchemy.orm import Session

from app.models.user import User
from app.services.app_store import consume_app_store_scan_credit, refresh_app_store_entitlement_from_transactions


_FEATURE_TO_COUNTER: dict[str, str] = {
    "scan": "daily_scans_count",
    "cl": "daily_cl_count",
    "prep": "daily_prep_count",
}

_FEATURE_TO_LIMIT_KEY: dict[str, str] = {
    "scan": "scans",
    "cl": "cl",
    "prep": "prep",
}


def consume_feature_or_raise(
    db: Session,
    *,
    user_id: int,
    feature: str,
    exhausted_detail: str,
) -> User:
    """
    Atomically consume 1 unit of a feature quota for the user.

    This prevents a race where multiple concurrent long-running requests pass the
    `can_use()` check before the counter is incremented.
    """
    counter_field = _FEATURE_TO_COUNTER.get(feature)
    if not counter_field:
        raise ValueError(f"Unknown feature: {feature}")

    # Fetch minimal fields first; the actual consume happens via an atomic UPDATE.
    # (Avoids a read-modify-write race for concurrent requests.)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required.")

    entitlement = refresh_app_store_entitlement_from_transactions(db, user_id)
    if (
        feature == "scan"
        and entitlement
        and user.paddle_subscription_id is None
        and tier_includes_app_store_plan(user.subscription_tier)
        and not entitlement.is_active
    ):
        user.subscription_tier = "free"
        user.subscription_active_until = None
        db.add(user)
        db.flush()

    tier = (user.subscription_tier or "free").strip().lower()
    now = datetime.now(timezone.utc)
    if tier != "single":
        if user.last_usage_reset is None or user.last_usage_reset.date() < now.date():
            db.execute(
                update(User)
                .where(User.id == user_id)
                .values(
                    daily_scans_count=0,
                    daily_cl_count=0,
                    daily_prep_count=0,
                    last_usage_reset=now,
                )
            )

    if tier == "single":
        counter_col = getattr(User, counter_field)
        result = db.execute(
            update(User)
            .where(User.id == user_id)
            .where(counter_col > 0)
            .values({counter_field: counter_col - 1})
        )
        if (result.rowcount or 0) <= 0:
            raise HTTPException(status_code=402, detail=exhausted_detail)
    else:
        limits = user.get_limits()
        limit_key = _FEATURE_TO_LIMIT_KEY.get(feature, feature)
        limit = int(limits.get(limit_key, 0))
        counter_col = getattr(User, counter_field)
        result = db.execute(
            update(User)
            .where(User.id == user_id)
            .where(counter_col < limit)
            .values({counter_field: counter_col + 1})
        )
        if (result.rowcount or 0) <= 0:
            if feature == "scan" and consume_app_store_scan_credit(db, user_id):
                db.commit()
                return db.query(User).filter(User.id == user_id).first()  # type: ignore[return-value]
            raise HTTPException(status_code=402, detail=exhausted_detail)

    db.commit()
    return db.query(User).filter(User.id == user_id).first()  # type: ignore[return-value]


def refund_feature_best_effort(
    db: Session,
    *,
    user_id: int,
    feature: str,
) -> None:
    """Best-effort refund of a previously consumed quota unit."""
    counter_field = _FEATURE_TO_COUNTER.get(feature)
    if not counter_field:
        return

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return

    tier = (user.subscription_tier or "free").strip().lower()
    counter_col = getattr(User, counter_field)
    if tier == "single":
        db.execute(
            update(User)
            .where(User.id == user_id)
            .values({counter_field: counter_col + 1})
        )
    else:
        db.execute(
            update(User)
            .where(User.id == user_id)
            .values({counter_field: case((counter_col > 0, counter_col - 1), else_=0)})
        )
    db.commit()


def tier_includes_app_store_plan(tier: str | None) -> bool:
    return (tier or "").strip().lower() in {"go", "pro"}

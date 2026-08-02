from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.billing import StripePaymentApplication, UserBillingEntitlement
from app.models.user import User
from app.services.app_store import (
    get_app_store_scan_credit_balance,
    has_app_store_plan_history,
    refresh_app_store_entitlement_from_transactions,
)


def lifetime_tier_is_verified(
    db: Session,
    user: User,
    *,
    app_store_entitlement: UserBillingEntitlement | None = None,
) -> bool:
    """Fail closed when a cached lifetime tier came from a revoked Apple sale."""
    if (user.subscription_tier or "").strip().lower() != "lifetime":
        return False

    entitlement = app_store_entitlement
    if entitlement is None:
        entitlement = refresh_app_store_entitlement_from_transactions(db, user.id)
    if entitlement and entitlement.is_active and entitlement.plan == "lifetime":
        return True

    if not has_app_store_plan_history(db, user.id, plan="lifetime"):
        # A lifetime tier with no Apple lifetime history is a web entitlement.
        return True

    # Once Apple has revoked its lifetime transaction, only the permanent
    # Stripe application ledger can prove a separate web lifetime purchase.
    return (
        db.query(StripePaymentApplication.id)
        .filter(
            StripePaymentApplication.user_id == user.id,
            StripePaymentApplication.tier == "lifetime",
        )
        .first()
        is not None
    )


def has_paid_entitlement(
    db: Session,
    user: User,
    *,
    feature: str | None = None,
) -> bool:
    app_store = refresh_app_store_entitlement_from_transactions(db, user.id)
    if app_store and app_store.is_active and app_store.plan in {"go", "pro", "lifetime"}:
        return True
    if feature == "scan" and get_app_store_scan_credit_balance(db, user.id) > 0:
        return True

    tier = (user.subscription_tier or "free").strip().lower()
    if tier == "lifetime":
        return lifetime_tier_is_verified(
            db,
            user,
            app_store_entitlement=app_store,
        )
    if tier == "single":
        if feature == "scan":
            return int(user.daily_scans_count or 0) > 0
        return any(
            int(value or 0) > 0
            for value in (
                user.daily_scans_count,
                user.daily_cl_count,
                user.daily_prep_count,
            )
        )
    if tier not in {"go", "pro"} or not (user.paddle_subscription_id or "").strip():
        return False
    active_until = user.subscription_active_until
    if active_until is None:
        # A provider id by itself is not proof of a currently paid period.
        # Stripe webhooks/status refresh persist the verified period end.
        return False
    if active_until.tzinfo is None:
        active_until = active_until.replace(tzinfo=timezone.utc)
    return active_until > datetime.now(timezone.utc)


def require_paid_entitlement(
    db: Session,
    user: User,
    *,
    feature: str | None = None,
    detail: str = "A paid plan is required for the full result.",
    code: str = "paid_entitlement_required",
) -> None:
    if not has_paid_entitlement(db, user, feature=feature):
        raise HTTPException(
            status_code=402,
            detail={"code": code, "message": detail},
        )

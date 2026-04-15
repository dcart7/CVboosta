import hashlib
import hmac
import json
import time
from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.services.activity_logger import record_activity

router = APIRouter()

SIGNATURE_MAX_AGE_SECONDS = 5 * 60


def _parse_paddle_signature(signature_header: str) -> tuple[int, str] | None:
    try:
        parts = [p.strip() for p in signature_header.split(";") if p.strip()]
        values: dict[str, str] = {}
        for part in parts:
            if "=" not in part:
                continue
            key, value = part.split("=", 1)
            values[key.strip()] = value.strip()
        ts_raw = values.get("ts")
        h1 = values.get("h1")
        if not ts_raw or not h1:
            return None
        return int(ts_raw), h1
    except Exception:
        return None


def verify_paddle_webhook(
    request_body: bytes,
    signature_header: str | None,
    secret: str | None,
) -> bool:
    if not secret or not signature_header:
        return False
    parsed = _parse_paddle_signature(signature_header)
    if not parsed:
        return False

    timestamp, provided_signature = parsed
    now = int(time.time())
    if abs(now - timestamp) > SIGNATURE_MAX_AGE_SECONDS:
        return False

    signed_payload = f"{timestamp}:".encode("utf-8") + request_body
    expected_signature = hmac.new(
        secret.encode("utf-8"),
        signed_payload,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected_signature, provided_signature)


def _extract_email(payload: dict[str, Any]) -> str | None:
    customer = payload.get("customer") or {}
    custom_data = payload.get("custom_data") or {}
    email = (
        customer.get("email")
        or payload.get("customer_email")
        or custom_data.get("email")
    )
    if isinstance(email, str) and email.strip():
        return email.strip().lower()
    return None


def _extract_price_ids(payload: dict[str, Any]) -> set[str]:
    ids: set[str] = set()
    items = payload.get("items") or []
    if isinstance(items, list):
        for item in items:
            if not isinstance(item, dict):
                continue
            price_obj = item.get("price")
            if isinstance(price_obj, dict):
                pid = price_obj.get("id")
                if isinstance(pid, str) and pid:
                    ids.add(pid)
            pid_direct = item.get("price_id")
            if isinstance(pid_direct, str) and pid_direct:
                ids.add(pid_direct)
    return ids


def _resolve_tier(payload: dict[str, Any]) -> str | None:
    custom_data = payload.get("custom_data") or {}
    tier = custom_data.get("tier")
    if isinstance(tier, str) and tier.strip():
        normalized = tier.strip().lower()
        mapping = {
            "single_scan": "single",
            "single": "single",
            "go": "go",
            "pro": "pro",
            "lifetime": "lifetime",
        }
        if normalized in mapping:
            return mapping[normalized]

    price_ids = _extract_price_ids(payload)
    id_map = {
        settings.paddle_price_single_scan: "single",
        settings.paddle_price_go_weekly: "go",
        settings.paddle_price_go_monthly: "go",
        settings.paddle_price_pro_weekly: "pro",
        settings.paddle_price_pro_monthly: "pro",
        settings.paddle_price_lifetime: "lifetime",
    }
    for price_id, mapped_tier in id_map.items():
        if price_id and price_id in price_ids:
            return mapped_tier
    return None

@router.post("/webhook")
async def paddle_webhook(
    request: Request,
    db: Session = Depends(get_db),
    paddle_signature: str = Header(None, alias="Paddle-Signature")
):
    body = await request.body()
    secret = settings.paddle_webhook_secret
    
    if not verify_paddle_webhook(body, paddle_signature, secret):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    try:
        data = json.loads(body)
        event_type = data.get("event_type") or data.get("eventType") or data.get("event")
        payload = data.get("data", {})
        if not isinstance(payload, dict):
            return {"status": "ok", "message": "No payload data"}

        email = _extract_email(payload)
        if not email:
            return {"status": "ok", "message": "No email found in event"}

        user = db.query(User).filter(User.email == email).first()
        if not user:
            return {"status": "ok", "message": "User not found"}

        subscription_events = {
            "subscription.created",
            "subscription.updated",
            "subscription.resumed",
            "subscription.activated",
        }
        cancel_events = {"subscription.canceled", "subscription.paused"}
        one_time_events = {"transaction.completed"}

        if event_type in subscription_events:
            resolved_tier = _resolve_tier(payload) or "go"
            user.subscription_tier = resolved_tier
            if isinstance(payload.get("id"), str):
                user.paddle_subscription_id = payload.get("id")
            if isinstance(payload.get("customer_id"), str):
                user.paddle_customer_id = payload.get("customer_id")
            db.add(user)
            db.commit()
            record_activity(
                db,
                user_id=user.id,
                action="Subscription updated",
                meta={"tier": user.subscription_tier, "event": event_type},
            )

        elif event_type in one_time_events:
            resolved_tier = _resolve_tier(payload)
            if resolved_tier in {"single", "lifetime"}:
                user.subscription_tier = resolved_tier
                if resolved_tier == "single":
                    # One-time quota starts fresh from 1/1/1 usage allowance.
                    user.daily_scans_count = 0
                    user.daily_cl_count = 0
                    user.daily_prep_count = 0
                if isinstance(payload.get("customer_id"), str):
                    user.paddle_customer_id = payload.get("customer_id")
                db.add(user)
                db.commit()
                record_activity(
                    db,
                    user_id=user.id,
                    action="One-time purchase applied",
                    meta={"tier": user.subscription_tier, "event": event_type},
                )

        elif event_type == "subscription.canceled":
            user.subscription_tier = "free"
            user.paddle_subscription_id = None
            db.add(user)
            db.commit()
            record_activity(
                db,
                user_id=user.id,
                action="Subscription canceled",
                meta={"event": event_type},
            )
        elif event_type in cancel_events:
            user.subscription_tier = "free"
            user.paddle_subscription_id = None
            db.add(user)
            db.commit()
            record_activity(
                db,
                user_id=user.id,
                action="Subscription stopped",
                meta={"event": event_type},
            )

        return {"status": "ok"}
    except Exception as e:
        print(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

@router.get("/status")
def get_subscription_status(current_user: User = Depends(get_current_user)):
    tier = current_user.subscription_tier
    if current_user.email == "dcartheartist@gmail.com":
        tier = "lifetime"

    # Simple endpoint to return tier and limits
    return {
        "tier": tier,
        "limits": current_user.get_limits(),
        "usage": {
            "scans": current_user.daily_scans_count,
            "cl": current_user.daily_cl_count,
            "prep": current_user.daily_prep_count
        }
    }

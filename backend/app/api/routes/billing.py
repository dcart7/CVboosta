import hashlib
import hmac
import json
import time
from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
import stripe

from app.api.routes.auth import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.services.activity_logger import record_activity

router = APIRouter()

SIGNATURE_MAX_AGE_SECONDS = 5 * 60


class StripeCheckoutRequest(BaseModel):
    tier: str
    billing_cycle: str | None = None
    success_url: str | None = None
    cancel_url: str | None = None


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


def _resolve_stripe_tier_by_price_id(price_id: str | None) -> str | None:
    if not price_id:
        return None
    price_map = {
        settings.stripe_price_single_scan: "single",
        settings.stripe_price_go_weekly: "go",
        settings.stripe_price_go_monthly: "go",
        settings.stripe_price_pro_weekly: "pro",
        settings.stripe_price_pro_monthly: "pro",
        settings.stripe_price_lifetime: "lifetime",
    }
    return price_map.get(price_id)


def _resolve_stripe_price_for_checkout(tier: str, billing_cycle: str | None) -> tuple[str, str]:
    tier_key = (tier or "").strip().lower()
    cycle_key = (billing_cycle or "").strip().lower()
    if tier_key == "single":
        if not settings.stripe_price_single_scan:
            raise HTTPException(status_code=500, detail="Stripe single scan price is not configured.")
        return settings.stripe_price_single_scan, "payment"
    if tier_key == "lifetime":
        if not settings.stripe_price_lifetime:
            raise HTTPException(status_code=500, detail="Stripe lifetime price is not configured.")
        return settings.stripe_price_lifetime, "payment"
    if tier_key == "go":
        if cycle_key == "week":
            if not settings.stripe_price_go_weekly:
                raise HTTPException(status_code=500, detail="Stripe Go weekly price is not configured.")
            return settings.stripe_price_go_weekly, "subscription"
        if not settings.stripe_price_go_monthly:
            raise HTTPException(status_code=500, detail="Stripe Go monthly price is not configured.")
        return settings.stripe_price_go_monthly, "subscription"
    if tier_key == "pro":
        if cycle_key == "week":
            if not settings.stripe_price_pro_weekly:
                raise HTTPException(status_code=500, detail="Stripe Pro weekly price is not configured.")
            return settings.stripe_price_pro_weekly, "subscription"
        if not settings.stripe_price_pro_monthly:
            raise HTTPException(status_code=500, detail="Stripe Pro monthly price is not configured.")
        return settings.stripe_price_pro_monthly, "subscription"
    raise HTTPException(status_code=400, detail="Unknown checkout tier.")


def _find_user_for_stripe_object(db: Session, payload: dict[str, Any]) -> User | None:
    metadata = payload.get("metadata") or {}
    email = None
    if isinstance(payload.get("customer_details"), dict):
        email = payload.get("customer_details", {}).get("email")
    if not email:
        email = metadata.get("email")
    if isinstance(email, str) and email.strip():
        user = db.query(User).filter(User.email == email.strip().lower()).first()
        if user:
            return user
    customer_id = payload.get("customer")
    if isinstance(customer_id, str) and customer_id:
        return db.query(User).filter(User.paddle_customer_id == customer_id).first()
    return None


@router.post("/stripe/checkout-session")
def create_stripe_checkout_session(
    payload: StripeCheckoutRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
):
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=500, detail="Stripe secret key is not configured.")
    stripe.api_key = settings.stripe_secret_key

    price_id, mode = _resolve_stripe_price_for_checkout(payload.tier, payload.billing_cycle)
    origin = f"{request.url.scheme}://{request.url.netloc}"
    success_url = payload.success_url or f"{origin}/account?billing=success"
    cancel_url = payload.cancel_url or f"{origin}/pricing?billing=cancel"

    metadata = {
        "user_id": str(current_user.id),
        "email": current_user.email,
        "tier": payload.tier.lower(),
        "period": (payload.billing_cycle or "one_time").lower(),
    }

    try:
        session_params: dict[str, Any] = {
            "mode": mode,
            "line_items": [{"price": price_id, "quantity": 1}],
            "success_url": success_url,
            "cancel_url": cancel_url,
            "customer_email": current_user.email,
            "client_reference_id": str(current_user.id),
            "metadata": metadata,
        }
        if mode == "subscription":
            session_params["subscription_data"] = {"metadata": metadata}
        checkout_session = stripe.checkout.Session.create(**session_params)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Stripe checkout error: {exc}") from exc

    return {"checkout_url": checkout_session.url, "session_id": checkout_session.id}


@router.post("/stripe/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
    stripe_signature: str | None = Header(default=None, alias="Stripe-Signature"),
):
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=500, detail="Stripe secret key is not configured.")
    stripe.api_key = settings.stripe_secret_key

    body = await request.body()
    if settings.stripe_webhook_secret:
        if not stripe_signature:
            raise HTTPException(status_code=400, detail="Missing Stripe-Signature")
        try:
            event = stripe.Webhook.construct_event(
                payload=body,
                sig_header=stripe_signature,
                secret=settings.stripe_webhook_secret,
            )
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Invalid webhook signature: {exc}") from exc
    else:
        event = json.loads(body.decode("utf-8"))

    event_type = event.get("type")
    obj = event.get("data", {}).get("object", {})
    if not isinstance(obj, dict):
        return {"status": "ok"}

    user = _find_user_for_stripe_object(db, obj)
    if not user:
        return {"status": "ok", "message": "User not found"}

    if event_type == "checkout.session.completed":
        metadata = obj.get("metadata") or {}
        tier = (metadata.get("tier") or "").strip().lower()
        resolved_tier = None
        if tier in {"single", "single_scan", "go", "pro", "lifetime"}:
            resolved_tier = "single" if tier in {"single", "single_scan"} else tier
        if not resolved_tier:
            session_id = obj.get("id")
            if session_id:
                line_items = stripe.checkout.Session.list_line_items(session_id, limit=1)
                price_id = None
                if line_items and getattr(line_items, "data", None):
                    first_item = line_items.data[0]
                    price = getattr(first_item, "price", None)
                    price_id = getattr(price, "id", None) if price is not None else None
                resolved_tier = _resolve_stripe_tier_by_price_id(price_id)

        if resolved_tier:
            user.subscription_tier = resolved_tier
            if resolved_tier == "single":
                user.daily_scans_count = 0
                user.daily_cl_count = 0
                user.daily_prep_count = 0
            customer_id = obj.get("customer")
            if isinstance(customer_id, str):
                user.paddle_customer_id = customer_id
            subscription_id = obj.get("subscription")
            if isinstance(subscription_id, str):
                user.paddle_subscription_id = subscription_id
            db.add(user)
            db.commit()
            record_activity(
                db,
                user_id=user.id,
                action="Stripe checkout completed",
                meta={"tier": user.subscription_tier, "event": event_type},
            )

    elif event_type in {"customer.subscription.deleted"}:
        user.subscription_tier = "free"
        user.paddle_subscription_id = None
        db.add(user)
        db.commit()
        record_activity(db, user_id=user.id, action="Stripe subscription canceled", meta={"event": event_type})

    elif event_type in {"customer.subscription.updated", "customer.subscription.created"}:
        items = obj.get("items", {}).get("data", [])
        price_id = None
        if isinstance(items, list) and items:
            price_obj = items[0].get("price", {})
            if isinstance(price_obj, dict):
                price_id = price_obj.get("id")
        tier = _resolve_stripe_tier_by_price_id(price_id)
        status = (obj.get("status") or "").lower()
        if status in {"canceled", "incomplete_expired", "unpaid"}:
            user.subscription_tier = "free"
            user.paddle_subscription_id = None
        elif tier:
            user.subscription_tier = tier
            subscription_id = obj.get("id")
            customer_id = obj.get("customer")
            if isinstance(subscription_id, str):
                user.paddle_subscription_id = subscription_id
            if isinstance(customer_id, str):
                user.paddle_customer_id = customer_id
        db.add(user)
        db.commit()
        record_activity(
            db,
            user_id=user.id,
            action="Stripe subscription updated",
            meta={"event": event_type, "status": status, "tier": user.subscription_tier},
        )

    return {"status": "ok"}

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

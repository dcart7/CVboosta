import hashlib
import hmac
import json
import time
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session
import stripe

from app.api.routes.auth import get_current_user
from app.core.config import get_cors_origins, settings
from app.db.session import get_db
from app.models.user import LIFETIME_WHITELIST_EMAILS, User
from app.services.activity_logger import record_activity

router = APIRouter()

SIGNATURE_MAX_AGE_SECONDS = 5 * 60


class StripeCheckoutRequest(BaseModel):
    tier: str
    billing_cycle: str | None = None
    success_url: str | None = None
    cancel_url: str | None = None


def _safe_checkout_redirect_url(
    candidate_url: str | None,
    *,
    allowed_origins: set[str],
    fallback_url: str,
) -> str:
    value = (candidate_url or "").strip()
    if not value:
        return fallback_url
    # Prevent open redirect abuse: only allow redirects to trusted frontend origins.
    origin = _extract_origin(value)
    if origin and origin in allowed_origins:
        return value
    return fallback_url


def _normalize_origin(value: str | None) -> str | None:
    raw = (value or "").strip()
    if not raw:
        return None
    return raw.rstrip("/")


def _extract_origin(url: str | None) -> str | None:
    raw = (url or "").strip()
    if not raw:
        return None
    parsed = urlparse(raw)
    if parsed.scheme and parsed.netloc:
        return f"{parsed.scheme}://{parsed.netloc}".rstrip("/")
    return None


def _stripe_to_dict(value: Any) -> dict[str, Any]:
    if isinstance(value, dict):
        return value
    to_dict_recursive = getattr(value, "to_dict_recursive", None)
    if callable(to_dict_recursive):
        result = to_dict_recursive()
        if isinstance(result, dict):
            return result
    try:
        return dict(value)
    except Exception:
        return {}


def _from_unix_ts(value: Any) -> datetime | None:
    if isinstance(value, (int, float)):
        try:
            return datetime.fromtimestamp(value, tz=timezone.utc)
        except Exception:
            return None
    return None


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


def _extract_stripe_subscription_tier(subscription_obj: dict[str, Any]) -> str | None:
    items = subscription_obj.get("items", {}).get("data", [])
    if not isinstance(items, list) or not items:
        return None
    first_item = items[0] if isinstance(items[0], dict) else {}
    price_obj = first_item.get("price", {})
    if not isinstance(price_obj, dict):
        return None
    return _resolve_stripe_tier_by_price_id(price_obj.get("id"))


def _apply_paid_tier_to_user(
    user: User,
    *,
    resolved_tier: str,
    customer_id: str | None = None,
    subscription_id: str | None = None,
    period_end_dt: datetime | None = None,
) -> None:
    previous_tier = (user.subscription_tier or "").lower()
    user.subscription_tier = resolved_tier
    if resolved_tier == "single":
        if previous_tier != "single":
            user.daily_scans_count = 0
            user.daily_cl_count = 0
            user.daily_prep_count = 0
        # Single Scan is credit-based: each purchase adds one full bundle.
        user.daily_scans_count += 1
        user.daily_cl_count += 1
        user.daily_prep_count += 1
        user.paddle_subscription_id = None
        user.subscription_active_until = None
    else:
        # Non-single tiers are usage-based; keep counters as usage counters.
        user.daily_scans_count = 0
        user.daily_cl_count = 0
        user.daily_prep_count = 0
    if customer_id:
        user.paddle_customer_id = customer_id
    if subscription_id:
        user.paddle_subscription_id = subscription_id
    if period_end_dt is not None:
        user.subscription_active_until = period_end_dt


def _find_user_for_stripe_object(db: Session, payload: dict[str, Any]) -> User | None:
    metadata = payload.get("metadata") or {}
    id_candidates = [
        metadata.get("user_id"),
        payload.get("client_reference_id"),
    ]
    for candidate in id_candidates:
        if candidate is None:
            continue
        try:
            user_id = int(str(candidate).strip())
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                return user
        except Exception:
            continue

    emails: list[str] = []
    if isinstance(payload.get("customer_details"), dict):
        details_email = payload.get("customer_details", {}).get("email")
        if isinstance(details_email, str) and details_email.strip():
            emails.append(details_email.strip())
    for value in [metadata.get("email"), payload.get("customer_email")]:
        if isinstance(value, str) and value.strip():
            emails.append(value.strip())
    for email in emails:
        normalized = email.lower()
        user = db.query(User).filter(func.lower(User.email) == normalized).first()
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
    request_origin = f"{request.url.scheme}://{request.url.netloc}".rstrip("/")
    request_header_origin = _normalize_origin(request.headers.get("origin"))
    referer_origin = _extract_origin(request.headers.get("referer"))

    allowed_origins: set[str] = {request_origin}
    for value in get_cors_origins():
        normalized = _normalize_origin(value)
        if normalized:
            allowed_origins.add(normalized)

    # Runtime origins from browser request can differ from API host (frontend -> backend).
    # Trust them only as exact origins and only for this request flow.
    if request_header_origin:
        allowed_origins.add(request_header_origin)
    if referer_origin:
        allowed_origins.add(referer_origin)

    payload_success_origin = _extract_origin(payload.success_url)
    payload_cancel_origin = _extract_origin(payload.cancel_url)
    preferred_frontend_origin = next(
        (
            origin
            for origin in [
                payload_success_origin,
                payload_cancel_origin,
                request_header_origin,
                referer_origin,
            ]
            if origin and origin in allowed_origins
        ),
        None,
    )
    if not preferred_frontend_origin:
        preferred_frontend_origin = next(
            (
                origin
                for origin in allowed_origins
                if origin.startswith("https://")
                and "localhost" not in origin
                and "127.0.0.1" not in origin
                and origin != request_origin
            ),
            request_origin,
        )

    success_fallback = (
        f"{preferred_frontend_origin}/account?billing=success&session_id={{CHECKOUT_SESSION_ID}}"
    )
    cancel_fallback = f"{preferred_frontend_origin}/pricing?billing=cancel"
    success_url = _safe_checkout_redirect_url(
        payload.success_url, allowed_origins=allowed_origins, fallback_url=success_fallback
    )
    cancel_url = _safe_checkout_redirect_url(
        payload.cancel_url, allowed_origins=allowed_origins, fallback_url=cancel_fallback
    )

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
        raise HTTPException(status_code=500, detail="Stripe checkout failed. Please try again.") from exc

    return {"checkout_url": checkout_session.url, "session_id": checkout_session.id}


@router.post("/stripe/cancel-subscription")
def cancel_stripe_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=500, detail="Stripe secret key is not configured.")
    if not current_user.paddle_subscription_id:
        raise HTTPException(status_code=400, detail="No active subscription found.")

    stripe.api_key = settings.stripe_secret_key
    try:
        current = stripe.Subscription.retrieve(current_user.paddle_subscription_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to load subscription.") from exc

    current_data = _stripe_to_dict(current)
    status = str(current_data.get("status") or "").lower()
    if status in {"canceled", "incomplete_expired", "unpaid"}:
        current_user.subscription_tier = "free"
        current_user.paddle_subscription_id = None
        current_user.subscription_active_until = None
        db.add(current_user)
        db.commit()
        return {
            "status": "already_inactive",
            "cancel_at_period_end": False,
            "active_until": None,
        }

    updated = current
    if not bool(current_data.get("cancel_at_period_end")):
        try:
            updated = stripe.Subscription.modify(
                current_user.paddle_subscription_id,
                cancel_at_period_end=True,
            )
        except Exception as exc:
            raise HTTPException(status_code=400, detail="Unable to cancel subscription.") from exc

    updated_data = _stripe_to_dict(updated)
    period_end_dt = _from_unix_ts(updated_data.get("current_period_end"))
    current_user.subscription_active_until = period_end_dt
    db.add(current_user)
    db.commit()
    record_activity(
        db,
        user_id=current_user.id,
        action="Stripe cancellation scheduled",
        meta={"subscription_id": current_user.paddle_subscription_id},
    )
    return {
        "status": "scheduled",
        "cancel_at_period_end": bool(updated_data.get("cancel_at_period_end")),
        "active_until": period_end_dt.isoformat() if period_end_dt else None,
    }


@router.post("/stripe/finalize-session")
def finalize_stripe_checkout_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=500, detail="Stripe secret key is not configured.")
    stripe.api_key = settings.stripe_secret_key

    try:
        checkout_raw = stripe.checkout.Session.retrieve(
            session_id,
            expand=["line_items.data.price"],
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to load checkout session.") from exc

    checkout = _stripe_to_dict(checkout_raw)
    payment_status = str(checkout.get("payment_status") or "").lower()
    if payment_status not in {"paid", "no_payment_required"}:
        raise HTTPException(status_code=400, detail="Checkout session is not paid yet.")

    metadata = checkout.get("metadata") or {}
    checkout_email = str((checkout.get("customer_details") or {}).get("email") or "").strip().lower()
    metadata_email = str(metadata.get("email") or "").strip().lower()
    if checkout_email and checkout_email != current_user.email.lower() and metadata_email != current_user.email.lower():
        raise HTTPException(status_code=403, detail="This checkout session does not belong to current user.")
    ref_user_id = str(checkout.get("client_reference_id") or "").strip()
    metadata_user_id = str(metadata.get("user_id") or "").strip()
    current_user_id = str(current_user.id)
    if ref_user_id and ref_user_id != current_user_id:
        raise HTTPException(status_code=403, detail="This checkout session does not belong to current user.")
    if metadata_user_id and metadata_user_id != current_user_id:
        raise HTTPException(status_code=403, detail="This checkout session does not belong to current user.")

    tier = str(metadata.get("tier") or "").strip().lower()
    resolved_tier = None
    if tier in {"single", "single_scan", "go", "pro", "lifetime"}:
        resolved_tier = "single" if tier in {"single", "single_scan"} else tier
    if not resolved_tier:
        line_items = checkout.get("line_items", {}).get("data", [])
        if isinstance(line_items, list) and line_items:
            first_item = line_items[0] if isinstance(line_items[0], dict) else {}
            price = first_item.get("price", {})
            if isinstance(price, dict):
                resolved_tier = _resolve_stripe_tier_by_price_id(price.get("id"))
    if not resolved_tier:
        raise HTTPException(status_code=400, detail="Unable to resolve purchased tier from session.")

    customer_id = checkout.get("customer")
    customer_id_value = customer_id if isinstance(customer_id, str) else None
    subscription_id = checkout.get("subscription")
    subscription_id_value = subscription_id if isinstance(subscription_id, str) else None
    period_end_dt = None
    if subscription_id_value:
        try:
            subscription = stripe.Subscription.retrieve(subscription_id_value)
            sub_data = _stripe_to_dict(subscription)
            period_end_dt = _from_unix_ts(sub_data.get("current_period_end"))
        except Exception:
            period_end_dt = None

    _apply_paid_tier_to_user(
        current_user,
        resolved_tier=resolved_tier,
        customer_id=customer_id_value,
        subscription_id=subscription_id_value,
        period_end_dt=period_end_dt,
    )
    db.add(current_user)
    db.commit()
    record_activity(
        db,
        user_id=current_user.id,
        action="Stripe purchase applied",
        meta={"tier": current_user.subscription_tier, "session_id": session_id},
    )
    return {"status": "ok", "tier": current_user.subscription_tier}


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
            stripe.Webhook.construct_event(
                payload=body,
                sig_header=stripe_signature,
                secret=settings.stripe_webhook_secret,
            )
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Invalid webhook signature: {exc}") from exc
    try:
        event = json.loads(body.decode("utf-8"))
    except Exception:
        event = {}

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
            # Single credits are applied via finalize-session after frontend redirect.
            # Skipping webhook application prevents duplicate credit grants.
            if resolved_tier == "single":
                return {"status": "ok"}
            customer_id = obj.get("customer")
            customer_id_value = customer_id if isinstance(customer_id, str) else None
            subscription_id = obj.get("subscription")
            subscription_id_value = subscription_id if isinstance(subscription_id, str) else None
            period_end_dt = None
            if subscription_id_value:
                try:
                    sub = stripe.Subscription.retrieve(subscription_id_value)
                    sub_data = _stripe_to_dict(sub)
                    period_end_dt = _from_unix_ts(sub_data.get("current_period_end"))
                except Exception:
                    period_end_dt = None
            _apply_paid_tier_to_user(
                user,
                resolved_tier=resolved_tier,
                customer_id=customer_id_value,
                subscription_id=subscription_id_value,
                period_end_dt=period_end_dt,
            )
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
        user.subscription_active_until = None
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
            user.subscription_active_until = None
        elif tier:
            user.subscription_tier = tier
            subscription_id = obj.get("id")
            customer_id = obj.get("customer")
            user.subscription_active_until = _from_unix_ts(obj.get("current_period_end"))
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
                customer_id = payload.get("customer_id")
                customer_id_value = customer_id if isinstance(customer_id, str) else None
                _apply_paid_tier_to_user(
                    user,
                    resolved_tier=resolved_tier,
                    customer_id=customer_id_value,
                )
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
def get_subscription_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tier = current_user.subscription_tier
    if (current_user.email or "").lower() in LIFETIME_WHITELIST_EMAILS:
        tier = "lifetime"

    # Single Scan is credit-based and repurchasable.
    # When all credits are spent, downgrade to free so pricing marks it as purchasable again.
    if tier == "single":
        if (
            current_user.daily_scans_count <= 0
            and current_user.daily_cl_count <= 0
            and current_user.daily_prep_count <= 0
        ):
            current_user.subscription_tier = "free"
            current_user.paddle_subscription_id = None
            current_user.subscription_active_until = None
            db.add(current_user)
            db.commit()
            record_activity(
                db,
                user_id=current_user.id,
                action="Single Scan quota exhausted",
                meta={"event": "single_scan_auto_downgrade"},
            )
            tier = "free"

    cancel_at_period_end = False
    active_until = current_user.subscription_active_until
    if (
        settings.stripe_secret_key
        and current_user.paddle_subscription_id
        and tier in {"go", "pro"}
    ):
        stripe.api_key = settings.stripe_secret_key
        try:
            sub = stripe.Subscription.retrieve(current_user.paddle_subscription_id)
            sub_data = _stripe_to_dict(sub)
            status = str(sub_data.get("status") or "").lower()
            if status in {"canceled", "incomplete_expired", "unpaid"}:
                current_user.subscription_tier = "free"
                current_user.paddle_subscription_id = None
                current_user.subscription_active_until = None
                db.add(current_user)
                db.commit()
                tier = "free"
                active_until = None
            else:
                mapped_tier = _extract_stripe_subscription_tier(sub_data)
                if mapped_tier and mapped_tier != current_user.subscription_tier:
                    current_user.subscription_tier = mapped_tier
                    db.add(current_user)
                    db.commit()
                    tier = mapped_tier
                cancel_at_period_end = bool(sub_data.get("cancel_at_period_end"))
                active_until = _from_unix_ts(sub_data.get("current_period_end"))
                current_user.subscription_active_until = active_until
                db.add(current_user)
                db.commit()
        except Exception:
            pass

    limits = current_user.get_limits()
    usage = {
        "scans": current_user.daily_scans_count,
        "cl": current_user.daily_cl_count,
        "prep": current_user.daily_prep_count,
    }

    # Simple endpoint to return tier and limits
    return {
        "tier": tier,
        "limits": limits,
        "usage": usage,
        "single_scan_remaining": max(0, usage["scans"]) if tier == "single" else None,
        "cancel_at_period_end": cancel_at_period_end,
        "subscription_active_until": active_until.isoformat() if active_until else None,
    }

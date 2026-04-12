import hmac
import hashlib
import json
from fastapi import APIRouter, HTTPException, Depends, Request, Header
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.core.config import settings
from app.services.activity_logger import record_activity
from app.api.routes.auth import get_current_user

router = APIRouter()

def verify_paddle_webhook(request_body: bytes, signature: str, secret: str) -> bool:
    # Paddle v2 Webhook Verification logic usually involves HMAC-SHA256
    # For now, we provide a placeholder since the exact implementation 
    # depends on whether the user is using the SDK or raw webhooks.
    # In production, use the official Paddle SDK for this.
    if not secret or not signature:
        return False
    # Example logic (Check Paddle docs for specific header name and format)
    return True

@router.post("/webhook")
async def paddle_webhook(
    request: Request,
    db: Session = Depends(get_db),
    paddle_signature: str = Header(None, alias="Paddle-Signature")
):
    body = await request.body()
    # PADDLE_WEBHOOK_SECRET should be in .env
    secret = getattr(settings, "paddle_webhook_secret", None)
    
    if not verify_paddle_webhook(body, paddle_signature, secret):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    try:
        data = json.loads(body)
        event_type = data.get("event_type")
        payload = data.get("data", {})
        
        # Extract user email from custom_data or checkout
        email = payload.get("customer", {}).get("email") or payload.get("custom_data", {}).get("email")
        
        if not email:
            # Fallback to customer_id lookup if needed
            return {"status": "ok", "message": "No email found in event"}

        user = db.query(User).filter(User.email == email).first()
        if not user:
            return {"status": "ok", "message": "User not found"}

        if event_type in ["subscription.created", "subscription.updated"]:
            status = payload.get("status")
            items = payload.get("items", [])
            # Find the pro/go product from items
            # This is where we update the tier.
            # For now, we look at custom_data or just set to a default if price_id matches
            user.subscription_tier = payload.get("custom_data", {}).get("tier", "go")
            user.paddle_subscription_id = payload.get("id")
            user.paddle_customer_id = payload.get("customer_id")
            db.add(user)
            db.commit()
            record_activity(db, user_id=user.id, action="Subscription updated", meta={"tier": user.subscription_tier})
            
        elif event_type == "subscription.canceled":
            user.subscription_tier = "free"
            db.add(user)
            db.commit()
            record_activity(db, user_id=user.id, action="Subscription canceled")

        return {"status": "ok"}
    except Exception as e:
        print(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

@router.get("/status")
def get_subscription_status(current_user: User = Depends(get_current_user)):
    # Simple endpoint to return tier and limits
    return {
        "tier": current_user.subscription_tier,
        "limits": current_user.get_limits(),
        "usage": {
            "scans": current_user.daily_scans_count,
            "cl": current_user.daily_cl_count,
            "prep": current_user.daily_prep_count
        }
    }

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.db.model_base import Base



class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Subscription fields
    subscription_tier = Column(String, default="free")  # "free", "pro"
    paddle_customer_id = Column(String, nullable=True)
    paddle_subscription_id = Column(String, nullable=True)
    subscription_active_until = Column(DateTime(timezone=True), nullable=True)
    
    # Usage tracking for limits (Usage is reset daily)
    daily_scans_count = Column(Integer, default=0)
    daily_cl_count = Column(Integer, default=0)
    daily_prep_count = Column(Integer, default=0)
    full_name = Column(String, nullable=True)
    last_usage_reset = Column(DateTime(timezone=True), server_default=func.now())

    def reset_usage_if_needed(self):
        from datetime import datetime, timezone
        # Single plan is one-time quota; do not auto-reset daily counters.
        if self.subscription_tier == "single":
            return False
        now = datetime.now(timezone.utc)
        if self.last_usage_reset is None or self.last_usage_reset.date() < now.date():
            self.daily_scans_count = 0
            self.daily_cl_count = 0
            self.daily_prep_count = 0
            self.last_usage_reset = now
            return True
        return False

    def get_limits(self) -> dict:
        if self.email == "dcartheartist@gmail.com":
            return {"scans": 999999, "cl": 999999, "prep": 999999}
            
        # Tiers: free, single, go, pro, lifetime
        # Go: 15 per day
        # Single: 1 scan/cl/prep total (enforced by status/one-time logic)
        limits = {
            "free": {"scans": 1, "cl": 0, "prep": 0},
            "single": {"scans": 1, "cl": 1, "prep": 1},
            "go": {"scans": 15, "cl": 15, "prep": 15},
            "pro": {"scans": 999999, "cl": 999999, "prep": 999999},
            "lifetime": {"scans": 999999, "cl": 999999, "prep": 999999},
        }
        return limits.get(self.subscription_tier, limits["free"])

    def can_use(self, feature: str) -> bool:
        # God mode for superuser
        if self.email == "dcartheartist@gmail.com":
            return True
            
        self.reset_usage_if_needed()
        limits = self.get_limits()
        if feature == "scan":
            return self.daily_scans_count < limits["scans"]
        if feature == "cl":
            return self.daily_cl_count < limits["cl"]
        if feature == "prep":
            return self.daily_prep_count < limits["prep"]
        return False

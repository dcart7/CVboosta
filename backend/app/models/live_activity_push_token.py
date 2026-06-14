from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, Integer, String
from sqlalchemy.sql import func

from app.db.model_base import Base


class LiveActivityPushToken(Base):
    __tablename__ = "live_activity_push_tokens"
    __table_args__ = (
        Index("ix_live_activity_push_tokens_user_active", "user_id", "is_active"),
        Index("ix_live_activity_push_tokens_user_mode_active", "user_id", "mode", "is_active"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_id = Column(String(255), unique=True, index=True, nullable=False)
    token = Column(String(512), unique=True, index=True, nullable=False)
    bundle_id = Column(String(255), nullable=False)
    platform = Column(String(32), nullable=False, default="ios")
    mode = Column(String(64), nullable=False)
    attributes_type = Column(String(128), nullable=False, default="CVBoostaActivityAttributes")
    apns_environment = Column(String(32), nullable=False, default="production")
    is_active = Column(Boolean, nullable=False, default=True)
    last_seen_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    deactivated_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

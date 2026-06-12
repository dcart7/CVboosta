from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.sql import func

from app.db.base_class import Base


class AppStoreTransaction(Base):
    __tablename__ = "app_store_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(String(120), nullable=False, index=True)
    transaction_id = Column(String(128), nullable=False, unique=True, index=True)
    original_transaction_id = Column(String(128), nullable=True, index=True)
    web_order_line_item_id = Column(String(128), nullable=True, index=True)
    environment = Column(String(32), nullable=True)
    quantity = Column(Integer, nullable=False, default=1)
    transaction_type = Column(String(64), nullable=True)
    ownership_type = Column(String(64), nullable=True)
    bundle_id = Column(String(255), nullable=True)
    purchase_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True, index=True)
    revocation_at = Column(DateTime(timezone=True), nullable=True)
    signed_at = Column(DateTime(timezone=True), nullable=True)
    is_upgraded = Column(Boolean, nullable=False, default=False)
    transaction_jws = Column(Text, nullable=False)
    raw_payload = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserBillingEntitlement(Base):
    __tablename__ = "user_billing_entitlements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    plan = Column(String(32), nullable=False, default="free")
    entitlement = Column(String(32), nullable=False, default="free")
    source = Column(String(32), nullable=False, default="free")
    is_active = Column(Boolean, nullable=False, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    original_transaction_id = Column(String(128), nullable=True)
    latest_transaction_id = Column(String(128), nullable=True)
    environment = Column(String(32), nullable=True)
    scan_credit_balance = Column(Integer, nullable=False, default=0)
    last_synced_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
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


class StripePaymentApplication(Base):
    """Permanent ledger preventing a Stripe Checkout Session replay."""

    __tablename__ = "stripe_payment_applications"
    __table_args__ = (
        UniqueConstraint("provider", "reference_id", name="uq_stripe_payment_provider_reference"),
    )

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(32), nullable=False, default="stripe_checkout")
    # Opaque Stripe session ids are not user PII and must remain stable across
    # JWT/HMAC rotations for permanent replay protection.
    reference_id = Column(String(255), nullable=False, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    tier = Column(String(32), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)


class AppStorePurchaseOwner(Base):
    """Permanent ownership binding for an Apple purchase/renewal family."""

    __tablename__ = "app_store_purchase_owners"

    id = Column(Integer, primary_key=True, index=True)
    original_transaction_id = Column(String(128), nullable=False, unique=True, index=True)
    # Deliberately no cascading FK: deleting an account must not make a
    # previously claimed Apple purchase transferable to another account.
    user_id = Column(Integer, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class PendingStripeCheckout(Base):
    """One account-scoped lease for a not-yet-completed recurring checkout."""

    __tablename__ = "pending_stripe_checkouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    request_hash = Column(String(64), nullable=False)
    status = Column(String(24), nullable=False, default="creating", index=True)
    lease_token = Column(String(64), nullable=True)
    generation = Column(Integer, nullable=False, default=1)
    session_id = Column(String(255), nullable=True)
    response_encrypted = Column(Text, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        index=True,
    )

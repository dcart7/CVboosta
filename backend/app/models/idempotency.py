from sqlalchemy import Column, DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.sql import func

from app.db.base_class import Base


class IdempotencyRecord(Base):
    """Durable replay protection for unsafe API operations.

    Raw idempotency keys, request bodies and generated CV content are never
    stored.  Keys/scopes/request bodies are represented by SHA-256 digests and
    any replayable response is encrypted with the user's analysis key.
    """

    __tablename__ = "idempotency_records"
    __table_args__ = (
        UniqueConstraint(
            "operation",
            "scope_hash",
            "key_hash",
            name="uq_idempotency_operation_scope_key",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    operation = Column(String(64), nullable=False, index=True)
    scope_hash = Column(String(64), nullable=False)
    key_hash = Column(String(64), nullable=False)
    request_hash = Column(String(64), nullable=False)
    status = Column(String(16), nullable=False, default="in_progress", index=True)
    user_id = Column(Integer, nullable=True, index=True)
    resource_id = Column(Integer, nullable=True)
    response_encrypted = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

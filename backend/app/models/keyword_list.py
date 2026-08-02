from sqlalchemy import Column, DateTime, Integer, JSON, String
from sqlalchemy.sql import func

from app.db.model_base import Base



class KeywordList(Base):
    __tablename__ = "keyword_lists"

    id = Column(Integer, primary_key=True, index=True)
    source_hash = Column(String(64), nullable=False, unique=True, index=True)
    skills = Column(JSON, nullable=False)
    requirements = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)

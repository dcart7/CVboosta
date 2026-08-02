import logging
import hashlib
import hmac
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.keyword_list import KeywordList
from app.core.config import settings

logger = logging.getLogger(__name__)
_CACHE_TTL = timedelta(hours=6)


def _source_hash(source_text: str) -> str:
    normalized = " ".join((source_text or "").casefold().split())
    return hmac.new(
        settings.jwt_secret.encode("utf-8"),
        normalized.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def save_keyword_list(
    db: Session,
    source_text: str,
    skills: list[str],
    requirements: list[str],
) -> int | None:
    now = datetime.now(timezone.utc)
    digest = _source_hash(source_text)
    try:
        db.execute(delete(KeywordList).where(KeywordList.expires_at <= now))
        record = db.query(KeywordList).filter(KeywordList.source_hash == digest).first()
        if record is None:
            record = KeywordList(
                source_hash=digest,
                skills=skills[:45],
                requirements=requirements[:45],
                expires_at=now + _CACHE_TTL,
            )
            db.add(record)
        else:
            record.skills = skills[:45]
            record.requirements = requirements[:45]
            record.expires_at = now + _CACHE_TTL
        db.commit()
        db.refresh(record)
        return record.id
    except SQLAlchemyError as exc:
        db.rollback()
        logger.warning("Failed to save keyword list: %s", exc)
        return None


def get_keyword_list_by_source_text(
    db: Session,
    source_text: str,
) -> KeywordList | None:
    try:
        now = datetime.now(timezone.utc)
        return (
            db.query(KeywordList)
            .filter(
                KeywordList.source_hash == _source_hash(source_text),
                KeywordList.expires_at > now,
            )
            .order_by(KeywordList.created_at.desc())
            .first()
        )
    except SQLAlchemyError as exc:
        logger.warning("Failed to load keyword list: %s", exc)
        return None

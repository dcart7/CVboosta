from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

connect_args: dict[str, bool] = {}
if settings.database_url and settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

_db_initialized = False

def _ensure_db_init():
    global _db_initialized
    if not _db_initialized:
        from app.db.init_db import init_db
        try:
            init_db()
            _db_initialized = True
        except Exception as e:
            print(f"Lazy DB init failed: {e}")

if not settings.database_url:
    # Handle missing DB URL gracefully for health checks or local dev
    engine = None
else:
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
        connect_args=connect_args,
    )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) if engine else None


def get_db() -> Generator[Session, None, None]:
    if not SessionLocal:
        raise RuntimeError("DATABASE_URL is not set or invalid.")
    _ensure_db_init()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

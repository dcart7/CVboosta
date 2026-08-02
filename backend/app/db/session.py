from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

connect_args: dict[str, bool] = {}
if settings.database_url and settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# No module-level engine/SessionLocal to avoid circular imports and startup hangs.
# Other modules should use get_engine() and get_sessionlocal()
_engine = None
_SessionLocal = None

def get_engine():
    global _engine
    if _engine is None:
        if not settings.database_url:
            return None
        engine_options: dict[str, object] = {
            "pool_pre_ping": True,
            "connect_args": connect_args,
        }
        if not settings.database_url.startswith("sqlite"):
            engine_options.update(
                {
                    "pool_size": max(1, settings.db_pool_size),
                    "max_overflow": max(0, settings.db_max_overflow),
                    "pool_timeout": max(1, settings.db_pool_timeout_seconds),
                    "pool_recycle": max(30, settings.db_pool_recycle_seconds),
                    "pool_use_lifo": True,
                }
            )
        _engine = create_engine(settings.database_url, **engine_options)
    return _engine

def get_sessionlocal():
    global _SessionLocal
    if _SessionLocal is None:
        engine = get_engine()
        if engine:
            _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return _SessionLocal

def get_db() -> Generator[Session, None, None]:
    session_local = get_sessionlocal()
    if not session_local:
        raise RuntimeError("DATABASE_URL is not set or invalid.")
    db = session_local()
    try:
        yield db
    finally:
        db.close()

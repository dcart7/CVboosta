from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

connect_args: dict[str, bool] = {}
if settings.database_url and settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

_engine = None
_SessionLocal = None
_db_initialized = False

# Export these for other modules to use (e.g., init_db)
# We initialize them as calls to ensure they are created on import if needed
engine = _get_engine()
SessionLocal = _get_sessionlocal()

def _get_engine():
    global _engine
    if _engine is None:
        if not settings.database_url:
            return None
        _engine = create_engine(
            settings.database_url,
            pool_pre_ping=True,
            connect_args=connect_args,
        )
    return _engine

def _get_sessionlocal():
    global _SessionLocal
    if _SessionLocal is None:
        engine = _get_engine()
        if engine:
            _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return _SessionLocal

def _ensure_db_init():
    global _db_initialized
    if not _db_initialized:
        engine = _get_engine()
        if not engine:
            return
        from app.db.init_db import init_db
        try:
            init_db()
            _db_initialized = True
        except Exception as e:
            print(f"Lazy DB init failed: {e}")

def get_db() -> Generator[Session, None, None]:
    session_local = _get_sessionlocal()
    if not session_local:
        raise RuntimeError("DATABASE_URL is not set or invalid.")
    _ensure_db_init()
    db = session_local()
    try:
        yield db
    finally:
        db.close()

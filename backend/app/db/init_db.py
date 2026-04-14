from sqlalchemy.exc import OperationalError

from app.db.base import Base
from app.db.session import get_engine


def init_db() -> None:
    try:
        engine = get_engine()
        if engine:
            Base.metadata.create_all(bind=engine)
    except OperationalError as exc:
        # Allow API to start even if DB is unavailable (e.g., local dev without Docker)
        print(f"Database init skipped: {exc}")

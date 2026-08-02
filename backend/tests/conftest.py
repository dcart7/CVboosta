import os
import sys
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


backend_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_root))

_fd, _db_path = tempfile.mkstemp(prefix="cv_ai_test_", suffix=".db")
os.close(_fd)
os.environ["DATABASE_URL"] = f"sqlite:///{_db_path}"
os.environ["API_KEY_ENABLED"] = "false"
os.environ["RATE_LIMIT_ENABLED"] = "false"
os.environ["REQUEST_LOGGING_ENABLED"] = "false"
os.environ.setdefault("JWT_SECRET", "unit_test_jwt_secret_0123456789abcdef")
os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("AUTH_COOKIE_SECURE", "false")
os.environ.setdefault("NATIVE_AUTH_CLIENT_KEY", "unit-test-native-client-key-0123456789")

from app.main import app  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import get_engine  # noqa: E402


@pytest.fixture()
def client() -> TestClient:
    # Every route test gets a clean database.  The previous process-wide DB
    # made tests order-dependent (fixed user ids and globally unique push
    # tokens leaked between otherwise unrelated tests).
    engine = get_engine()
    assert engine is not None
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as client:
        yield client

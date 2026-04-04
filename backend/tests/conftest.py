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

from app.main import app  # noqa: E402


@pytest.fixture()
def client() -> TestClient:
    with TestClient(app) as client:
        yield client

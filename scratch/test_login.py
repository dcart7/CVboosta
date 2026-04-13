import sys
from fastapi.testclient import TestClient
sys.path.append('backend')
from app.main import app
client = TestClient(app)
try:
    response = client.post("/auth/login", json={"email": "test@example.com", "password": "wrongpassword"})
    print("CODE", response.status_code)
    print("TEXT", response.text)
except Exception as e:
    import traceback
    traceback.print_exc()

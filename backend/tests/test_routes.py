from app.schemas.keywords import KeywordExtractionResult
from app.services.llm import LLMResult
from datetime import datetime, timedelta, timezone


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"


def test_upload_cv_text(client):
    content = b"Skills\nPython, SQL\nExperience\nBackend Developer"
    response = client.post(
        "/analyze/upload",
        files={"file": ("resume.txt", content, "text/plain")},
    )
    assert response.status_code == 200
    payload = response.json()
    assert "raw_text" in payload
    assert payload["skills"] == ["Python", "SQL"]
    assert "Backend Developer" in payload["markdown"]


def test_analyze_cv_route(client, monkeypatch):
    from app.api.routes import analyze as analyze_routes
    monkeypatch.setattr(analyze_routes, "analyze_cv_text", lambda text: "OK")
    response = client.post("/analyze/cv", json={"cv_text": "My CV"})
    assert response.status_code == 200
    assert response.json()["cv_analysis"] == "OK"


def test_analyze_job_route(client, monkeypatch):
    from app.api.routes import analyze as analyze_routes
    monkeypatch.setattr(analyze_routes, "analyze_job_text", lambda text: "OK")
    response = client.post("/analyze/job", json={"job_text": "Job"})
    assert response.status_code == 200
    assert response.json()["job_analysis"] == "OK"


def test_extract_keywords_route(client, monkeypatch):
    from app.api.routes import analyze as analyze_routes
    from app.schemas.keywords import KeywordExtractionResult
    monkeypatch.setattr(
        analyze_routes,
        "extract_keywords_transformer",
        lambda text: KeywordExtractionResult(skills=["Python"], requirements=["SQL"]),
    )
    monkeypatch.setattr(analyze_routes, "save_keyword_list", lambda **_: 123)
    response = client.post("/analyze/keywords", json={"job_text": "Job"})
    assert response.status_code == 200
    payload = response.json()
    assert "Python" in payload["skills"]
    assert payload["keyword_list_id"] == 123


def test_match_cv_job_route(client, monkeypatch):
    from app.api.routes import analyze as analyze_routes
    from app.schemas.keywords import KeywordExtractionResult
    monkeypatch.setattr(
        analyze_routes,
        "extract_keywords_transformer",
        lambda text: KeywordExtractionResult(skills=["Python"], requirements=["SQL"]),
    )
    response = client.post(
        "/analyze/match",
        json={"cv_text": "Python SQL", "job_text": "Job"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["match_percent"] > 0


def test_optimize_route(client, monkeypatch):
    from app.api.routes import optimize as optimize_routes
    from app.schemas.keywords import KeywordExtractionResult
    from app.services.llm import LLMResult
    monkeypatch.setattr(
        optimize_routes,
        "generate_optimized_cv",
        lambda *_, **__: LLMResult(optimized_cv="OK", feedback="done"),
    )
    monkeypatch.setattr(
        optimize_routes,
        "extract_job_keywords",
        lambda text: KeywordExtractionResult(skills=["Python", "SQL"], requirements=[]),
    )
    monkeypatch.setattr(
        optimize_routes,
        "build_recommendations",
        lambda missing: [f"Learn {m}" for m in missing],
    )

    reg = client.post(
        "/auth/register",
        json={"email": "u@example.com", "password": "password123", "full_name": "U"},
    )
    assert reg.status_code == 200
    token = reg.json()["access_token"]
    response = client.post(
        "/optimize",
        json={
            "cv_text": "Python",
            "job_text": "Job",
            "cv_analysis": "a",
            "job_analysis": "b",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["optimized_cv"] == "OK"

    # Free tier is limited to 1 scan/day.
    response2 = client.post(
        "/optimize",
        json={
            "cv_text": "Python",
            "job_text": "Job",
            "cv_analysis": "a",
            "job_analysis": "b",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response2.status_code == 402


def test_csrf_blocks_cookie_auth_without_origin(client, monkeypatch):
    from app.api.routes import optimize as optimize_routes
    from app.schemas.keywords import KeywordExtractionResult
    from app.services.llm import LLMResult

    monkeypatch.setattr(
        optimize_routes,
        "generate_optimized_cv",
        lambda *_, **__: LLMResult(optimized_cv="OK", feedback="done"),
    )
    monkeypatch.setattr(
        optimize_routes,
        "extract_job_keywords",
        lambda text: KeywordExtractionResult(skills=["Python", "SQL"], requirements=[]),
    )
    monkeypatch.setattr(
        optimize_routes,
        "build_recommendations",
        lambda missing: [f"Learn {m}" for m in missing],
    )

    reg = client.post(
        "/auth/register",
        json={"email": "csrf@example.com", "password": "password123", "full_name": "U"},
    )
    assert reg.status_code == 200

    # Cookie-based auth is now protected by Origin/Referer checks.
    blocked = client.post(
        "/optimize",
        json={
            "cv_text": "Python",
            "job_text": "Job",
            "cv_analysis": "a",
            "job_analysis": "b",
        },
    )
    assert blocked.status_code == 403

    allowed = client.post(
        "/optimize",
        json={
            "cv_text": "Python",
            "job_text": "Job",
            "cv_analysis": "a",
            "job_analysis": "b",
        },
        headers={"Origin": "http://localhost:3000"},
    )
    assert allowed.status_code == 200


def _register_and_get_token(client, email: str) -> str:
    response = client.post(
        "/auth/register",
        json={"email": email, "password": "password123", "full_name": "User"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def _mock_app_store_payload(
    *,
    product_id: str,
    transaction_id: str,
    original_transaction_id: str,
    quantity: int = 1,
    expires_in_days: int | None = None,
) -> dict[str, object]:
    now = datetime.now(timezone.utc)
    payload: dict[str, object] = {
        "bundleId": "com.cvboosta.app",
        "environment": "Sandbox",
        "productId": product_id,
        "transactionId": transaction_id,
        "originalTransactionId": original_transaction_id,
        "purchaseDate": int(now.timestamp() * 1000),
        "signedDate": int(now.timestamp() * 1000),
        "quantity": quantity,
    }
    if expires_in_days is not None:
        payload["expiresDate"] = int((now + timedelta(days=expires_in_days)).timestamp() * 1000)
    return payload


def test_app_store_sync_activates_plan_and_extends_status(client, monkeypatch):
    from app.api.routes import billing as billing_routes

    token = _register_and_get_token(client, "ios-go@example.com")
    monkeypatch.setattr(
        billing_routes,
        "verify_and_decode_app_store_transaction",
        lambda _jws: _mock_app_store_payload(
            product_id="com.cvboosta.app.go.monthly",
            transaction_id="tx-go-001",
            original_transaction_id="orig-go-001",
            expires_in_days=30,
        ),
    )

    sync_response = client.post(
        "/billing/app-store/sync",
        json={
            "product_id": "com.cvboosta.app.go.monthly",
            "transaction_id": "tx-go-001",
            "original_transaction_id": "orig-go-001",
            "transaction_jws": "signed-jws",
            "environment": "sandbox",
            "quantity": 1,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert sync_response.status_code == 200
    payload = sync_response.json()
    assert payload["tier"] == "go"
    assert payload["plan"] == "go"
    assert payload["entitlement"] == "go"
    assert payload["source"] == "app_store"
    assert payload["billing_cycle"] == "month"
    assert payload["scan_credit_balance"] == 0
    assert isinstance(payload["expires_at"], str)
    assert "scans_remaining_today" in payload

    status_response = client.get(
        "/billing/status",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert status_response.status_code == 200
    status_payload = status_response.json()
    assert status_payload["tier"] == "go"
    assert status_payload["source"] == "app_store"


def test_app_store_single_scan_sync_is_idempotent(client, monkeypatch):
    from app.api.routes import billing as billing_routes

    token = _register_and_get_token(client, "ios-credit@example.com")
    monkeypatch.setattr(
        billing_routes,
        "verify_and_decode_app_store_transaction",
        lambda _jws: _mock_app_store_payload(
            product_id="com.cvboosta.app.single_scan",
            transaction_id="tx-credit-001",
            original_transaction_id="orig-credit-001",
            quantity=2,
        ),
    )

    first = client.post(
        "/billing/app-store/sync",
        json={
            "product_id": "com.cvboosta.app.single_scan",
            "transaction_id": "tx-credit-001",
            "original_transaction_id": "orig-credit-001",
            "transaction_jws": "signed-jws",
            "environment": "sandbox",
            "quantity": 2,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert first.status_code == 200
    assert first.json()["scan_credit_balance"] == 2

    second = client.post(
        "/billing/app-store/sync",
        json={
            "product_id": "com.cvboosta.app.single_scan",
            "transaction_id": "tx-credit-001",
            "original_transaction_id": "orig-credit-001",
            "transaction_jws": "signed-jws",
            "environment": "sandbox",
            "quantity": 2,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert second.status_code == 200
    assert second.json()["scan_credit_balance"] == 2


def test_optimize_uses_app_store_scan_credit_after_free_limit(client, monkeypatch):
    from app.api.routes import billing as billing_routes
    from app.api.routes import optimize as optimize_routes

    monkeypatch.setattr(
        optimize_routes,
        "generate_optimized_cv",
        lambda *_, **__: LLMResult(optimized_cv="OK", feedback="done"),
    )
    monkeypatch.setattr(
        optimize_routes,
        "extract_job_keywords",
        lambda text: KeywordExtractionResult(skills=["Python", "SQL"], requirements=[]),
    )
    monkeypatch.setattr(
        optimize_routes,
        "build_recommendations",
        lambda missing: [f"Learn {m}" for m in missing],
    )
    monkeypatch.setattr(
        billing_routes,
        "verify_and_decode_app_store_transaction",
        lambda _jws: _mock_app_store_payload(
            product_id="com.cvboosta.app.single_scan",
            transaction_id="tx-credit-002",
            original_transaction_id="orig-credit-002",
            quantity=1,
        ),
    )

    token = _register_and_get_token(client, "ios-credit-usage@example.com")
    sync_response = client.post(
        "/billing/app-store/sync",
        json={
            "product_id": "com.cvboosta.app.single_scan",
            "transaction_id": "tx-credit-002",
            "original_transaction_id": "orig-credit-002",
            "transaction_jws": "signed-jws",
            "environment": "sandbox",
            "quantity": 1,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert sync_response.status_code == 200

    optimize_payload = {
        "cv_text": "Python",
        "job_text": "Job",
        "cv_analysis": "a",
        "job_analysis": "b",
    }
    first = client.post(
        "/optimize",
        json=optimize_payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    second = client.post(
        "/optimize",
        json=optimize_payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    third = client.post(
        "/optimize",
        json=optimize_payload,
        headers={"Authorization": f"Bearer {token}"},
    )

    assert first.status_code == 200
    assert second.status_code == 200
    assert third.status_code == 402

    status_response = client.get(
        "/billing/status",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert status_response.status_code == 200
    assert status_response.json()["scan_credit_balance"] == 0

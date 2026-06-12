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


def test_apns_device_registration_and_deactivation(client):
    token = _register_and_get_token(client, "push-device@example.com")
    legacy_payload = {
        "token": "a" * 64,
        "bundle_id": "com.cvboosta.app",
    }

    register_response = client.post(
        "/devices/apns",
        json=legacy_payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert register_response.status_code == 200
    assert register_response.json()["message"] == "APNs token registered."

    deactivate_response = client.post(
        "/devices/apns/deactivate",
        json={**legacy_payload, "apns_environment": "sandbox"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert deactivate_response.status_code == 200
    assert deactivate_response.json()["message"] == "APNs token deactivated."


def test_internal_push_route_requires_api_key_and_returns_summary(client, monkeypatch):
    from app.api.routes import push_internal as push_internal_routes
    from app.core import internal_auth
    from app.schemas.push import PushDeliveryResponse

    monkeypatch.setattr(internal_auth.settings, "internal_api_key", "push-secret")
    monkeypatch.setattr(
        push_internal_routes,
        "send_push_to_user",
        lambda db, user_id, payload: PushDeliveryResponse(
            requested=1,
            sent=1,
            failed=0,
            deactivated=0,
            results=[],
        ),
    )

    unauthorized = client.post(
        "/internal/notifications/users/123/push",
        json={"alert": {"title": "CVBoosta", "body": "Your analysis is ready"}},
    )
    assert unauthorized.status_code == 401

    authorized = client.post(
        "/internal/notifications/users/123/push",
        json={"alert": {"title": "CVBoosta", "body": "Your analysis is ready"}},
        headers={"X-Internal-API-Key": "push-secret"},
    )
    assert authorized.status_code == 200
    assert authorized.json()["sent"] == 1


def test_apple_oauth_registers_then_reuses_identity_without_email(client, monkeypatch):
    from app.api.routes import auth as auth_routes

    first_claims = {
        "sub": "apple-user-123",
        "email": "apple-user@example.com",
        "email_verified": True,
    }
    monkeypatch.setattr(auth_routes, "verify_oauth_id_token", lambda provider, token: first_claims)

    first = client.post(
        "/auth/oauth/apple",
        json={
            "id_token": "x" * 64,
            "full_name": "Apple Person",
            "email": "apple-user@example.com",
        },
    )
    assert first.status_code == 200
    first_token = first.json()["access_token"]

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {first_token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "apple-user@example.com"

    second_claims = {
        "sub": "apple-user-123",
    }
    monkeypatch.setattr(auth_routes, "verify_oauth_id_token", lambda provider, token: second_claims)

    second = client.post(
        "/auth/oauth/apple",
        json={
            "id_token": "y" * 64,
        },
        headers={"Origin": "http://localhost:3000"},
    )
    assert second.status_code == 200
    assert second.json()["email"] == "apple-user@example.com"


def test_apple_oauth_rejects_first_login_without_email(client, monkeypatch):
    from app.api.routes import auth as auth_routes

    monkeypatch.setattr(
        auth_routes,
        "verify_oauth_id_token",
        lambda provider, token: {"sub": "apple-user-without-email"},
    )

    response = client.post(
        "/auth/oauth/apple",
        json={
            "id_token": "z" * 64,
        },
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "OAuth email is missing"


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

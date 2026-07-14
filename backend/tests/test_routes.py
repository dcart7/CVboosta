from app.schemas.keywords import KeywordExtractionResult
from app.services.llm import LLMResult
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_engine
from app.models.activity import ActivityLog
from app.models.analysis import Analysis
from app.models.billing import AppStoreTransaction, UserBillingEntitlement
from app.models.device_push_token import DevicePushToken
from app.models.live_activity_push_token import LiveActivityPushToken
from app.models.live_activity_start_token import LiveActivityStartToken
from app.models.oauth_identity import OAuthIdentity
from app.models.request_log import RequestLog


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
    push_calls: list[tuple[int, int | None]] = []
    live_activity_calls: list[tuple[int, int]] = []
    progress_calls: list[tuple[int, float, str, str]] = []
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
        optimize_routes,
        "send_analysis_ready_push_best_effort",
        lambda user_id, analysis_id=None: push_calls.append((user_id, analysis_id)),
    )
    monkeypatch.setattr(
        optimize_routes,
        "end_ats_live_activity_best_effort",
        lambda user_id, final_score: live_activity_calls.append((user_id, final_score)),
    )
    monkeypatch.setattr(
        optimize_routes,
        "update_ats_live_activity_best_effort",
        lambda user_id, progress, detail, eta_text: progress_calls.append((user_id, progress, detail, eta_text)),
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
    assert payload["analysis_id"] is not None
    assert push_calls == [(1, payload["analysis_id"])]
    assert live_activity_calls == [(1, payload["match_after"])]
    assert [round(call[1], 2) for call in progress_calls] == [0.08, 0.24, 0.48, 0.76, 0.92]

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


def test_live_activity_token_registration_and_deactivation(client):
    token = _register_and_get_token(client, "live-activity-device@example.com")
    payload = {
        "activity_id": "ats-activity-001",
        "token": "c" * 64,
        "bundle_id": "com.cvboosta.app",
        "apns_environment": "sandbox",
        "mode": "atsOptimization",
    }

    register_response = client.post(
        "/live-activities/apns",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert register_response.status_code == 200
    assert register_response.json()["message"] == "Live Activity push token registered."

    deactivate_response = client.post(
        "/live-activities/apns/deactivate",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert deactivate_response.status_code == 200
    assert deactivate_response.json()["message"] == "Live Activity push token deactivated."


def test_live_activity_push_to_start_registration_and_deactivation(client):
    token = _register_and_get_token(client, "live-activity-start@example.com")
    payload = {
        "token": "e" * 64,
        "bundle_id": "com.cvboosta.app",
        "apns_environment": "sandbox",
        "mode": "atsOptimization",
    }

    register_response = client.post(
        "/live-activities/apns/push-to-start",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert register_response.status_code == 200
    assert register_response.json()["message"] == "Live Activity push-to-start token registered."

    deactivate_response = client.post(
        "/live-activities/apns/push-to-start/deactivate",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert deactivate_response.status_code == 200
    assert deactivate_response.json()["message"] == "Live Activity push-to-start token deactivated."


def test_internal_push_route_requires_api_key_and_returns_summary(client, monkeypatch):
    from app.api.routes import push_internal as push_internal_routes
    from app.core import api_key as api_key_middleware
    from app.core import internal_auth
    from app.schemas.push import PushDeliveryResponse

    monkeypatch.setattr(api_key_middleware.settings, "api_key_enabled", True)
    monkeypatch.setattr(api_key_middleware.settings, "api_key", "site-secret")
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


def test_internal_live_activity_route_requires_api_key_and_returns_summary(client, monkeypatch):
    from app.api.routes import push_internal as push_internal_routes
    from app.core import api_key as api_key_middleware
    from app.core import internal_auth
    from app.schemas.push import LiveActivityDeliveryResponse

    monkeypatch.setattr(api_key_middleware.settings, "api_key_enabled", True)
    monkeypatch.setattr(api_key_middleware.settings, "api_key", "site-secret")
    monkeypatch.setattr(internal_auth.settings, "internal_api_key", "push-secret")
    monkeypatch.setattr(
        push_internal_routes,
        "send_live_activity_event_to_user",
        lambda db, user_id, payload: LiveActivityDeliveryResponse(
            requested=1,
            sent=1,
            failed=0,
            deactivated=1,
            results=[],
        ),
    )

    unauthorized = client.post(
        "/internal/live-activities/users/123",
        json={
            "event": "end",
            "state": {
                "mode": "atsOptimization",
                "title": "ATS Scan Complete",
                "detail": "Final score: 92",
                "progress": 1,
                "etaText": "",
            },
        },
    )
    assert unauthorized.status_code == 401

    authorized = client.post(
        "/internal/live-activities/users/123",
        json={
            "event": "end",
            "state": {
                "mode": "atsOptimization",
                "title": "ATS Scan Complete",
                "detail": "Final score: 92",
                "progress": 1,
                "etaText": "",
            },
        },
        headers={"X-Internal-API-Key": "push-secret"},
    )
    assert authorized.status_code == 200
    assert authorized.json()["deactivated"] == 1


def test_internal_live_activity_start_route_requires_api_key_and_returns_summary(client, monkeypatch):
    from app.api.routes import push_internal as push_internal_routes
    from app.core import api_key as api_key_middleware
    from app.core import internal_auth
    from app.schemas.push import PushDeliveryResponse

    monkeypatch.setattr(api_key_middleware.settings, "api_key_enabled", True)
    monkeypatch.setattr(api_key_middleware.settings, "api_key", "site-secret")
    monkeypatch.setattr(internal_auth.settings, "internal_api_key", "push-secret")
    monkeypatch.setattr(
        push_internal_routes,
        "send_live_activity_start_to_user",
        lambda db, user_id, payload: PushDeliveryResponse(
            requested=1,
            sent=1,
            failed=0,
            deactivated=0,
            results=[],
        ),
    )

    unauthorized = client.post(
        "/internal/live-activities/users/123/start",
        json={
            "activityName": "ATS Optimization",
            "state": {
                "mode": "atsOptimization",
                "title": "ATS Scan running",
                "detail": "Preparing ATS scan",
                "progress": 0.1,
                "etaText": "~15s",
            },
        },
    )
    assert unauthorized.status_code == 401

    authorized = client.post(
        "/internal/live-activities/users/123/start",
        json={
            "activityName": "ATS Optimization",
            "state": {
                "mode": "atsOptimization",
                "title": "ATS Scan running",
                "detail": "Preparing ATS scan",
                "progress": 0.1,
                "etaText": "~15s",
            },
        },
        headers={"X-Internal-API-Key": "push-secret"},
    )
    assert authorized.status_code == 200
    assert authorized.json()["sent"] == 1


def test_analysis_ready_push_is_best_effort(client, monkeypatch):
    from app.services import push_notifications

    token = _register_and_get_token(client, "push-best-effort@example.com")
    client.post(
        "/devices/apns",
        json={
            "token": "b" * 64,
            "bundle_id": "com.cvboosta.app",
            "apns_environment": "sandbox",
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    monkeypatch.setattr(
        push_notifications,
        "send_push_to_user",
        lambda *_args, **_kwargs: (_ for _ in ()).throw(RuntimeError("apns down")),
    )

    push_notifications.send_analysis_ready_push_best_effort(user_id=1, analysis_id=99)


def test_ats_live_activity_end_is_best_effort(client, monkeypatch):
    from app.services import push_notifications

    token = _register_and_get_token(client, "live-activity-best-effort@example.com")
    client.post(
        "/live-activities/apns",
        json={
            "activity_id": "ats-activity-002",
            "token": "d" * 64,
            "bundle_id": "com.cvboosta.app",
            "apns_environment": "sandbox",
            "mode": "atsOptimization",
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    monkeypatch.setattr(
        push_notifications,
        "send_live_activity_event_to_user",
        lambda *_args, **_kwargs: (_ for _ in ()).throw(RuntimeError("apns down")),
    )

    push_notifications.end_ats_live_activity_best_effort(user_id=1, final_score=88)


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


def test_delete_account_removes_related_rows_and_allows_re_registration(client):
    email = "delete-account@example.com"
    token = _register_and_get_token(client, email)
    me_response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    user_id = me_response.json()["id"]

    with Session(get_engine()) as db:
        db.add(Analysis(
            user_id=user_id,
            original_cv="Original CV",
            job_description="Job Description",
            score=83,
            result_json={"status": "ok"},
        ))
        db.add(ActivityLog(user_id=user_id, action="Manual test event", meta={"source": "test"}))
        db.add(RequestLog(
            user_id=user_id,
            method="GET",
            path="/auth/me",
            status_code=200,
            duration_ms=12,
        ))
        db.add(AppStoreTransaction(
            user_id=user_id,
            product_id="com.cvboosta.app.go.monthly",
            transaction_id="delete-account-tx-001",
            original_transaction_id="delete-account-orig-001",
            transaction_jws="signed-jws",
            quantity=1,
        ))
        db.add(UserBillingEntitlement(
            user_id=user_id,
            plan="go",
            entitlement="go",
            source="app_store",
            is_active=True,
        ))
        db.add(OAuthIdentity(
            user_id=user_id,
            provider="apple",
            provider_user_id="delete-account-apple-001",
            email=email,
        ))
        db.add(DevicePushToken(
            user_id=user_id,
            token="a" * 64,
            bundle_id="com.cvboosta.app",
            apns_environment="sandbox",
        ))
        db.add(LiveActivityStartToken(
            user_id=user_id,
            token="b" * 128,
            bundle_id="com.cvboosta.app",
            mode="atsOptimization",
            apns_environment="sandbox",
        ))
        db.add(LiveActivityPushToken(
            user_id=user_id,
            activity_id="delete-account-activity-001",
            token="c" * 128,
            bundle_id="com.cvboosta.app",
            mode="atsOptimization",
            apns_environment="sandbox",
        ))
        db.commit()

    delete_response = client.request(
        "DELETE",
        "/auth/account",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert delete_response.status_code == 204
    assert client.cookies.get(settings.auth_cookie_name) is None

    me_after_delete = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_after_delete.status_code == 401

    with Session(get_engine()) as db:
        assert db.query(Analysis).filter(Analysis.user_id == user_id).count() == 0
        assert db.query(ActivityLog).filter(ActivityLog.user_id == user_id).count() == 0
        assert db.query(RequestLog).filter(RequestLog.user_id == user_id).count() == 0
        assert db.query(AppStoreTransaction).filter(AppStoreTransaction.user_id == user_id).count() == 0
        assert db.query(UserBillingEntitlement).filter(UserBillingEntitlement.user_id == user_id).count() == 0
        assert db.query(OAuthIdentity).filter(OAuthIdentity.user_id == user_id).count() == 0
        assert db.query(DevicePushToken).filter(DevicePushToken.user_id == user_id).count() == 0
        assert db.query(LiveActivityStartToken).filter(LiveActivityStartToken.user_id == user_id).count() == 0
        assert db.query(LiveActivityPushToken).filter(LiveActivityPushToken.user_id == user_id).count() == 0

    register_again_response = client.post(
        "/auth/register",
        json={"email": email, "password": "password123", "full_name": "User"},
    )
    assert register_again_response.status_code == 200


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

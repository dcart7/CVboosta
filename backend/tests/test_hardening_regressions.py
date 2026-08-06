from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
from pathlib import Path
from types import SimpleNamespace

import pytest
from sqlalchemy import delete
from sqlalchemy.orm import Session
from starlette.requests import Request

from app.db.session import get_engine
from app.models.activity import ActivityLog
from app.models.analysis import Analysis
from app.models.billing import (
    AppStorePurchaseOwner,
    StripePaymentApplication,
    UserBillingEntitlement,
)
from app.models.idempotency import IdempotencyRecord
from app.models.oauth_identity import OAuthIdentity
from app.models.user import User
from app.services.emailer import build_password_reset_link
from app.services.idempotency import _claim_existing_record, provider_idempotency_key
from app.services.usage import consume_feature_or_raise, refund_feature_best_effort


NATIVE_KEY = "unit-test-native-client-key-0123456789"


def _register(client, email: str, *, browser: bool = False) -> tuple[object, str | None]:
    headers = {"Origin": "http://localhost:3000"} if browser else {}
    response = client.post(
        "/auth/register",
        json={"email": email, "password": "password123!", "full_name": "User"},
        headers=headers,
    )
    assert response.status_code == 200
    return response, response.json().get("access_token")


def test_browser_auth_is_cookie_only_and_native_rollout_is_backward_compatible(client):
    browser_response, _ = _register(client, "browser-cookie-only@example.com", browser=True)
    assert "access_token" not in browser_response.json()
    assert client.get("/auth/me").status_code == 200

    blocked_origin = client.post(
        "/auth/native/token",
        headers={
            "X-Native-Client-Key": NATIVE_KEY,
            "Origin": "http://localhost:3000",
        },
    )
    assert blocked_origin.status_code == 403
    blocked_fetch_metadata = client.post(
        "/auth/native/token",
        headers={
            "X-Native-Client-Key": NATIVE_KEY,
            "Sec-Fetch-Site": "same-origin",
        },
    )
    assert blocked_fetch_metadata.status_code == 403

    exchange = client.post(
        "/auth/native/token",
        headers={"X-Native-Client-Key": NATIVE_KEY},
    )
    assert exchange.status_code == 200
    assert len(exchange.json()["access_token"]) > 20

    client.cookies.clear()
    legacy_response, legacy_token = _register(client, "legacy-ios@example.com")
    assert legacy_response.status_code == 200
    assert legacy_token and len(legacy_token) > 20


def test_legacy_ios_login_keeps_bearer_token_even_with_origin_header(client):
    _register(client, "ios-origin@example.com")
    client.cookies.clear()

    response = client.post(
        "/auth/login",
        json={"email": "ios-origin@example.com", "password": "password123!"},
        headers={
            "Origin": "cvboosta://app",
            "User-Agent": "CVBoosta/1.0 CFNetwork/1496.0.7 Darwin/23.5.0",
        },
    )

    assert response.status_code == 200
    assert response.json().get("access_token")
    assert response.json().get("token_type") == "bearer"


def test_password_change_revokes_existing_access_token(client):
    _, token = _register(client, "revoke-token@example.com")
    assert token
    changed = client.post(
        "/auth/change-password",
        json={"current_password": "password123!", "new_password": "new-password-456!"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert changed.status_code == 200
    assert client.get(
        "/auth/me", headers={"Authorization": f"Bearer {token}"}
    ).status_code == 401


def test_new_password_policy_is_enforced_by_server(client):
    weak = client.post(
        "/auth/register",
        json={
            "email": "weak-password@example.com",
            "password": "password123",
            "full_name": "User",
        },
    )
    assert weak.status_code == 400
    assert "number and a symbol" in weak.json()["detail"]


def test_legacy_password_hash_is_accepted_and_opportunistically_rehashed(client):
    from passlib.context import CryptContext

    from app.services.auth import PASSWORD_PBKDF2_ROUNDS, password_hash_needs_update

    legacy_context = CryptContext(
        schemes=["pbkdf2_sha256"],
        pbkdf2_sha256__default_rounds=29_000,
    )
    legacy_password = "oldpassword"
    with Session(get_engine()) as db:
        user = User(
            email="legacy-hash@example.com",
            password_hash=legacy_context.hash(legacy_password),
            full_name="Legacy",
        )
        db.add(user)
        db.commit()
        assert password_hash_needs_update(user.password_hash)

    response = client.post(
        "/auth/login",
        json={"email": "legacy-hash@example.com", "password": legacy_password},
    )
    assert response.status_code == 200
    assert response.json().get("access_token")

    with Session(get_engine()) as db:
        user = db.query(User).filter(User.email == "legacy-hash@example.com").one()
        rounds = int(user.password_hash.split("$")[2])
        assert rounds >= PASSWORD_PBKDF2_ROUNDS
        assert not password_hash_needs_update(user.password_hash)


def test_password_reset_replays_after_its_token_was_atomically_revoked(client):
    from app.services.auth import create_password_reset_token

    _, _token = _register(client, "reset-replay@example.com")
    with Session(get_engine()) as db:
        user = db.query(User).filter(User.email == "reset-replay@example.com").one()
        reset_token = create_password_reset_token(user)
    client.cookies.clear()

    payload = {"token": reset_token, "new_password": "new-reset-password9!"}
    headers = {"Idempotency-Key": "password-reset-attempt-0001"}
    first = client.post("/auth/reset-password", json=payload, headers=headers)
    replay = client.post("/auth/reset-password", json=payload, headers=headers)
    invalid_new_attempt = client.post(
        "/auth/reset-password",
        json=payload,
        headers={"Idempotency-Key": "password-reset-attempt-0002"},
    )

    assert first.status_code == replay.status_code == 200
    assert first.json() == replay.json() == {"status": "ok"}
    assert invalid_new_attempt.status_code == 400
    with Session(get_engine()) as db:
        record = (
            db.query(IdempotencyRecord)
            .filter(IdempotencyRecord.operation == "auth.password.reset")
            .filter(IdempotencyRecord.status == "completed")
            .one()
        )
        assert record.user_id is not None


def test_oauth_never_uses_payload_email_or_auto_links_password_account(client, monkeypatch):
    from app.api.routes import auth as auth_routes

    _register(client, "oauth-victim@example.com", browser=True)
    client.cookies.clear()
    monkeypatch.setattr(
        auth_routes,
        "verify_oauth_id_token",
        lambda *_args: {
            "sub": "attacker-provider-subject",
            "email": "oauth-victim@example.com",
            "email_verified": True,
        },
    )
    conflict = client.post(
        "/auth/oauth/apple",
        json={"id_token": "x" * 64, "email": "oauth-victim@example.com"},
    )
    assert conflict.status_code == 409

    monkeypatch.setattr(
        auth_routes,
        "verify_oauth_id_token",
        lambda *_args: {"sub": "unverified-provider-subject", "email_verified": False},
    )
    unverified = client.post(
        "/auth/oauth/apple",
        json={"id_token": "y" * 64, "email": "oauth-victim@example.com"},
    )
    assert unverified.status_code == 400
    with Session(get_engine()) as db:
        assert db.query(OAuthIdentity).count() == 0


def test_failed_idempotency_reclaim_is_compare_and_swap():
    engine = get_engine()
    assert engine is not None
    with Session(engine) as setup:
        setup.add(
            IdempotencyRecord(
                operation="test.cas",
                scope_hash="a" * 64,
                key_hash="b" * 64,
                request_hash="c" * 64,
                status="failed",
            )
        )
        setup.commit()

    with Session(engine) as first, Session(engine) as second:
        first_snapshot = first.query(IdempotencyRecord).one()
        second_snapshot = second.query(IdempotencyRecord).one()
        assert _claim_existing_record(
            first,
            existing=first_snapshot,
            user_id=None,
            lease_marker="lease:" + "1" * 64,
        )
        assert not _claim_existing_record(
            second,
            existing=second_snapshot,
            user_id=None,
            lease_marker="lease:" + "2" * 64,
        )


def test_provider_idempotency_key_is_operation_and_tenant_scoped():
    first = provider_idempotency_key(
        "checkout", operation="stripe.checkout.create", scope="user:1", key="same-key"
    )
    second = provider_idempotency_key(
        "checkout", operation="stripe.checkout.create", scope="user:2", key="same-key"
    )
    other_operation = provider_idempotency_key(
        "checkout", operation="stripe.customer.create", scope="user:1", key="same-key"
    )
    assert len({first, second, other_operation}) == 3


def test_forwarded_for_walks_from_trusted_right_edge(monkeypatch):
    from app.core import client_ip as client_ip_module

    monkeypatch.setattr(client_ip_module.settings, "trusted_proxy_ips", [])
    monkeypatch.setattr(client_ip_module.settings, "trusted_proxy_cidrs", ["10.0.0.0/8"])
    trusted_request = Request(
        {
            "type": "http",
            "method": "GET",
            "path": "/",
            "headers": [
                (b"x-forwarded-for", b"203.0.113.99, 198.51.100.7, 10.1.2.3")
            ],
            "client": ("10.2.3.4", 1234),
            "server": ("testserver", 80),
            "scheme": "http",
            "query_string": b"",
        }
    )
    assert client_ip_module.client_ip(trusted_request) == "198.51.100.7"

    untrusted_request = Request(
        {
            "type": "http",
            "method": "GET",
            "path": "/",
            "headers": [(b"x-forwarded-for", b"203.0.113.99")],
            "client": ("192.0.2.10", 1234),
            "server": ("testserver", 80),
            "scheme": "http",
            "query_string": b"",
        }
    )
    assert client_ip_module.client_ip(untrusted_request) == "192.0.2.10"


def test_shared_redis_limiter_executes_and_required_outage_returns_503(monkeypatch):
    from app.core import rate_limit as rate_limit_module

    calls: list[str] = []

    class FakeRedis:
        async def eval(self, _script, _keys, key, _ttl):
            calls.append(key)
            return 1

    fake = FakeRedis()
    monkeypatch.setattr(
        rate_limit_module,
        "redis_async",
        SimpleNamespace(from_url=lambda *_args, **_kwargs: fake),
    )
    monkeypatch.setattr(rate_limit_module, "_redis_client", None)
    monkeypatch.setattr(rate_limit_module.settings, "redis_url", "redis://test")
    monkeypatch.setattr(rate_limit_module.settings, "rate_limit_enabled", True)
    monkeypatch.setattr(rate_limit_module.settings, "rate_limit_shared_required", True)
    result = asyncio.run(
        rate_limit_module._shared_rate_check(
            "subject", max_requests=3, window_seconds=60
        )
    )
    assert result and result[0] is True
    assert calls

    class FailingRedis:
        async def eval(self, *_args, **_kwargs):
            raise ConnectionError("down")

    monkeypatch.setattr(rate_limit_module, "_redis_client", FailingRedis())
    request = Request(
        {
            "type": "http",
            "method": "GET",
            "path": "/account",
            "raw_path": b"/account",
            "headers": [],
            "client": ("192.0.2.1", 1234),
            "server": ("testserver", 80),
            "scheme": "http",
            "query_string": b"",
        }
    )

    async def downstream(_request):
        raise AssertionError("request must fail closed")

    response = asyncio.run(rate_limit_module.rate_limit_middleware(request, downstream))
    assert response.status_code == 503


def test_health_probes_bypass_optional_api_key_and_rate_limit(client, monkeypatch):
    from app.core import rate_limit as rate_limit_module
    from app.core.config import settings

    monkeypatch.setattr(settings, "api_key_enabled", True)
    monkeypatch.setattr(settings, "api_key", "required-elsewhere")
    monkeypatch.setattr(settings, "rate_limit_enabled", True)
    monkeypatch.setattr(rate_limit_module._rate_limiter, "max_requests", 0)
    assert client.get("/health/live").status_code == 200
    assert client.get("/health/ready").status_code == 200


def test_readiness_reports_pending_migrations(client, monkeypatch):
    from app import main as main_module

    monkeypatch.setattr(
        main_module,
        "inspect",
        lambda _engine: SimpleNamespace(has_table=lambda _name: False),
    )
    response = client.get("/health/ready")
    assert response.status_code == 503
    assert response.json()["detail"] == "Database migrations are pending."


def test_explicit_migration_and_predeploy_runner_exist():
    root = Path(__file__).resolve().parents[2]
    migration = root / "backend/migrations/20260803_security_hardening.sql"
    runner = root / "backend/scripts/run_migrations.py"
    assert migration.exists() and "stripe_payment_applications" in migration.read_text()
    assert runner.exists() and "schema_migrations" in runner.read_text()


def test_free_optimize_is_rejected_before_any_llm_call(client, monkeypatch):
    from app.api.routes import optimize as optimize_routes

    _, token = _register(client, "free-paywall@example.com")
    assert token
    calls = {"count": 0}

    def should_not_run(*_args, **_kwargs):
        calls["count"] += 1
        raise AssertionError("LLM must not run")

    monkeypatch.setattr(optimize_routes, "generate_optimized_cv", should_not_run)
    response = client.post(
        "/optimize",
        json={"cv_text": "Python", "job_text": "Python role"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 402
    assert response.json()["detail"]["code"] == "paid_entitlement_required"
    assert calls["count"] == 0


def test_optimize_llm_failure_is_503_refunds_credit_and_creates_no_result(
    client, monkeypatch
):
    from app.api.routes import optimize as optimize_routes
    from app.schemas.keywords import KeywordExtractionResult
    from app.services.llm import LLMServiceError

    _, token = _register(client, "optimize-upstream-failure@example.com")
    assert token
    with Session(get_engine()) as db:
        user = db.query(User).filter(User.email == "optimize-upstream-failure@example.com").one()
        user.subscription_tier = "single"
        user.daily_scans_count = 1
        user.daily_cl_count = 1
        user.daily_prep_count = 1
        db.add(user)
        db.commit()

    monkeypatch.setattr(
        optimize_routes,
        "extract_job_keywords",
        lambda _text: KeywordExtractionResult(skills=["Python"], requirements=[]),
    )

    def fail_generation(*_args, **_kwargs):
        raise LLMServiceError("private provider failure", status_code=502)

    monkeypatch.setattr(optimize_routes, "generate_optimized_cv", fail_generation)
    response = client.post(
        "/optimize",
        json={"cv_text": "Python", "job_text": "Python role"},
        headers={
            "Authorization": f"Bearer {token}",
            "Idempotency-Key": "optimize-failed-attempt-0001",
        },
    )
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "optimization_unavailable"
    assert response.headers["Retry-After"] == "3"
    assert "private provider failure" not in response.text

    with Session(get_engine()) as db:
        user = db.query(User).filter(User.email == "optimize-upstream-failure@example.com").one()
        assert user.daily_scans_count == 1
        assert db.query(Analysis).count() == 0
        record = db.query(IdempotencyRecord).filter(
            IdempotencyRecord.operation == "optimize.cv"
        ).one()
        assert record.status == "failed"


def test_expired_stripe_tier_cannot_use_cover_letter_or_interview_prep(
    client, monkeypatch
):
    from app.api.routes import analyze as analyze_routes
    from app.api.routes import optimize as optimize_routes

    _, token = _register(client, "expired-paid-tools@example.com")
    assert token
    with Session(get_engine()) as db:
        user = db.query(User).filter(User.email == "expired-paid-tools@example.com").one()
        user.subscription_tier = "go"
        user.paddle_subscription_id = "sub_expired_tools"
        user.subscription_active_until = datetime.now(timezone.utc) - timedelta(minutes=1)
        db.add(user)
        db.commit()

    calls = {"cover": 0, "prep": 0}

    def cover_must_not_run(*_args, **_kwargs):
        calls["cover"] += 1
        raise AssertionError("expired subscription must fail before cover-letter LLM")

    def prep_must_not_run(*_args, **_kwargs):
        calls["prep"] += 1
        raise AssertionError("expired subscription must fail before interview-prep LLM")

    monkeypatch.setattr(optimize_routes, "generate_cover_letter", cover_must_not_run)
    monkeypatch.setattr(analyze_routes, "generate_interview_prep", prep_must_not_run)
    headers = {"Authorization": f"Bearer {token}"}
    cover = client.post(
        "/optimize/cover-letter",
        json={"cv_text": "Python", "job_text": "Backend role"},
        headers=headers,
    )
    prep = client.post(
        "/analyze/interview-prep",
        json={"job_text": "Backend role", "missing_keywords": ["SQL"]},
        headers=headers,
    )
    assert cover.status_code == prep.status_code == 402
    assert cover.json()["detail"]["code"] == "paid_entitlement_required"
    assert prep.json()["detail"]["code"] == "paid_entitlement_required"
    assert calls == {"cover": 0, "prep": 0}

    with Session(get_engine()) as db:
        user = db.query(User).filter(User.email == "expired-paid-tools@example.com").one()
        assert user.daily_cl_count == 0
        assert user.daily_prep_count == 0


def test_single_purchase_analysis_remains_unlocked_after_credit_is_consumed(client):
    _, token = _register(client, "single-history@example.com")
    assert token
    with Session(get_engine()) as db:
        user = db.query(User).filter(User.email == "single-history@example.com").one()
        analysis = Analysis(
            user_id=user.id,
            original_cv="",
            job_description="",
            score=75,
            result_json={
                "optimized_cv": "Unlocked CV",
                "job_description": "Role",
                "missing_skills": [],
                "recommendations": [],
                "access_entitlement": "single_purchase",
            },
        )
        db.add(analysis)
        db.commit()
        analysis_id = analysis.id

    response = client.get(
        f"/history/{analysis_id}", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["can_export"] is True
    assert response.json()["access_entitlement"] == "single_purchase"


def test_app_store_credit_receipt_refunds_the_same_bucket(client):
    _, token = _register(client, "appstore-refund@example.com")
    assert token
    with Session(get_engine()) as db:
        user = db.query(User).filter(User.email == "appstore-refund@example.com").one()
        db.add(UserBillingEntitlement(user_id=user.id, scan_credit_balance=1))
        db.commit()
        receipt = consume_feature_or_raise(
            db,
            user_id=user.id,
            feature="scan",
            exhausted_detail="no credit",
        )
        assert receipt.bucket == "app_store_credit"
        assert db.query(UserBillingEntitlement).one().scan_credit_balance == 0
        refund_feature_best_effort(db, receipt=receipt)
        assert db.query(UserBillingEntitlement).one().scan_credit_balance == 1
        assert db.query(User).filter(User.id == user.id).one().daily_scans_count == 0


def test_stripe_payment_ledger_survives_idempotency_and_activity_cleanup(client, monkeypatch):
    from app.api.routes import billing as billing_routes

    _, token = _register(client, "stripe-ledger@example.com")
    assert token
    with Session(get_engine()) as db:
        user_id = db.query(User).filter(User.email == "stripe-ledger@example.com").one().id

    class FakeSession:
        @staticmethod
        def retrieve(_session_id, **_kwargs):
            return {
                "id": _session_id,
                "payment_status": "paid",
                "client_reference_id": str(user_id),
                "metadata": {"user_id": str(user_id), "tier": "single", "period": "one_time"},
                "customer_details": {"email": "stripe-ledger@example.com"},
                "line_items": {"data": [{"price": {"id": "price_single"}}]},
                "amount_total": 999,
                "currency": "usd",
                "payment_intent": "pi_durable_001",
            }

    monkeypatch.setattr(
        billing_routes,
        "stripe",
        SimpleNamespace(api_key=None, checkout=SimpleNamespace(Session=FakeSession)),
    )
    monkeypatch.setattr(billing_routes.settings, "stripe_secret_key", "sk_test")
    monkeypatch.setattr(billing_routes.settings, "stripe_price_single_scan", "price_single")
    headers = {"Authorization": f"Bearer {token}"}
    first = client.post(
        "/billing/stripe/finalize-session?session_id=cs_durable_001", headers=headers
    )
    assert first.status_code == 200
    assert first.json() == {
        "status": "ok",
        "tier": "single",
        "billing_cycle": "one_time",
        "amount": 999,
        "currency": "usd",
        "transaction_id": "pi_durable_001",
    }

    with Session(get_engine()) as db:
        db.execute(delete(IdempotencyRecord))
        db.execute(delete(ActivityLog))
        db.commit()
    second = client.post(
        "/billing/stripe/finalize-session?session_id=cs_durable_001", headers=headers
    )
    assert second.status_code == 200
    with Session(get_engine()) as db:
        user = db.query(User).filter(User.id == user_id).one()
        assert user.daily_scans_count == 1
        assert db.query(StripePaymentApplication).count() == 1
        # Crash recovery trusts the permanent ledger and does not need to
        # recreate a transient idempotency lease or an activity log.
        assert db.query(IdempotencyRecord).count() == 0
        assert db.query(ActivityLog).count() == 0


def test_stripe_ledger_conflict_does_not_rollback_outer_transaction(client):
    from app.api.routes import billing as billing_routes

    _, _token = _register(client, "stripe-savepoint@example.com")
    with Session(get_engine()) as db:
        user_id = db.query(User).filter(User.email == "stripe-savepoint@example.com").one().id
        db.add(
            StripePaymentApplication(
                provider="stripe_checkout",
                reference_id="cs_existing_ledger",
                user_id=user_id,
                tier="single",
            )
        )
        db.commit()

        db.add(ActivityLog(user_id=user_id, action="reservation-sentinel", meta={}))
        assert not billing_routes._reserve_stripe_payment_application(
            db,
            user_id=user_id,
            session_id="cs_existing_ledger",
            resolved_tier="single",
        )
        db.commit()

    with Session(get_engine()) as db:
        assert (
            db.query(ActivityLog)
            .filter(ActivityLog.action == "reservation-sentinel")
            .count()
            == 1
        )
        assert db.query(StripePaymentApplication).count() == 1


def test_pending_subscription_reuses_identical_fingerprint_and_replaces_plan(client, monkeypatch):
    from app.api.routes import billing as billing_routes

    _, token = _register(client, "pending-checkout@example.com")
    assert token
    created: list[dict] = []
    expired: list[str] = []

    class FakeSession:
        @staticmethod
        def create(**kwargs):
            created.append(kwargs)
            number = len(created)
            return SimpleNamespace(
                id=f"cs_pending_{number}",
                url=f"https://checkout.stripe.test/{number}",
            )

        @staticmethod
        def expire(session_id):
            expired.append(session_id)
            return {"id": session_id, "status": "expired"}

    class FakeCustomer:
        @staticmethod
        def create(**_kwargs):
            return {"id": "cus_pending_001"}

    class FakeSubscription:
        @staticmethod
        def list(**_kwargs):
            return {"data": []}

    monkeypatch.setattr(
        billing_routes,
        "stripe",
        SimpleNamespace(
            api_key=None,
            checkout=SimpleNamespace(Session=FakeSession),
            Customer=FakeCustomer,
            Subscription=FakeSubscription,
        ),
    )
    monkeypatch.setattr(billing_routes.settings, "stripe_secret_key", "sk_test")
    monkeypatch.setattr(billing_routes.settings, "stripe_price_go_monthly", "price_go")
    monkeypatch.setattr(billing_routes.settings, "stripe_price_pro_monthly", "price_pro")
    base_headers = {"Authorization": f"Bearer {token}"}
    first = client.post(
        "/billing/stripe/checkout-session",
        json={"tier": "go", "billing_cycle": "month"},
        headers={**base_headers, "Idempotency-Key": "pending-browser-key-0001"},
    )
    same = client.post(
        "/billing/stripe/checkout-session",
        json={"tier": "go", "billing_cycle": "month"},
        headers={**base_headers, "Idempotency-Key": "pending-browser-key-0002"},
    )
    replacement = client.post(
        "/billing/stripe/checkout-session",
        json={"tier": "pro", "billing_cycle": "month"},
        headers={**base_headers, "Idempotency-Key": "pending-browser-key-0003"},
    )
    assert first.status_code == same.status_code == replacement.status_code == 200
    assert first.json() == same.json()
    assert len(created) == 2
    assert expired == ["cs_pending_1"]
    assert created[0]["idempotency_key"] != created[1]["idempotency_key"]


def test_app_store_original_transaction_cannot_move_accounts_and_revoked_credit_grants_zero(
    client, monkeypatch
):
    from app.api.routes import billing as billing_routes

    _, first_token = _register(client, "apple-owner-one@example.com")
    client.cookies.clear()
    _, second_token = _register(client, "apple-owner-two@example.com")
    assert first_token and second_token

    payload = {
        "bundleId": "com.cvboosta.app",
        "environment": "Sandbox",
        "productId": "com.cvboosta.app.single_scan",
        "transactionId": "apple-tx-one",
        "originalTransactionId": "apple-original-one",
        "quantity": 1,
        "signedDate": int(datetime.now(timezone.utc).timestamp() * 1000),
    }
    monkeypatch.setattr(
        billing_routes,
        "verify_and_decode_app_store_transaction",
        lambda _jws: dict(payload),
    )
    request_body = {
        "product_id": "com.cvboosta.app.single_scan",
        "transaction_id": "apple-tx-one",
        "original_transaction_id": "apple-original-one",
        "transaction_jws": "signed-jws-placeholder-value",
        "environment": "sandbox",
        "quantity": 1,
    }
    first = client.post(
        "/billing/app-store/sync",
        json=request_body,
        headers={"Authorization": f"Bearer {first_token}"},
    )
    assert first.status_code == 200

    payload["transactionId"] = "apple-tx-renewal"
    transfer = client.post(
        "/billing/app-store/sync",
        json={**request_body, "transaction_id": "apple-tx-renewal"},
        headers={"Authorization": f"Bearer {second_token}"},
    )
    assert transfer.status_code == 409
    with Session(get_engine()) as db:
        assert db.query(AppStorePurchaseOwner).count() == 1

    payload.update(
        {
            "transactionId": "apple-revoked-credit",
            "originalTransactionId": "apple-revoked-original",
            "revocationDate": int(datetime.now(timezone.utc).timestamp() * 1000),
        }
    )
    revoked = client.post(
        "/billing/app-store/sync",
        json={
            **request_body,
            "transaction_id": "apple-revoked-credit",
            "original_transaction_id": "apple-revoked-original",
        },
        headers={"Authorization": f"Bearer {second_token}"},
    )
    assert revoked.status_code == 200
    assert revoked.json()["scan_credit_balance"] == 0


def test_revoked_app_store_lifetime_cannot_fall_back_to_web_lifetime(client, monkeypatch):
    from app.api.routes import billing as billing_routes

    _, token = _register(client, "apple-revoked-lifetime@example.com")
    assert token
    payload = {
        "bundleId": "com.cvboosta.app",
        "environment": "Sandbox",
        "productId": "com.cvboosta.app.lifetime",
        "transactionId": "apple-lifetime-revoked-tx",
        "originalTransactionId": "apple-lifetime-revoked-original",
        "quantity": 1,
        "signedDate": int(datetime.now(timezone.utc).timestamp() * 1000),
    }
    monkeypatch.setattr(
        billing_routes,
        "verify_and_decode_app_store_transaction",
        lambda _jws: dict(payload),
    )
    request_body = {
        "product_id": "com.cvboosta.app.lifetime",
        "transaction_id": "apple-lifetime-revoked-tx",
        "original_transaction_id": "apple-lifetime-revoked-original",
        "transaction_jws": "signed-jws-placeholder-value",
        "environment": "sandbox",
        "quantity": 1,
    }
    headers = {"Authorization": f"Bearer {token}"}
    active = client.post("/billing/app-store/sync", json=request_body, headers=headers)
    assert active.status_code == 200
    assert active.json()["tier"] == "lifetime"
    assert active.json()["source"] == "app_store"

    payload["revocationDate"] = int(datetime.now(timezone.utc).timestamp() * 1000)
    revoked = client.post("/billing/app-store/sync", json=request_body, headers=headers)
    assert revoked.status_code == 200
    assert revoked.json()["tier"] == "free"
    assert revoked.json()["source"] == "app_store"

    denied = client.post(
        "/optimize",
        json={"cv_text": "Python", "job_text": "Backend role"},
        headers=headers,
    )
    assert denied.status_code == 402
    with Session(get_engine()) as db:
        user = db.query(User).filter(User.email == "apple-revoked-lifetime@example.com").one()
        assert user.subscription_tier == "free"


def test_web_lifetime_without_apple_lifetime_history_remains_valid(client):
    _, token = _register(client, "genuine-web-lifetime@example.com")
    assert token
    with Session(get_engine()) as db:
        user = db.query(User).filter(User.email == "genuine-web-lifetime@example.com").one()
        user.subscription_tier = "lifetime"
        db.add(user)
        db.commit()

    status = client.get(
        "/billing/status",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert status.status_code == 200
    assert status.json()["tier"] == "lifetime"
    assert status.json()["source"] == "web"


def test_reset_link_keeps_token_out_of_query_string(monkeypatch):
    from app.services import emailer

    monkeypatch.setattr(emailer.settings, "password_reset_frontend_url", "https://cvboosta.com")
    link = build_password_reset_link("sensitive-reset-token")
    assert link == "https://cvboosta.com/reset-password#token=sensitive-reset-token"
    assert "?token=" not in link

from __future__ import annotations

from types import SimpleNamespace
import time

import pytest
from sqlalchemy.orm import Session

from app.db.session import get_engine
from app.models.analysis import Analysis
from app.models.idempotency import IdempotencyRecord
from app.models.user import User
from app.schemas.keywords import KeywordExtractionResult
from app.services.llm import LLMResult


def _register(client, email: str, *, idempotency_key: str | None = None):
    headers = {"Origin": "http://localhost:3000"}
    if idempotency_key:
        headers["Idempotency-Key"] = idempotency_key
    return client.post(
        "/auth/register",
        json={"email": email, "password": "password123!", "full_name": "User"},
        headers=headers,
    )


def _native_token(client) -> str:
    response = client.post(
        "/auth/native/token",
        headers={"X-Native-Client-Key": "unit-test-native-client-key-0123456789"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_registration_replay_is_idempotent_and_stores_only_keyed_digests(client):
    key = "register-attempt-00000001"
    email = "idempotent-registration@example.com"

    first = _register(client, email, idempotency_key=key)
    second = _register(client, email, idempotency_key=key)

    assert first.status_code == 200
    assert second.status_code == 200
    with Session(get_engine()) as db:
        assert db.query(User).filter(User.email == email).count() == 1
        record = (
            db.query(IdempotencyRecord)
            .filter(IdempotencyRecord.operation == "auth.register")
            .order_by(IdempotencyRecord.id.desc())
            .first()
        )
        assert record is not None
        serialized = "|".join(
            [
                record.scope_hash,
                record.key_hash,
                record.request_hash,
                record.response_encrypted or "",
            ]
        )
        assert key not in serialized
        assert email not in serialized
        assert "password123!" not in serialized


def test_registration_rejects_reusing_key_with_different_body(client):
    key = "register-attempt-00000002"
    email = "idempotent-registration-conflict@example.com"
    assert _register(client, email, idempotency_key=key).status_code == 200

    conflict = client.post(
        "/auth/register",
        json={"email": email, "password": "different-password2!", "full_name": "User"},
        headers={"Idempotency-Key": key, "Origin": "http://localhost:3000"},
    )

    assert conflict.status_code == 409


def test_optimize_replay_does_not_consume_quota_or_create_second_analysis(client, monkeypatch):
    from app.api.routes import optimize as optimize_routes

    monkeypatch.setattr(
        optimize_routes,
        "generate_optimized_cv",
        lambda *_, **__: LLMResult(optimized_cv="Python SQL", feedback="done"),
    )
    monkeypatch.setattr(
        optimize_routes,
        "extract_job_keywords",
        lambda _text: KeywordExtractionResult(skills=["Python", "SQL"], requirements=[]),
    )
    monkeypatch.setattr(
        optimize_routes,
        "build_recommendations",
        lambda missing: [f"Learn {item}" for item in missing],
    )

    register = _register(client, "idempotent-optimize@example.com")
    token = _native_token(client)
    with Session(get_engine()) as db:
        user = db.query(User).filter(User.email == "idempotent-optimize@example.com").one()
        user.subscription_tier = "single"
        user.daily_scans_count = 1
        user.daily_cl_count = 1
        user.daily_prep_count = 1
        db.commit()
    headers = {
        "Authorization": f"Bearer {token}",
        "Idempotency-Key": "optimize-attempt-00000001",
    }
    payload = {
        "cv_text": "Python",
        "job_text": "Python SQL role",
        "cv_analysis": "analysis",
        "job_analysis": "analysis",
    }

    first = client.post("/optimize", json=payload, headers=headers)
    second = client.post("/optimize", json=payload, headers=headers)

    assert first.status_code == 200
    assert second.status_code == 200
    assert second.json() == first.json()
    with Session(get_engine()) as db:
        user = db.query(User).filter(User.email == "idempotent-optimize@example.com").one()
        assert user.daily_scans_count == 0
        assert db.query(Analysis).filter(Analysis.user_id == user.id).count() == 1

    # A genuinely new attempt still observes the consumed free quota.
    third = client.post(
        "/optimize",
        json=payload,
        headers={
            "Authorization": f"Bearer {token}",
            "Idempotency-Key": "optimize-attempt-00000002",
        },
    )
    assert third.status_code == 402


def test_checkout_replay_uses_stripe_and_local_idempotency(client, monkeypatch):
    from app.api.routes import billing as billing_routes

    created: list[dict] = []

    class FakeCheckoutSession:
        @staticmethod
        def create(**kwargs):
            created.append(kwargs)
            return SimpleNamespace(url="https://checkout.stripe.test/session", id="cs_test_idempotent")

    class FakeCustomer:
        @staticmethod
        def create(**_kwargs):
            return {"id": "cus_idempotent_00000001"}

    fake_stripe = SimpleNamespace(
        api_key=None,
        checkout=SimpleNamespace(Session=FakeCheckoutSession),
        Subscription=SimpleNamespace(),
        Customer=FakeCustomer,
    )
    monkeypatch.setattr(billing_routes, "stripe", fake_stripe)
    monkeypatch.setattr(billing_routes.settings, "stripe_secret_key", "sk_test")
    monkeypatch.setattr(billing_routes.settings, "stripe_price_single_scan", "price_single")

    register = _register(client, "idempotent-checkout@example.com")
    token = _native_token(client)
    headers = {
        "Authorization": f"Bearer {token}",
        "Idempotency-Key": "checkout-attempt-00000001",
    }
    payload = {"tier": "single", "billing_cycle": "one_time"}

    first = client.post("/billing/stripe/checkout-session", json=payload, headers=headers)
    second = client.post("/billing/stripe/checkout-session", json=payload, headers=headers)

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json() == second.json()
    assert len(created) == 1
    assert created[0]["idempotency_key"].startswith("cvboosta-checkout-")


def test_finalize_session_requires_strong_user_owner_signal(client, monkeypatch):
    from app.api.routes import billing as billing_routes

    class FakeCheckoutSession:
        @staticmethod
        def retrieve(*_args, **_kwargs):
            return {
                "id": "cs_paid_without_owner",
                "payment_status": "paid",
                "metadata": {"tier": "single"},
                "customer_details": {},
                "line_items": {"data": []},
            }

    fake_stripe = SimpleNamespace(
        api_key=None,
        checkout=SimpleNamespace(Session=FakeCheckoutSession),
    )
    monkeypatch.setattr(billing_routes, "stripe", fake_stripe)
    monkeypatch.setattr(billing_routes.settings, "stripe_secret_key", "sk_test")

    register = _register(client, "finalize-owner@example.com")
    token = _native_token(client)
    response = client.post(
        "/billing/stripe/finalize-session?session_id=cs_paid_without_owner",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403


def test_production_stripe_webhook_fails_closed_without_signing_secret(client, monkeypatch):
    from app.api.routes import billing as billing_routes

    fake_stripe = SimpleNamespace(api_key=None)
    monkeypatch.setattr(billing_routes, "stripe", fake_stripe)
    monkeypatch.setattr(billing_routes.settings, "stripe_secret_key", "sk_test")
    monkeypatch.setattr(billing_routes.settings, "stripe_webhook_secret", None)
    monkeypatch.setattr(billing_routes.settings, "app_env", "production")

    response = client.post(
        "/billing/stripe/webhook",
        json={"type": "checkout.session.completed", "data": {"object": {}}},
    )

    assert response.status_code == 503


def test_checkout_completed_does_not_grant_before_payment(client, monkeypatch):
    from app.api.routes import billing as billing_routes

    monkeypatch.setattr(billing_routes, "stripe", SimpleNamespace(api_key=None))
    monkeypatch.setattr(billing_routes.settings, "stripe_secret_key", "sk_test")
    monkeypatch.setattr(billing_routes.settings, "stripe_webhook_secret", None)

    register = _register(client, "checkout-unpaid@example.com")
    user_id = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {_native_token(client)}"},
    ).json()["id"]
    response = client.post(
        "/billing/stripe/webhook",
        json={
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": "cs_unpaid_00000001",
                    "payment_status": "unpaid",
                    "metadata": {"user_id": str(user_id), "tier": "single"},
                }
            },
        },
    )

    assert response.status_code == 200
    with Session(get_engine()) as db:
        user = db.query(User).filter(User.id == user_id).one()
        assert user.subscription_tier == "free"
        assert user.daily_scans_count == 0


@pytest.mark.parametrize("subscription_status", ["incomplete", "paused", "past_due", "unpaid"])
def test_non_active_subscription_status_never_grants_access(
    client,
    monkeypatch,
    subscription_status: str,
):
    from app.api.routes import billing as billing_routes

    monkeypatch.setattr(billing_routes, "stripe", SimpleNamespace(api_key=None))
    monkeypatch.setattr(billing_routes.settings, "stripe_secret_key", "sk_test")
    monkeypatch.setattr(billing_routes.settings, "stripe_webhook_secret", None)
    monkeypatch.setattr(billing_routes.settings, "stripe_price_go_monthly", "price_go_monthly")

    register = _register(client, f"subscription-{subscription_status}@example.com")
    user_id = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {_native_token(client)}"},
    ).json()["id"]
    subscription_id = f"sub_{subscription_status}_00000001"
    with Session(get_engine()) as db:
        user = db.query(User).filter(User.id == user_id).one()
        user.paddle_subscription_id = subscription_id
        db.commit()
    response = client.post(
        "/billing/stripe/webhook",
        json={
            "type": "customer.subscription.updated",
            "data": {
                "object": {
                    "id": subscription_id,
                    "customer": "cus_status_00000001",
                    "status": subscription_status,
                    "current_period_end": int(time.time()) + 3600,
                    "metadata": {"user_id": str(user_id)},
                    "items": {"data": [{"price": {"id": "price_go_monthly"}}]},
                }
            },
        },
    )

    assert response.status_code == 200
    with Session(get_engine()) as db:
        user = db.query(User).filter(User.id == user_id).one()
        assert user.subscription_tier == "free"
        assert user.paddle_subscription_id == subscription_id


def test_active_subscription_status_grants_access(client, monkeypatch):
    from app.api.routes import billing as billing_routes

    monkeypatch.setattr(billing_routes, "stripe", SimpleNamespace(api_key=None))
    monkeypatch.setattr(billing_routes.settings, "stripe_secret_key", "sk_test")
    monkeypatch.setattr(billing_routes.settings, "stripe_webhook_secret", None)
    monkeypatch.setattr(billing_routes.settings, "stripe_price_go_monthly", "price_go_monthly")

    register = _register(client, "subscription-active@example.com")
    user_id = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {_native_token(client)}"},
    ).json()["id"]
    with Session(get_engine()) as db:
        user = db.query(User).filter(User.id == user_id).one()
        user.paddle_subscription_id = "sub_active_00000001"
        db.commit()
    response = client.post(
        "/billing/stripe/webhook",
        json={
            "type": "customer.subscription.updated",
            "data": {
                "object": {
                    "id": "sub_active_00000001",
                    "customer": "cus_active_00000001",
                    "status": "active",
                    "current_period_end": int(time.time()) + 3600,
                    "metadata": {"user_id": str(user_id)},
                    "items": {"data": [{"price": {"id": "price_go_monthly"}}]},
                }
            },
        },
    )

    assert response.status_code == 200
    with Session(get_engine()) as db:
        user = db.query(User).filter(User.id == user_id).one()
        assert user.subscription_tier == "go"
        assert user.paddle_subscription_id == "sub_active_00000001"


def test_paid_checkout_waits_for_subscription_activation(client, monkeypatch):
    from app.api.routes import billing as billing_routes

    class FakeSubscription:
        @staticmethod
        def retrieve(_subscription_id):
            return {
                "id": _subscription_id,
                "status": "incomplete",
                "current_period_end": int(time.time()) + 3600,
            }

    class FakeCheckoutSession:
        @staticmethod
        def list_line_items(_session_id, limit=1):
            return {"data": [{"price": {"id": "price_go_monthly"}}]}

    monkeypatch.setattr(
        billing_routes,
        "stripe",
        SimpleNamespace(
            api_key=None,
            Subscription=FakeSubscription,
            checkout=SimpleNamespace(Session=FakeCheckoutSession),
        ),
    )
    monkeypatch.setattr(billing_routes.settings, "stripe_secret_key", "sk_test")
    monkeypatch.setattr(billing_routes.settings, "stripe_webhook_secret", None)
    monkeypatch.setattr(billing_routes.settings, "stripe_price_go_monthly", "price_go_monthly")

    register = _register(client, "checkout-incomplete-subscription@example.com")
    user_id = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {_native_token(client)}"},
    ).json()["id"]
    response = client.post(
        "/billing/stripe/webhook",
        json={
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": "cs_incomplete_subscription_00000001",
                    "payment_status": "paid",
                    "subscription": "sub_incomplete_00000001",
                    "customer": "cus_incomplete_00000001",
                    "metadata": {"user_id": str(user_id), "tier": "go"},
                }
            },
        },
    )

    assert response.status_code == 200
    with Session(get_engine()) as db:
        user = db.query(User).filter(User.id == user_id).one()
        assert user.subscription_tier == "free"
        assert user.paddle_subscription_id == "sub_incomplete_00000001"


def test_demo_is_deterministic_without_external_ai_and_is_expensively_limited(client, monkeypatch):
    from app.core.rate_limit import _is_expensive_path
    from app.services import llm

    monkeypatch.setattr(
        llm,
        "generate_optimized_cv",
        lambda *_args, **_kwargs: (_ for _ in ()).throw(AssertionError("LLM must not run")),
    )

    first = client.get("/demo/optimize")
    second = client.get("/demo/optimize")

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json() == second.json()
    assert first.json()["optimized_cv"]
    assert first.json()["job_description"]
    assert _is_expensive_path("/demo/optimize") is True

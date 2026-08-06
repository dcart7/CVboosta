from __future__ import annotations

import secrets
import logging
import hmac

from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, Request, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import delete
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db, get_sessionlocal
from app.models.analysis import Analysis
from app.models.billing import AppStoreTransaction, PendingStripeCheckout, UserBillingEntitlement
from app.models.device_push_token import DevicePushToken
from app.models.live_activity_push_token import LiveActivityPushToken
from app.models.live_activity_start_token import LiveActivityStartToken
from app.models.idempotency import IdempotencyRecord
from app.models.oauth_identity import OAuthIdentity
from app.models.request_log import RequestLog
from app.models.user import User
from app.schemas.auth import (
    ActivityResponse,
    AuthResponse,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    NativeTokenResponse,
    OAuthLoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    UserResponse,
)
from app.services.auth import (
    create_access_token,
    create_password_reset_token,
    decode_access_token,
    decode_password_reset_token,
    hash_password,
    normalize_password_input,
    password_hash_needs_update,
    validate_new_password,
    validate_password_reset_token_for_user,
    validate_access_token_for_user,
    verify_password,
)
from app.services.activity_logger import record_activity
from app.models.activity import ActivityLog
from app.services.emailer import build_password_reset_link, send_password_reset_email
from app.services.oauth import verify_google_access_token, verify_oauth_id_token
from app.services.app_store import refresh_app_store_entitlement_from_transactions
from app.services.idempotency import (
    begin_idempotent_request,
    canonical_request_hash,
    complete_idempotent_request,
    fail_idempotent_request,
    normalize_idempotency_key,
)

router = APIRouter()
optional_bearer = HTTPBearer(auto_error=False)
logger = logging.getLogger(__name__)
_DUMMY_PASSWORD_HASH = hash_password("timing-only-password-2026!")


def _deliver_password_reset(user_id: int, email: str, reset_link: str) -> None:
    if not send_password_reset_email(to_email=email, reset_link=reset_link):
        return
    session_local = get_sessionlocal()
    if session_local is None:
        return
    db = session_local()
    try:
        record_activity(db, user_id=user_id, action="Password reset requested", meta={})
    except Exception:
        db.rollback()
    finally:
        db.close()


def _delete_user_related_rows(db: Session, user_id: int) -> None:
    db.execute(delete(RequestLog).where(RequestLog.user_id == user_id))
    db.execute(delete(ActivityLog).where(ActivityLog.user_id == user_id))
    db.execute(delete(Analysis).where(Analysis.user_id == user_id))
    db.execute(delete(AppStoreTransaction).where(AppStoreTransaction.user_id == user_id))
    db.execute(delete(UserBillingEntitlement).where(UserBillingEntitlement.user_id == user_id))
    db.execute(delete(DevicePushToken).where(DevicePushToken.user_id == user_id))
    db.execute(delete(LiveActivityPushToken).where(LiveActivityPushToken.user_id == user_id))
    db.execute(delete(LiveActivityStartToken).where(LiveActivityStartToken.user_id == user_id))
    db.execute(delete(OAuthIdentity).where(OAuthIdentity.user_id == user_id))
    db.execute(delete(IdempotencyRecord).where(IdempotencyRecord.user_id == user_id))
    db.execute(delete(PendingStripeCheckout).where(PendingStripeCheckout.user_id == user_id))


def _set_auth_cookie(request: Request, response: Response, token: str) -> None:
    # Never silently downgrade a production Secure cookie because an internal
    # proxy hop reaches the app over HTTP. Local development opts out through
    # AUTH_COOKIE_SECURE=false explicitly.
    secure = settings.auth_cookie_secure
    samesite = settings.auth_cookie_samesite.lower().strip() if settings.auth_cookie_samesite else "lax"
    if samesite not in {"lax", "strict", "none"}:
        samesite = "lax"
    if samesite == "none" and not secure:
        samesite = "lax"

    response.set_cookie(
        key=settings.auth_cookie_name,
        value=token,
        httponly=True,
        secure=secure,
        samesite=samesite,
        max_age=settings.jwt_exp_minutes * 60,
        domain=settings.auth_cookie_domain,
        path="/",
    )


def _clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.auth_cookie_name,
        domain=settings.auth_cookie_domain,
        path="/",
    )


def _is_browser_request(request: Request) -> bool:
    if (request.headers.get("origin") or "").strip():
        return True
    return any(
        (request.headers.get(header) or "").strip()
        for header in (
            "sec-fetch-site",
            "sec-fetch-mode",
            "sec-fetch-dest",
            "sec-fetch-user",
        )
    )


def _is_legacy_native_request(request: Request) -> bool:
    """Identify installed app clients that still expect bearer tokens on login.

    Some native networking stacks can attach an Origin header, which would make
    the hardening rollout classify the request as browser traffic.  Keep the
    compatibility path narrow: browser-like user agents remain cookie-only.
    """
    user_agent = (request.headers.get("user-agent") or "").lower()
    if not user_agent:
        return False
    if "mozilla/" in user_agent or "safari/" in user_agent or "chrome/" in user_agent:
        return False
    return any(
        marker in user_agent
        for marker in (
            "cfnetwork",
            "darwin",
            "cvboosta",
            "cvboostaios",
            "cvboosta-ios",
        )
    )


def _auth_response(request: Request, user: User, token: str) -> AuthResponse:
    # Browsers authenticate solely through the HttpOnly cookie. Existing iOS
    # releases do not send browser Fetch Metadata headers and retain the legacy
    # bearer response during the native-token-exchange rollout.
    if _is_browser_request(request) and not _is_legacy_native_request(request):
        return AuthResponse(email=user.email)
    return AuthResponse(access_token=token, token_type="bearer", email=user.email)


def _extract_token(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None,
) -> str:
    header_token = (credentials.credentials if credentials else "") or ""
    header_token = header_token.strip()
    if header_token and header_token.lower() not in {"null", "undefined"}:
        return header_token
    cookie_token = (request.cookies.get(settings.auth_cookie_name) or "").strip()
    return cookie_token


@router.post("/auth/register", response_model=AuthResponse, response_model_exclude_none=True)
def register(
    payload: RegisterRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> AuthResponse:
    try:
        normalized_password = validate_new_password(payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    normalized_email = payload.email.lower().strip()
    normalized_key = normalize_idempotency_key(idempotency_key)
    idempotency_attempt = None
    if normalized_key:
        attempt = begin_idempotent_request(
            db,
            operation="auth.register",
            scope=f"registration:{normalized_email}",
            key=normalized_key,
            request_hash=canonical_request_hash(
                {
                    "email": normalized_email,
                    "password": normalized_password,
                    "full_name": (payload.full_name or "").strip(),
                }
            ),
            user_id=None,
        )
        idempotency_attempt = attempt
        if attempt.is_replay:
            replay_user = (
                db.query(User).filter(User.id == attempt.record.user_id).first()
                if attempt.record.user_id
                else None
            )
            if replay_user is None or replay_user.email.lower() != normalized_email:
                raise HTTPException(
                    status_code=409,
                    detail="The completed registration cannot be replayed safely.",
                )
            token = create_access_token(replay_user)
            _set_auth_cookie(request, response, token)
            return _auth_response(request, replay_user, token)

    user = User(
        email=normalized_email,
        password_hash=hash_password(normalized_password),
        full_name=payload.full_name
    )
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        fail_idempotent_request(db, attempt=idempotency_attempt)
        raise HTTPException(status_code=409, detail="Email already registered")

    if idempotency_attempt:
        try:
            complete_idempotent_request(
                db,
                attempt=idempotency_attempt,
                user_id=user.id,
                response={"registered": True},
                resource_id=user.id,
            )
        except Exception:
            # Registration already committed.  Do not turn a successful account
            # creation into a retry that appears safe to execute again.
            fail_idempotent_request(db, attempt=idempotency_attempt)
            raise HTTPException(
                status_code=500,
                detail="Account created, but the response could not be finalized. Please sign in.",
            )

    record_activity(db, user_id=user.id, action="Account created", meta={})
    token = create_access_token(user)
    _set_auth_cookie(request, response, token)
    return _auth_response(request, user, token)


@router.post("/auth/login", response_model=AuthResponse, response_model_exclude_none=True)
def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> AuthResponse:
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    provided_password = payload.password
    normalized_password = normalize_password_input(provided_password)
    candidates = [provided_password, normalized_password]
    # Always perform the expensive password derivation, including for an
    # unknown address, to reduce account enumeration through response timing.
    comparison_hash = user.password_hash if user else _DUMMY_PASSWORD_HASH
    password_results = [
        verify_password(candidate, comparison_hash) for candidate in candidates
    ]
    valid_password = bool(user) and any(password_results)
    if not user or not valid_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if password_hash_needs_update(user.password_hash):
        matched_password = next(
            candidate
            for candidate, matched in zip(candidates, password_results)
            if matched
        )
        user.password_hash = hash_password(matched_password)
        db.add(user)
        db.commit()

    record_activity(db, user_id=user.id, action="Signed in", meta={})
    token = create_access_token(user)
    _set_auth_cookie(request, response, token)
    return _auth_response(request, user, token)


@router.post("/auth/oauth/{provider}", response_model=AuthResponse, response_model_exclude_none=True)
def oauth_login(
    provider: str,
    payload: OAuthLoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> AuthResponse:
    provider_name = provider.strip().lower()
    if provider_name not in {"google", "apple"}:
        raise HTTPException(status_code=400, detail="Unsupported OAuth provider")

    try:
        if provider_name == "google" and payload.access_token:
            claims = verify_google_access_token(payload.access_token)
        elif payload.id_token:
            claims = verify_oauth_id_token(provider_name, payload.id_token)
        else:
            raise HTTPException(status_code=400, detail="OAuth token is missing")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid OAuth token") from exc

    provider_user_id = str(claims.get("sub", "")).strip()
    if not provider_user_id:
        raise HTTPException(status_code=400, detail="OAuth subject is missing")

    verified_marker = claims.get("email_verified")
    email_is_verified = verified_marker is True or (
        isinstance(verified_marker, str) and verified_marker.lower() == "true"
    )
    # Client payload fields are never proof of ownership. Apple may omit email
    # after the first login, which is safe once the provider subject is linked.
    email = (
        str(claims.get("email") or "").strip().lower()
        if email_is_verified
        else ""
    )
    identity = (
        db.query(OAuthIdentity)
        .filter(
            OAuthIdentity.provider == provider_name,
            OAuthIdentity.provider_user_id == provider_user_id,
        )
        .first()
    )

    user = db.query(User).filter(User.id == identity.user_id).first() if identity else None
    display_name = (payload.full_name or "").strip() or str(claims.get("name", "")).strip() or None

    if not user:
        if not email:
            raise HTTPException(status_code=400, detail="OAuth email is missing")

        # Do not silently attach a provider identity to a pre-existing account.
        # Password registrations currently have no verified-email marker, so
        # matching an OAuth email alone cannot prove control of that account.
        if db.query(User.id).filter(User.email == email).first():
            raise HTTPException(
                status_code=409,
                detail="An account with this email already exists. Sign in before linking OAuth.",
            )

        random_password = secrets.token_urlsafe(48)
        user = User(
            email=email,
            password_hash=hash_password(random_password),
            full_name=display_name,
        )
        try:
            db.add(user)
            db.commit()
            db.refresh(user)
        except IntegrityError:
            db.rollback()
            identity = (
                db.query(OAuthIdentity)
                .filter(
                    OAuthIdentity.provider == provider_name,
                    OAuthIdentity.provider_user_id == provider_user_id,
                )
                .first()
            )
            user = db.query(User).filter(User.id == identity.user_id).first() if identity else None
            if not identity or not user:
                raise HTTPException(
                    status_code=409,
                    detail="An account with this email already exists. Sign in before linking OAuth.",
                )
        if identity is None:
            record_activity(
                db,
                user_id=user.id,
                action="Account created",
                meta={"method": provider_name},
            )

            identity = OAuthIdentity(
                user_id=user.id,
                provider=provider_name,
                provider_user_id=provider_user_id,
                email=email or None,
            )
            try:
                db.add(identity)
                db.commit()
                db.refresh(identity)
            except IntegrityError:
                db.rollback()
                identity = (
                    db.query(OAuthIdentity)
                    .filter(
                        OAuthIdentity.provider == provider_name,
                        OAuthIdentity.provider_user_id == provider_user_id,
                    )
                    .first()
                )
                if identity is None:
                    raise HTTPException(status_code=500, detail="Failed to link OAuth identity")
                user = db.query(User).filter(User.id == identity.user_id).first()
                if user is None:
                    raise HTTPException(status_code=500, detail="OAuth identity is linked to a missing user")
    else:
        needs_commit = False
        if display_name and not user.full_name:
            user.full_name = display_name
            needs_commit = True
        if email and identity and identity.email != email:
            identity.email = email
            needs_commit = True
        if needs_commit:
            db.add(user)
            if identity:
                db.add(identity)
            db.commit()

    record_activity(db, user_id=user.id, action="Signed in", meta={"method": provider_name})
    token = create_access_token(user)
    _set_auth_cookie(request, response, token)
    return _auth_response(request, user, token)


def _require_native_client(
    request: Request,
    native_client_key: str | None = Header(default=None, alias="X-Native-Client-Key"),
) -> None:
    if _is_browser_request(request):
        raise HTTPException(status_code=403, detail="Native token exchange rejects browser requests.")
    expected = (settings.native_auth_client_key or "").strip()
    provided = (native_client_key or "").strip()
    if not expected:
        raise HTTPException(status_code=404, detail="Native token exchange is unavailable.")
    if not provided or not hmac.compare_digest(provided, expected):
        raise HTTPException(status_code=401, detail="Invalid native client credentials.")


@router.post("/auth/logout")
def logout(response: Response) -> dict[str, str]:
    _clear_auth_cookie(response)
    return {"status": "ok"}


def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_bearer),
    db: Session = Depends(get_db),
) -> User:
    token = _extract_token(request, credentials)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")
    try:
        payload = decode_access_token(token)
        user_id = int(payload.get("sub", "0"))
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    try:
        validate_access_token_for_user(payload, user)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc
    return user


def get_current_user_optional(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_bearer),
    db: Session = Depends(get_db),
) -> User | None:
    token = _extract_token(request, credentials)
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        user_id = int(payload.get("sub", "0"))
    except Exception:
        return None
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    try:
        validate_access_token_for_user(payload, user)
    except Exception:
        return None
    return user


@router.post("/auth/native/token", response_model=NativeTokenResponse)
def issue_native_token(
    _native_client: None = Depends(_require_native_client),
    current_user: User = Depends(get_current_user),
) -> NativeTokenResponse:
    """Exchange the HttpOnly login session for a native bearer token.

    Browser auth endpoints never place the bearer token in JavaScript-visible
    response bodies. Native releases use this separately configured contract.
    """

    token = create_access_token(current_user)
    return NativeTokenResponse(access_token=token, email=current_user.email)


@router.delete("/auth/account", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    if (current_user.paddle_subscription_id or "").strip():
        raise HTTPException(
            status_code=409,
            detail=(
                "Cancel the active Stripe subscription before deleting the account "
                "so future charges are not orphaned."
            ),
        )
    app_store_entitlement = refresh_app_store_entitlement_from_transactions(db, current_user.id)
    if app_store_entitlement and app_store_entitlement.is_active:
        raise HTTPException(
            status_code=409,
            detail=(
                "Cancel the App Store subscription and wait until its current period ends "
                "before deleting the account."
            ),
        )
    _delete_user_related_rows(db, current_user.id)
    db.delete(current_user)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Account deletion is blocked by linked records. Please try again after removing attached data.",
        ) from exc

    _clear_auth_cookie(response)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.get("/auth/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        created_at=current_user.created_at,
    )


@router.post("/auth/change-password")
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    current_raw = payload.current_password
    current_normalized = normalize_password_input(current_raw)
    current_candidates = [current_raw]
    if current_normalized != current_raw:
        current_candidates.append(current_normalized)
    current_valid = any(
        verify_password(candidate, current_user.password_hash)
        for candidate in current_candidates
    )
    if not current_valid:
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    try:
        new_password_normalized = validate_new_password(payload.new_password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if verify_password(new_password_normalized, current_user.password_hash):
        raise HTTPException(status_code=400, detail="New password must be different")
    current_user.password_hash = hash_password(new_password_normalized)
    db.add(current_user)
    db.commit()
    record_activity(db, user_id=current_user.id, action="Password updated", meta={})
    return {"status": "ok"}


@router.post("/auth/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> dict:
    # Always return the same response to prevent email enumeration.
    response = {"status": "ok", "message": "If this email exists, reset instructions were sent."}
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    try:
        timing_user = user or User(
            id=0,
            email="nobody.invalid@example.invalid",
            password_hash=_DUMMY_PASSWORD_HASH,
        )
        token = create_password_reset_token(timing_user)
        reset_link = build_password_reset_link(token)
        if not reset_link:
            logger.warning("Password reset frontend URL is not configured")
            return response
        if user:
            # Network SMTP work runs after the response has been sent, keeping
            # existing and absent accounts on the same synchronous path.
            background_tasks.add_task(
                _deliver_password_reset,
                user.id,
                user.email,
                reset_link,
            )
    except Exception:
        # Keep response generic to avoid account/email leaks.
        logger.warning("Password reset preparation failed")
        return response
    return response


@router.post("/auth/reset-password")
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> dict:
    try:
        token_payload = decode_password_reset_token(payload.token)
        user_id = int(str(token_payload.get("sub", "0")))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.") from exc

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.")

    normalized_key = normalize_idempotency_key(idempotency_key)
    idempotency_attempt = None
    if normalized_key:
        idempotency_attempt = begin_idempotent_request(
            db,
            operation="auth.password.reset",
            scope=f"user:{user.id}",
            key=normalized_key,
            request_hash=canonical_request_hash(
                {
                    "token": payload.token,
                    "new_password": payload.new_password,
                }
            ),
            user_id=user.id,
        )
        # This check intentionally precedes validation against the current
        # password hash. A successful first request revokes its own reset token,
        # so a network retry must replay the atomic committed result instead.
        if idempotency_attempt.is_replay:
            return idempotency_attempt.replay_response

    try:
        validate_password_reset_token_for_user(token_payload, user)
    except Exception as exc:
        fail_idempotent_request(db, attempt=idempotency_attempt)
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.") from exc

    try:
        try:
            new_password_normalized = validate_new_password(payload.new_password)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        if verify_password(new_password_normalized, user.password_hash):
            raise HTTPException(status_code=400, detail="New password must be different.")

        user.password_hash = hash_password(new_password_normalized)
        db.add(user)
        response_payload = {"status": "ok"}
        if idempotency_attempt:
            complete_idempotent_request(
                db,
                attempt=idempotency_attempt,
                user_id=user.id,
                response=response_payload,
                commit=False,
            )
        # Password rotation and replay record are committed atomically.
        db.commit()
    except HTTPException:
        db.rollback()
        fail_idempotent_request(db, attempt=idempotency_attempt)
        raise
    except Exception as exc:
        db.rollback()
        fail_idempotent_request(db, attempt=idempotency_attempt)
        raise HTTPException(
            status_code=500,
            detail="Password could not be reset safely. Retry the same request.",
        ) from exc
    record_activity(db, user_id=user.id, action="Password reset completed", meta={})
    return response_payload


@router.get("/auth/activity", response_model=ActivityResponse)
def activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ActivityResponse:
    rows = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == current_user.id)
        .order_by(ActivityLog.created_at.desc())
        .limit(10)
        .all()
    )
    items = [
        {"action": row.action, "meta": row.meta, "created_at": row.created_at}
        for row in rows
    ]
    return ActivityResponse(items=items)

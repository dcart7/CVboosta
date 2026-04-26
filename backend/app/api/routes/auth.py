from __future__ import annotations

import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    ActivityResponse,
    AuthResponse,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
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
    validate_password_reset_token_for_user,
    verify_password,
)
from app.services.activity_logger import record_activity
from app.models.activity import ActivityLog
from app.services.emailer import build_password_reset_link, send_password_reset_email
from app.services.oauth import verify_google_access_token, verify_oauth_id_token

router = APIRouter()
optional_bearer = HTTPBearer(auto_error=False)


def _request_is_https(request: Request) -> bool:
    forwarded_proto = (request.headers.get("x-forwarded-proto") or "").split(",")[0].strip().lower()
    if forwarded_proto == "https":
        return True
    return request.url.scheme.lower() == "https"


def _set_auth_cookie(request: Request, response: Response, token: str) -> None:
    secure = settings.auth_cookie_secure and _request_is_https(request)
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


@router.post("/auth/register", response_model=AuthResponse)
def register(
    payload: RegisterRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> AuthResponse:
    normalized_password = normalize_password_input(payload.password)
    if len(normalized_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    user = User(
        email=payload.email.lower().strip(), 
        password_hash=hash_password(normalized_password),
        full_name=payload.full_name
    )
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email already registered")

    record_activity(db, user_id=user.id, action="Account created", meta={})
    token = create_access_token(user)
    _set_auth_cookie(request, response, token)
    return AuthResponse(access_token=token, email=user.email)


@router.post("/auth/login", response_model=AuthResponse)
def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> AuthResponse:
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    provided_password = payload.password
    normalized_password = normalize_password_input(provided_password)
    candidates = [provided_password]
    if normalized_password != provided_password:
        candidates.append(normalized_password)
    valid_password = bool(user) and any(
        verify_password(candidate, user.password_hash) for candidate in candidates
    )
    if not user or not valid_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    record_activity(db, user_id=user.id, action="Signed in", meta={})
    token = create_access_token(user)
    _set_auth_cookie(request, response, token)
    return AuthResponse(access_token=token, email=user.email)


@router.post("/auth/oauth/{provider}", response_model=AuthResponse)
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

    email = str(claims.get("email", "")).strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="OAuth email is missing")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        display_name = (payload.full_name or "").strip() or str(claims.get("name", "")).strip() or None
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
            user = db.query(User).filter(User.email == email).first()
            if not user:
                raise HTTPException(status_code=500, detail="Failed to create OAuth user")
        record_activity(
            db,
            user_id=user.id,
            action="Account created",
            meta={"method": provider_name},
        )
    else:
        if not user.full_name:
            display_name = (payload.full_name or "").strip() or str(claims.get("name", "")).strip()
            if display_name:
                user.full_name = display_name
                db.add(user)
                db.commit()

    record_activity(db, user_id=user.id, action="Signed in", meta={"method": provider_name})
    token = create_access_token(user)
    _set_auth_cookie(request, response, token)
    return AuthResponse(access_token=token, email=user.email)


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
    return db.query(User).filter(User.id == user_id).first()


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
    new_password_normalized = normalize_password_input(payload.new_password)
    if len(new_password_normalized) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters.")
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
    db: Session = Depends(get_db),
) -> dict:
    # Always return the same response to prevent email enumeration.
    response = {"status": "ok", "message": "If this email exists, reset instructions were sent."}
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user:
        return response

    try:
        token = create_password_reset_token(user)
        reset_link = build_password_reset_link(token)
        if not reset_link:
            print(
                "[password-reset] reset link is empty. Set PASSWORD_RESET_FRONTEND_URL or HTTPS CORS origin."
            )
            return response
        sent = send_password_reset_email(to_email=user.email, reset_link=reset_link)
        if sent:
            record_activity(db, user_id=user.id, action="Password reset requested", meta={})
        else:
            print(f"[password-reset] failed to send reset email to {user.email}")
    except Exception:
        # Keep response generic to avoid account/email leaks.
        print(f"[password-reset] unexpected error while preparing reset for {user.email}")
        return response
    return response


@router.post("/auth/reset-password")
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
) -> dict:
    try:
        token_payload = decode_password_reset_token(payload.token)
        user_id = int(str(token_payload.get("sub", "0")))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.") from exc

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.")

    try:
        validate_password_reset_token_for_user(token_payload, user)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.") from exc

    new_password_normalized = normalize_password_input(payload.new_password)
    if len(new_password_normalized) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters.")
    if verify_password(new_password_normalized, user.password_hash):
        raise HTTPException(status_code=400, detail="New password must be different.")

    user.password_hash = hash_password(new_password_normalized)
    db.add(user)
    db.commit()
    record_activity(db, user_id=user.id, action="Password reset completed", meta={})
    return {"status": "ok"}


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

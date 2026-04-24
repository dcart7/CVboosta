from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, OAuth2PasswordBearer
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
    validate_password_reset_token_for_user,
    verify_password,
)
from app.services.activity_logger import record_activity
from app.models.activity import ActivityLog
from app.services.emailer import build_password_reset_link, send_password_reset_email

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
optional_bearer = HTTPBearer(auto_error=False)


@router.post("/auth/register", response_model=AuthResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = User(
        email=payload.email.lower().strip(), 
        password_hash=hash_password(payload.password),
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
    return AuthResponse(access_token=token)


@router.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    record_activity(db, user_id=user.id, action="Signed in", meta={})
    token = create_access_token(user)
    return AuthResponse(access_token=token)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
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
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_bearer),
    db: Session = Depends(get_db),
) -> User | None:
    if not credentials or not credentials.credentials:
        return None
    try:
        payload = decode_access_token(credentials.credentials)
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
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if payload.current_password == payload.new_password:
        raise HTTPException(status_code=400, detail="New password must be different")
    current_user.password_hash = hash_password(payload.new_password)
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
    debug: dict[str, object] = {
        "user_found": False,
        "reset_link_ready": False,
        "email_sent": False,
        "error": None,
        "smtp_error": None,
    }
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user:
        if settings.password_reset_debug_response:
            return {**response, "debug": debug}
        return response
    debug["user_found"] = True

    try:
        token = create_password_reset_token(user)
        reset_link = build_password_reset_link(token)
        if not reset_link:
            debug["error"] = "reset_link_empty"
            print(
                "[password-reset] reset link is empty. Set PASSWORD_RESET_FRONTEND_URL or HTTPS CORS origin."
            )
            if settings.password_reset_debug_response:
                return {**response, "debug": debug}
            return response
        debug["reset_link_ready"] = True
        sent, smtp_error = send_password_reset_email(to_email=user.email, reset_link=reset_link)
        if sent:
            record_activity(db, user_id=user.id, action="Password reset requested", meta={})
            debug["email_sent"] = True
        else:
            debug["error"] = "smtp_send_failed"
            debug["smtp_error"] = smtp_error
            print(f"[password-reset] failed to send reset email to {user.email}")
    except Exception:
        # Keep response generic to avoid account/email leaks.
        debug["error"] = "unexpected_exception"
        print(f"[password-reset] unexpected error while preparing reset for {user.email}")
        if settings.password_reset_debug_response:
            return {**response, "debug": debug}
        return response
    if settings.password_reset_debug_response:
        return {**response, "debug": debug}
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

    if verify_password(payload.new_password, user.password_hash):
        raise HTTPException(status_code=400, detail="New password must be different.")

    user.password_hash = hash_password(payload.new_password)
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

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class OAuthLoginRequest(BaseModel):
    id_token: str | None = Field(default=None, min_length=20, max_length=8000)
    access_token: str | None = Field(default=None, min_length=20, max_length=8000)
    full_name: str | None = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: EmailStr | None = None


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None = None
    created_at: datetime


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=20, max_length=4000)
    new_password: str = Field(min_length=8, max_length=128)


class ActivityItem(BaseModel):
    action: str
    meta: dict | None = None
    created_at: datetime


class ActivityResponse(BaseModel):
    items: list[ActivityItem]

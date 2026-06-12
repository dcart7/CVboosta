import json
import os

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "production"
    database_url: str | None = None
    
    @field_validator("database_url", mode="before")
    @classmethod
    def fix_database_url(cls, v: str | None) -> str | None:
        if v:
            # Handle legacy Heroku-style URLs and ensure we use the standard driver
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql://", 1)
            # Remove +psycopg if it was accidentally added or provided
            if "postgresql+psycopg://" in v:
                return v.replace("postgresql+psycopg://", "postgresql://", 1)
        return v

    llm_provider: str = "gemini"
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"
    internal_api_key: str | None = None
    internal_allowed_cidrs: list[str] = Field(default_factory=list)
    max_cv_chars: int = 12000
    max_job_chars: int = 12000
    rate_limit_enabled: bool = True
    rate_limit_requests: int = 60
    rate_limit_window_seconds: int = 60
    auth_rate_limit_requests: int = 8
    auth_rate_limit_window_seconds: int = 300
    api_key_enabled: bool = False
    api_key: str | None = None
    request_logging_enabled: bool = False
    request_log_max_chars: int = 4000
    max_ats_keywords: int = 45
    keyword_crf_model_path: str = "ml/models/skill_crf.joblib"
    keyword_transformer_model_path: str = "ml/models/skill_bert"
    jwt_secret: str = Field(..., min_length=32)
    jwt_algorithm: str = "HS256"
    jwt_exp_minutes: int = 60 * 24 * 7
    analysis_encryption_key: str | None = None
    analysis_encryption_legacy_keys: list[str] = Field(default_factory=list)
    auth_cookie_name: str = "cvboosta_session"
    auth_cookie_secure: bool = True
    auth_cookie_samesite: str = "lax"
    auth_cookie_domain: str | None = None
    google_oauth_client_id: str | None = None
    apple_oauth_client_id: str | None = None
    apple_oauth_client_ids: list[str] = Field(default_factory=list)
    app_store_bundle_id: str = "com.cvboosta.app"
    apns_key_id: str | None = None
    apns_team_id: str | None = None
    apns_key_path: str | None = None
    apns_key_content: str | None = None
    apns_request_timeout_seconds: int = 10
    trusted_proxy_ips: list[str] = Field(default_factory=lambda: ["127.0.0.1", "::1"])
    trusted_proxy_cidrs: list[str] = Field(
        default_factory=lambda: [
            "127.0.0.0/8",
            "::1/128",
            "10.0.0.0/8",
            "172.16.0.0/12",
            "192.168.0.0/16",
            "fc00::/7",
        ]
    )
    paddle_webhook_secret: str | None = None
    paddle_price_single_scan: str | None = None
    paddle_price_go_weekly: str | None = None
    paddle_price_go_monthly: str | None = None
    paddle_price_pro_weekly: str | None = None
    paddle_price_pro_monthly: str | None = None
    paddle_price_lifetime: str | None = None
    stripe_secret_key: str | None = None
    stripe_webhook_secret: str | None = None
    stripe_product_id: str | None = None
    stripe_price_single_scan: str | None = None
    stripe_price_go_weekly: str | None = None
    stripe_price_go_monthly: str | None = None
    stripe_price_pro_weekly: str | None = None
    stripe_price_pro_monthly: str | None = None
    stripe_price_lifetime: str | None = None
    password_reset_exp_minutes: int = 30
    password_reset_frontend_url: str | None = None
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_use_tls: bool = True
    smtp_use_ssl: bool = False
    smtp_from_email: str = "support@virelsolutions.com"

    model_config = SettingsConfigDict(
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator(
        "trusted_proxy_ips",
        "trusted_proxy_cidrs",
        "analysis_encryption_legacy_keys",
        "internal_allowed_cidrs",
        "apple_oauth_client_ids",
        mode="before",
    )
    @classmethod
    def parse_list_values(cls, v: object) -> list[str]:
        if v is None:
            return []
        if isinstance(v, list):
            return [str(item).strip() for item in v if str(item).strip()]
        if isinstance(v, str):
            raw = v.strip()
            if not raw:
                return []
            if raw.startswith("[") and raw.endswith("]"):
                try:
                    parsed = json.loads(raw)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if str(item).strip()]
                except Exception:
                    pass
            return [item.strip() for item in raw.split(",") if item.strip()]
        return []

    @field_validator("jwt_secret")
    @classmethod
    def validate_jwt_secret(cls, v: str) -> str:
        insecure_defaults = {
            "temporary_secret_for_deployment_change_me",
            "change_me",
            "secret",
            "jwt_secret",
            "default",
        }
        value = (v or "").strip()
        if len(value) < 32:
            raise ValueError("JWT_SECRET must be at least 32 characters.")
        if value.lower() in insecure_defaults:
            raise ValueError("JWT_SECRET uses an insecure default value.")
        return value


def get_cors_origins() -> list[str]:
    """
    Safely load CORS origins directly from environment variables,
    bypassing Pydantic's aggressive JSON parsing.
    """
    v = os.getenv("CORS_ORIGINS", "")

    default_allowed = [
        "https://cvboosta.com",
        "https://www.cvboosta.com",
        "https://cv-ai-optimizer-eta.vercel.app",
    ]
    if settings.app_env.lower() in {"local", "dev", "development", "test"}:
        default_allowed.extend(
            [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:8000",
            ]
        )

    if not v or v.strip() == "*":
        return default_allowed
        
    # Handle both comma-separated strings and JSON arrays
    if v.startswith("[") and v.endswith("]"):
        try:
            return json.loads(v)
        except Exception:
            pass
            
    return [i.strip() for i in v.split(",") if i.strip()]


settings = Settings()

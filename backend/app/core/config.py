import os
from typing import Any
from pathlib import Path

from pydantic import field_validator, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str | None = None
    
    @field_validator("database_url", mode="before")
    @classmethod
    def fix_database_url(cls, v: str | None) -> str | None:
        if v:
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql+psycopg://", 1)
            if v.startswith("postgresql://"):
                return v.replace("postgresql://", "postgresql+psycopg://", 1)
        return v

    llm_provider: str = "gemini"
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"
    max_cv_chars: int = 12000
    max_job_chars: int = 12000
    rate_limit_enabled: bool = True
    rate_limit_requests: int = 60
    rate_limit_window_seconds: int = 60
    api_key_enabled: bool = True
    api_key: str | None = None
    request_logging_enabled: bool = False
    request_log_max_chars: int = 4000
    max_ats_keywords: int = 45
    keyword_crf_model_path: str = "ml/models/skill_crf.joblib"
    keyword_transformer_model_path: str = "ml/models/skill_bert"
    jwt_secret: str = "temporary_secret_for_deployment_change_me"
    jwt_algorithm: str = "HS256"
    jwt_exp_minutes: int = 60 * 24 * 7
    paddle_webhook_secret: str | None = None

    model_config = SettingsConfigDict(
        env_file_encoding="utf-8",
        extra="ignore",
    )


def get_cors_origins() -> list[str]:
    """
    Safely load CORS origins directly from environment variables,
    bypassing Pydantic's aggressive JSON parsing.
    """
    import os
    import json
    v = os.getenv("CORS_ORIGINS", "*")
    
    # Explicitly include the user's current Vercel frontend in the allowed list
    default_allowed = [
        "https://cv-ai-optimizer-eta.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000"
    ]

    if not v or v.strip() == "*":
        return default_allowed
        
    # Handle both comma-separated strings and JSON arrays
    if v.startswith("[") and v.endswith("]"):
        try:
            return json.loads(v)
        except Exception:
            pass
            
    return [i.strip() for i in v.split(",") if i.strip()]


try:
    settings = Settings()
    print("DEBUG: Settings initialized successfully.")
except Exception as e:
    print(f"ERROR: Settings initialization failed: {e}")
    # Provide a minimal fallback to prevent import errors, though the app will likely fail on DB/API calls
    class FallbackSettings:
        def __getattr__(self, name: str) -> Any:
            return None
        def get_cors_origins(self) -> list[str]:
            return ["*"]
    settings = FallbackSettings()  # type: ignore

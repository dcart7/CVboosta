from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str | None = None
    
    @field_validator("database_url", mode="before")
    @classmethod
    def fix_database_url(cls, v: str | None) -> str | None:
        if v and v.startswith("postgresql://"):
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
    cors_origins: list[str] = ["*"]
    paddle_webhook_secret: str | None = None

    @field_validator("cors_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str) and not v.startswith("["):
            if v.strip() == "*":
                return ["*"]
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return ["*"]

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[3] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

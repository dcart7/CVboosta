from pydantic import BaseModel, Field, field_validator, model_validator


class MatchRequest(BaseModel):
    cv_text: str = Field(min_length=1, max_length=12000)
    job_text: str = Field(default="", max_length=12000)
    keywords: list[str] | None = None

    @field_validator("cv_text", mode="before")
    @classmethod
    def normalize_cv_text(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("must be a string")
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("must not be empty")
        return cleaned

    @field_validator("job_text", mode="before")
    @classmethod
    def normalize_job_text(cls, value: str) -> str:
        if value is None:
            return ""
        if not isinstance(value, str):
            raise ValueError("must be a string")
        return value.strip()

    @model_validator(mode="after")
    def require_job_or_keywords(self) -> "MatchRequest":
        has_job = bool((self.job_text or "").strip())
        has_keywords = bool(self.keywords and len(self.keywords) > 0)
        if not has_job and not has_keywords:
            raise ValueError("Provide either job_text or keywords.")
        return self


class MatchResponse(BaseModel):
    match_percent: int
    matched_keywords: list[str]
    missing_keywords: list[str]
    total_keywords: int
    feedback: str

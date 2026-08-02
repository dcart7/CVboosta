from pydantic import BaseModel, Field, field_validator


class AnalyzeCvRequest(BaseModel):
    cv_text: str = Field(min_length=1, max_length=12000)

    @field_validator("cv_text", mode="before")
    @classmethod
    def normalize_text(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("must be a string")
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("must not be empty")
        return cleaned


class AnalyzeCvResponse(BaseModel):
    cv_analysis: str
    feedback: str


class AnalyzeJobRequest(BaseModel):
    job_text: str = Field(min_length=1, max_length=12000)

    @field_validator("job_text", mode="before")
    @classmethod
    def normalize_text(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("must be a string")
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("must not be empty")
        return cleaned

class AnalyzeJobResponse(BaseModel):
    job_analysis: str
    feedback: str

class InterviewQuestion(BaseModel):
    question: str
    why: str
    tips: str

class InterviewPrepRequest(BaseModel):
    job_text: str = Field(min_length=1, max_length=12000)
    missing_keywords: list[str] = Field(default_factory=list, max_length=45)
    ui_language: str = Field(default="en", max_length=10)
    analysis_id: int | None = Field(default=None, ge=1)

    @field_validator("job_text", mode="before")
    @classmethod
    def normalize_job_text(cls, value: object) -> str:
        if not isinstance(value, str) or not value.strip():
            raise ValueError("must not be empty")
        return value.strip()

    @field_validator("missing_keywords")
    @classmethod
    def validate_missing_keywords(cls, values: list[str]) -> list[str]:
        normalized: list[str] = []
        for value in values:
            if not isinstance(value, str):
                raise ValueError("keywords must be strings")
            cleaned = value.strip()
            if not cleaned or len(cleaned) > 200:
                raise ValueError("each keyword must contain 1-200 characters")
            if cleaned not in normalized:
                normalized.append(cleaned)
        return normalized

    @field_validator("ui_language", mode="before")
    @classmethod
    def normalize_ui_language(cls, value: object) -> str:
        if not isinstance(value, str):
            return "en"
        v = value.strip().lower()
        if v in ("en", "uk", "pl", "sk", "es"):
            return v
        return "en"

class InterviewPrepResponse(BaseModel):
    questions: list[InterviewQuestion]
    feedback: str

from pydantic import BaseModel, Field, field_validator


class OptimizeRequest(BaseModel):
    cv_text: str = Field(min_length=1, max_length=12000)
    job_text: str = Field(min_length=1, max_length=12000)
    cv_analysis: str = Field(default="", max_length=20000)
    job_analysis: str = Field(default="", max_length=20000)
    target_role: str = Field(default="", max_length=200)
    target_company: str = Field(default="", max_length=200)

    @field_validator("cv_text", "job_text", mode="before")
    @classmethod
    def normalize_required_text(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("must be a string")
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("must not be empty")
        return cleaned

    @field_validator("cv_analysis", "job_analysis", "target_role", "target_company", mode="before")
    @classmethod
    def normalize_optional_text(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("must be a string")
        return value.strip()


class OptimizeResponse(BaseModel):
    optimized_cv: str
    feedback: str
    missing_skills: list[str]
    recommendations: list[str]
    match_before: int | None = None
    match_after: int | None = None

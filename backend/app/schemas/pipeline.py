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


class AnalyzeCvResponse(BaseModel):
    cv_analysis: str
    feedback: str


class AnalyzeJobResponse(BaseModel):
    job_analysis: str
    feedback: str

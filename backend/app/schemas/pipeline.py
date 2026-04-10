from pydantic import BaseModel, Field, field_validator


class AnalyzeCvRequest(BaseModel):
    cv_text: str = Field(min_length=1, max_length=20000)

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
    job_text: str = Field(min_length=1, max_length=20000)

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
    job_text: str
    missing_keywords: list[str]

class InterviewPrepResponse(BaseModel):
    questions: list[InterviewQuestion]
    feedback: str

from datetime import datetime

from pydantic import BaseModel


class HistoryItem(BaseModel):
    id: int
    role: str | None
    company: str | None
    score: int
    match_before: int | None = None
    match_after: int | None = None
    created_at: datetime


class HistoryResponse(BaseModel):
    items: list[HistoryItem]


class HistoryDetailResponse(BaseModel):
    id: int
    role: str | None
    company: str | None
    score: int
    created_at: datetime
    optimized_cv: str
    job_description: str
    missing_skills: list[str]
    added_keywords: list[str] = []
    recommendations: list[str]
    match_before: int | None
    match_after: int | None
    cover_letter: str | None = None
    interview_questions: list[dict] | None = None

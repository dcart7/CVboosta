from pydantic import BaseModel


class DemoOptimizeResponse(BaseModel):
    optimized_cv: str
    feedback: str
    missing_skills: list[str]
    added_keywords: list[str] = []
    recommendations: list[str]
    match_before: int | None = None
    match_after: int | None = None
    job_description: str
    target_role: str | None = None
    target_company: str | None = None


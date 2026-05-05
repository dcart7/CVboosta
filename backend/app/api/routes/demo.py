from fastapi import APIRouter, HTTPException, Depends
from starlette.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.demo import DemoOptimizeResponse
from app.services.llm import LLMServiceError, extract_job_keywords, generate_optimized_cv
from app.services.matching import compute_match_score
from app.services.recommendations import build_recommendations
from app.services.keyword_store import get_keyword_list_by_source_text, save_keyword_list
from app.services.keyword_fallback import extract_keywords_fallback
from app.services.keyword_crf import extract_keywords_crf
from app.services.keyword_transformer import extract_keywords_transformer
from app.services.keyword_clean import clean_job_text, normalize_keywords, extract_whitelist_keywords
from app.core.config import settings

router = APIRouter()

_DEMO_TARGET_ROLE = "Analytics Engineer"
_DEMO_TARGET_COMPANY = "SaaS (Demo)"

_DEMO_CV_TEXT = """
Alex Johnson

SUMMARY
Backend engineer with 5+ years building Python services, APIs, and analytics pipelines. Strong focus on reliability, performance, and clean architecture.

EXPERIENCE
Independent / Consulting Projects
Burnout Risk Tracker | Feb 2026 - Present | Remote
- Designed and developed a scalable backend system for monitoring employee burnout risk using Python 3.11+, Django, and Django REST Framework.
- Built analytics services to calculate dimension scores and a Burnout Index using moving averages.
- Implemented automated alerting with Celery and Redis for background tasks.
- Optimized performance via PostgreSQL query tuning and Redis caching.
- Containerized the backend using Docker and documented local dev workflow.

UtilityFlow | Dec 2025 - Feb 2026 | Remote
- Built REST APIs for managing utility services with Python, FastAPI, and PostgreSQL.

SKILLS
Python · Django · Django REST Framework · PostgreSQL · Redis · Celery · Docker · JWT · REST APIs
""".strip()

_DEMO_JOB_TEXT = """
Job Title: BI Engineer / Analytics Engineer

We are looking for a BI Engineer / Analytics Engineer to build a reliable analytics foundation.

Responsibilities
- Build and maintain ETL pipelines for analytics
- Own data quality, observability, and alerting for key datasets
- Build data models and curated analytics datasets for BI tools
- Partner with stakeholders to define KPIs and reporting

Requirements
- Strong SQL and data modeling
- Experience with modern warehouses (Snowflake preferred)
- Familiarity with monitoring/observability and incident response
- Python for automation
""".strip()


@router.get("/optimize", response_model=DemoOptimizeResponse)
async def demo_optimize(db: Session = Depends(get_db)) -> DemoOptimizeResponse:
    """
    Generates a real demo result using the same optimization pipeline, without requiring auth/usage.
    """
    try:
        cleaned_text = clean_job_text(_DEMO_JOB_TEXT)
        cached = get_keyword_list_by_source_text(db, _DEMO_JOB_TEXT)
        if cached:
            keyword_result = cached
            ats_keywords = normalize_keywords(
                extract_whitelist_keywords(cleaned_text, limit=settings.max_ats_keywords)
                + keyword_result.skills
                + keyword_result.requirements,
                limit=settings.max_ats_keywords,
            )
        else:
            try:
                keyword_result = extract_job_keywords(cleaned_text)
                ats_keywords = normalize_keywords(
                    extract_whitelist_keywords(cleaned_text, limit=settings.max_ats_keywords)
                    + keyword_result.skills
                    + keyword_result.requirements,
                    limit=settings.max_ats_keywords,
                )
            except LLMServiceError:
                keyword_result = extract_keywords_transformer(cleaned_text)
                if keyword_result and keyword_result.skills:
                    ats_keywords = normalize_keywords(
                        extract_whitelist_keywords(cleaned_text, limit=settings.max_ats_keywords)
                        + keyword_result.skills
                        + keyword_result.requirements,
                        limit=settings.max_ats_keywords,
                    )
                else:
                    keyword_result = extract_keywords_crf(cleaned_text)
                    if keyword_result and keyword_result.skills:
                        ats_keywords = normalize_keywords(
                            extract_whitelist_keywords(cleaned_text, limit=settings.max_ats_keywords)
                            + keyword_result.skills
                            + keyword_result.requirements,
                            limit=settings.max_ats_keywords,
                        )
                    else:
                        keyword_result = extract_keywords_fallback(cleaned_text)
                        ats_keywords = normalize_keywords(
                            extract_whitelist_keywords(cleaned_text, limit=settings.max_ats_keywords)
                            + keyword_result.skills
                            + keyword_result.requirements,
                            limit=settings.max_ats_keywords,
                        )
            save_keyword_list(
                db=db,
                source_text=_DEMO_JOB_TEXT,
                skills=normalize_keywords(keyword_result.skills),
                requirements=normalize_keywords(keyword_result.requirements),
            )

        result = await run_in_threadpool(
            generate_optimized_cv,
            _DEMO_CV_TEXT,
            _DEMO_JOB_TEXT,
            "",
            "",
            ats_keywords,
            _DEMO_TARGET_ROLE,
            _DEMO_TARGET_COMPANY,
            None,
        )

        match_before, _, original_missing = await run_in_threadpool(
            compute_match_score, _DEMO_CV_TEXT, ats_keywords
        )
        match_after, _, missing_skills = await run_in_threadpool(
            compute_match_score, result.optimized_cv, ats_keywords
        )
        added_keywords = list(set(original_missing) - set(missing_skills))
        recommendations = await run_in_threadpool(build_recommendations, missing_skills)
    except LLMServiceError:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to generate demo result") from exc

    return DemoOptimizeResponse(
        optimized_cv=result.optimized_cv,
        feedback=result.feedback,
        missing_skills=missing_skills,
        added_keywords=added_keywords,
        recommendations=recommendations,
        match_before=match_before,
        match_after=match_after,
        job_description=_DEMO_JOB_TEXT,
        target_role=_DEMO_TARGET_ROLE,
        target_company=_DEMO_TARGET_COMPANY,
    )


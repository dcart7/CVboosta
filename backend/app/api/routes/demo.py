from fastapi import APIRouter

from app.schemas.demo import DemoOptimizeResponse
from app.services.matching import compute_match_score
from app.services.recommendations import build_recommendations


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

# The public demo input never changes, so invoking a paid/non-deterministic LLM
# for every anonymous GET adds cost, latency and an easy denial-of-wallet path.
# This reviewed example is deliberately honest: it reorganizes capabilities
# already present in the source CV and explicitly leaves Snowflake as a gap.
_DEMO_OPTIMIZED_CV_TEXT = """
Alex Johnson

ANALYTICS-FOCUSED BACKEND ENGINEER

SUMMARY
Backend engineer with 5+ years building Python services, SQL-backed APIs, ETL-style analytics pipelines, and monitoring workflows. Experienced with PostgreSQL performance, automated alerting, reliable data processing, and clean architecture.

RELEVANT EXPERIENCE
Independent / Consulting Projects
Burnout Risk Tracker | Feb 2026 - Present | Remote
- Designed a scalable Python and Django REST backend for monitoring employee burnout risk.
- Built analytics data models and pipelines that calculate dimension scores and a Burnout Index using moving averages.
- Implemented monitoring and automated alerting workflows with Celery and Redis.
- Improved PostgreSQL query performance and used Redis caching for reliable analytics processing.
- Containerized the service with Docker and documented the local development workflow.

UtilityFlow | Dec 2025 - Feb 2026 | Remote
- Built Python and FastAPI REST APIs backed by PostgreSQL for managing utility-service data.

SKILLS
Python · SQL · PostgreSQL · Analytics pipelines · ETL · Data modeling · Monitoring · Alerting · Django · Django REST Framework · FastAPI · Redis · Celery · Docker · REST APIs
""".strip()

_DEMO_ATS_KEYWORDS = [
    "SQL",
    "data modeling",
    "ETL pipelines",
    "data quality",
    "observability",
    "alerting",
    "analytics datasets",
    "BI tools",
    "KPIs",
    "Snowflake",
    "Python",
    "incident response",
]

_MATCH_BEFORE, _, _ORIGINAL_MISSING = compute_match_score(_DEMO_CV_TEXT, _DEMO_ATS_KEYWORDS)
_MATCH_AFTER, _, _MISSING_SKILLS = compute_match_score(
    _DEMO_OPTIMIZED_CV_TEXT,
    _DEMO_ATS_KEYWORDS,
)
_MISSING_NORMALIZED = {item.casefold() for item in _MISSING_SKILLS}
_ADDED_KEYWORDS = [
    item for item in _ORIGINAL_MISSING if item.casefold() not in _MISSING_NORMALIZED
]

_DEMO_RESPONSE = DemoOptimizeResponse(
    optimized_cv=_DEMO_OPTIMIZED_CV_TEXT,
    feedback=(
        "The demo rewrite foregrounds relevant analytics experience and ATS terminology "
        "without inventing Snowflake, BI-tool, KPI ownership, or incident-response experience."
    ),
    missing_skills=_MISSING_SKILLS,
    added_keywords=_ADDED_KEYWORDS,
    recommendations=build_recommendations(_MISSING_SKILLS),
    match_before=_MATCH_BEFORE,
    match_after=_MATCH_AFTER,
    job_description=_DEMO_JOB_TEXT,
    target_role=_DEMO_TARGET_ROLE,
    target_company=_DEMO_TARGET_COMPANY,
)


@router.get("/optimize", response_model=DemoOptimizeResponse)
def demo_optimize() -> DemoOptimizeResponse:
    """Return a deterministic, pre-reviewed demo with no external AI call."""
    return _DEMO_RESPONSE.model_copy(deep=True)


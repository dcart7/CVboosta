from fastapi import APIRouter, Depends
from starlette.concurrency import run_in_threadpool

from app.core.internal_auth import require_internal_api_key
from app.core.config import settings
from app.schemas.optimize import OptimizeRequest, OptimizeResponse
from app.services.keyword_clean import clean_job_text, extract_whitelist_keywords, normalize_keywords
from app.services.keyword_crf import extract_keywords_crf
from app.services.keyword_fallback import extract_keywords_fallback
from app.services.keyword_transformer import extract_keywords_transformer
from app.services.llm import LLMServiceError, extract_job_keywords, generate_optimized_cv
from app.services.matching import compute_match_score
from app.services.recommendations import build_recommendations

router = APIRouter(dependencies=[Depends(require_internal_api_key)])


@router.get("/health")
def internal_health() -> dict:
    return {"status": "ok", "service": "cvboosta-ai-core"}


@router.post("/optimize", response_model=OptimizeResponse)
async def internal_optimize_cv(payload: OptimizeRequest) -> OptimizeResponse:
    cleaned_text = clean_job_text(payload.job_text)

    try:
        keyword_result = extract_job_keywords(cleaned_text)
    except LLMServiceError:
        keyword_result = extract_keywords_transformer(cleaned_text)
        if not keyword_result or not keyword_result.skills:
            keyword_result = extract_keywords_crf(cleaned_text)
            if not keyword_result or not keyword_result.skills:
                keyword_result = extract_keywords_fallback(cleaned_text)

    ats_keywords = normalize_keywords(
        extract_whitelist_keywords(cleaned_text, limit=settings.max_ats_keywords)
        + (keyword_result.skills or [])
        + (keyword_result.requirements or []),
        limit=settings.max_ats_keywords,
    )

    result = await run_in_threadpool(
        generate_optimized_cv,
        payload.cv_text,
        payload.job_text,
        payload.cv_analysis or None,
        payload.job_analysis or None,
        ats_keywords,
        payload.target_role or None,
        payload.target_company or None,
        None,  # forced_keywords
    )

    match_before, _, original_missing = await run_in_threadpool(compute_match_score, payload.cv_text, ats_keywords)
    match_after, _, missing_skills = await run_in_threadpool(compute_match_score, result.optimized_cv, ats_keywords)
    added_keywords = list(set(original_missing) - set(missing_skills))
    recommendations = await run_in_threadpool(build_recommendations, missing_skills)

    return OptimizeResponse(
        optimized_cv=result.optimized_cv,
        feedback=result.feedback,
        missing_skills=missing_skills,
        added_keywords=added_keywords,
        recommendations=recommendations,
        match_before=match_before,
        match_after=match_after,
        analysis_id=None,
    )


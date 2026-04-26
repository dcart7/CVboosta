from fastapi import APIRouter, HTTPException, Depends
from starlette.concurrency import run_in_threadpool

from app.schemas.optimize import (
    CoverLetterRequest,
    CoverLetterResponse,
    OptimizeRequest,
    OptimizeResponse,
)
from app.services.llm import (
    LLMServiceError,
    extract_job_keywords,
    generate_cover_letter,
    generate_optimized_cv,
)
from app.services.matching import compute_match_score
from app.services.recommendations import build_recommendations
from app.services.keyword_store import get_keyword_list_by_source_text, save_keyword_list
from app.services.keyword_fallback import extract_keywords_fallback
from app.services.keyword_crf import extract_keywords_crf
from app.services.keyword_transformer import extract_keywords_transformer
from app.services.keyword_clean import (
    clean_job_text,
    normalize_keywords,
    extract_whitelist_keywords,
)
from app.core.config import settings
from app.api.routes.auth import get_current_user_optional
from app.services.activity_logger import record_activity
from app.services.fair_use import enforce_fair_use_or_raise
from app.services.analysis_crypto import (
    encrypt_text_for_user,
)
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.models.analysis import Analysis
from app.models.user import User

router = APIRouter()


@router.post("", response_model=OptimizeResponse)
async def optimize_cv(
    payload: OptimizeRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional),
) -> OptimizeResponse:
    if current_user:
        enforce_fair_use_or_raise(db, current_user)
        if not current_user.can_use("scan"):
            raise HTTPException(status_code=402, detail="Daily scan limit reached. Please upgrade your plan.")
    else:
        # For guests, we could either block or allow 1 based on IP, 
        # but for now let's require login for optimization or treat as free with 0 scans allowed if not logged in.
        # Actually, let's just enforce that optimization requires login for tracking.
        raise HTTPException(status_code=401, detail="Authentication required to optimize CV.")

    try:
        cleaned_text = clean_job_text(payload.job_text)
        cached = get_keyword_list_by_source_text(db, payload.job_text)
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
                source_text=payload.job_text,
                skills=normalize_keywords(keyword_result.skills),
                requirements=normalize_keywords(keyword_result.requirements),
            )
        result = await run_in_threadpool(
            generate_optimized_cv,
            payload.cv_text,
            payload.job_text,
            payload.cv_analysis,
            payload.job_analysis,
            ats_keywords,
            payload.target_role,
            payload.target_company,
            None  # initial forced_keywords
        )
        match_before, _, original_missing = await run_in_threadpool(compute_match_score, payload.cv_text, ats_keywords)
        match_after, _, missing_skills = await run_in_threadpool(compute_match_score, result.optimized_cv, ats_keywords)
        
        added_keywords = list(set(original_missing) - set(missing_skills))


        recommendations = await run_in_threadpool(build_recommendations, missing_skills)
    except LLMServiceError:
        raise
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Unexpected server error") from exc

    if current_user:
        analysis = Analysis(
            user_id=current_user.id,
            # Do not persist plaintext CV/JD in columns.
            original_cv="",
            job_description="",
            score=match_after,
            result_json={
                "optimized_cv_enc": encrypt_text_for_user(current_user.id, result.optimized_cv),
                "job_description_enc": encrypt_text_for_user(current_user.id, payload.job_text),
                "missing_skills": missing_skills,
                "added_keywords": added_keywords,
                "recommendations": recommendations,
                "role": payload.target_role or None,
                "company": payload.target_company or None,
                "match_before": match_before,
                "match_after": match_after,
            },
        )
        if current_user.subscription_tier == "single":
            current_user.daily_scans_count = max(0, current_user.daily_scans_count - 1)
        else:
            current_user.daily_scans_count += 1
        db.add(current_user)
        db.add(analysis)
        db.commit()
        record_activity(db, user_id=current_user.id, action="CV optimized", meta={})
    return OptimizeResponse(
        optimized_cv=result.optimized_cv,
        feedback=result.feedback,
        missing_skills=missing_skills,
        added_keywords=added_keywords,
        recommendations=recommendations,
        match_before=match_before,
        match_after=match_after,
        analysis_id=analysis.id if current_user else None,
    )


@router.post("/cover-letter", response_model=CoverLetterResponse)
def optimize_cover_letter(
    payload: CoverLetterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
) -> CoverLetterResponse:
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required.")

    enforce_fair_use_or_raise(db, current_user)
    if not current_user.can_use("cl"):
        raise HTTPException(status_code=402, detail="Daily Cover Letter limit reached. Please upgrade your plan.")

    try:
        content = generate_cover_letter(
            cv_text=payload.cv_text,
            job_text=payload.job_text,
            ui_language=payload.ui_language,
        )
    except LLMServiceError:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to generate cover letter") from exc

    if current_user:
        if payload.analysis_id:
            from sqlalchemy.orm.attributes import flag_modified
            analysis = db.query(Analysis).filter(
                Analysis.id == payload.analysis_id,
                Analysis.user_id == current_user.id
            ).first()
            if analysis:
                new_result = dict(analysis.result_json or {})
                new_result["cover_letter_enc"] = encrypt_text_for_user(current_user.id, content)
                analysis.result_json = new_result
                flag_modified(analysis, "result_json")
                db.add(analysis)
                db.commit()
        
        if current_user.subscription_tier == "single":
            current_user.daily_cl_count = max(0, current_user.daily_cl_count - 1)
        else:
            current_user.daily_cl_count += 1
        db.add(current_user)
        db.commit()
        record_activity(db, user_id=current_user.id, action="Cover letter generated", meta={"analysis_id": payload.analysis_id})

    return CoverLetterResponse(content=content)

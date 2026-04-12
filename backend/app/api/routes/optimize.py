from fastapi import APIRouter, HTTPException, Depends

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
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.models.analysis import Analysis

router = APIRouter()


@router.post("/optimize", response_model=OptimizeResponse)
def optimize_cv(
    payload: OptimizeRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional),
) -> OptimizeResponse:
    if current_user:
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
        result = generate_optimized_cv(
            cv_text=payload.cv_text,
            job_text=payload.job_text,
            cv_analysis=payload.cv_analysis,
            job_analysis=payload.job_analysis,
            ats_keywords=ats_keywords,
            target_role=payload.target_role,
            target_company=payload.target_company,
        )
        _, _, missing_skills = compute_match_score(payload.cv_text, ats_keywords)
        recommendations = build_recommendations(missing_skills)
        match_before, _, _ = compute_match_score(payload.cv_text, ats_keywords)
        match_after, _, _ = compute_match_score(result.optimized_cv, ats_keywords)
    except LLMServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Unexpected server error") from exc

    if current_user:
        analysis = Analysis(
            user_id=current_user.id,
            original_cv=payload.cv_text,
            job_description=payload.job_text,
            score=match_after,
            result_json={
                "optimized_cv": result.optimized_cv,
                "missing_skills": missing_skills,
                "recommendations": recommendations,
                "role": payload.target_role or None,
                "company": payload.target_company or None,
                "match_before": match_before,
                "match_after": match_after,
            },
        )
        current_user.daily_scans_count += 1
        db.add(current_user)
        db.add(analysis)
        db.commit()
        record_activity(db, user_id=current_user.id, action="CV optimized", meta={})
    return OptimizeResponse(
        optimized_cv=result.optimized_cv,
        feedback=result.feedback,
        missing_skills=missing_skills,
        recommendations=recommendations,
        match_before=match_before,
        match_after=match_after,
    )


@router.post("/cover-letter", response_model=CoverLetterResponse)
def optimize_cover_letter(
    payload: OptimizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
) -> CoverLetterResponse:
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required.")
    
    if not current_user.can_use("cl"):
        raise HTTPException(status_code=402, detail="Daily Cover Letter limit reached. Please upgrade your plan.")

    try:
        content = generate_cover_letter(
            cv_text=payload.cv_text,
            job_text=payload.job_text,
            ui_language=payload.ui_language,
        )
    except LLMServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to generate cover letter") from exc

    if current_user:
        if payload.analysis_id:
            from sqlalchemy import copy
            # Update the analysis record with the cover letter
            analysis = db.query(Analysis).filter(
                Analysis.id == payload.analysis_id, 
                Analysis.user_id == current_user.id
            ).first()
            if analysis:
                new_result = dict(analysis.result_json or {})
                new_result["cover_letter"] = content
                analysis.result_json = new_result
                db.add(analysis)
                db.commit()
        
        current_user.daily_cl_count += 1
        db.add(current_user)
        db.commit()
        record_activity(db, user_id=current_user.id, action="Cover letter generated", meta={"analysis_id": payload.analysis_id})

    return CoverLetterResponse(content=content)

from fastapi import APIRouter, HTTPException, Depends

from app.schemas.optimize import OptimizeRequest, OptimizeResponse
from app.services.llm import LLMServiceError, extract_job_keywords, generate_optimized_cv
from app.services.matching import compute_match_score
from app.services.recommendations import build_recommendations
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
    try:
        keyword_result = extract_job_keywords(payload.job_text)
        ats_keywords = keyword_result.skills + keyword_result.requirements
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

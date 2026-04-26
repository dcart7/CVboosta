from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.db.session import get_db
from app.models.analysis import Analysis
from app.schemas.history import HistoryItem, HistoryResponse, HistoryDetailResponse
from app.services.analysis_crypto import decrypt_json_for_user, decrypt_text_for_user

router = APIRouter()


@router.get("/history", response_model=HistoryResponse)
def history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> HistoryResponse:
    rows = (
        db.query(Analysis)
        .filter(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .limit(20)
        .all()
    )
    items = []
    for row in rows:
        result = row.result_json or {}
        items.append(
            HistoryItem(
                id=row.id,
                role=result.get("role"),
                company=result.get("company"),
                score=row.score,
                created_at=row.created_at,
            )
        )
    return HistoryResponse(items=items)


@router.get("/history/{item_id}", response_model=HistoryDetailResponse)
def get_history_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> HistoryDetailResponse:
    row = (
        db.query(Analysis)
        .filter(Analysis.id == item_id, Analysis.user_id == current_user.id)
        .first()
    )
    if not row:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="History item not found")

    result = row.result_json or {}
    optimized_cv = decrypt_text_for_user(current_user.id, result.get("optimized_cv_enc"))
    job_description = decrypt_text_for_user(current_user.id, result.get("job_description_enc"))
    cover_letter = decrypt_text_for_user(current_user.id, result.get("cover_letter_enc"))
    interview_questions = decrypt_json_for_user(current_user.id, result.get("interview_questions_enc"))

    if optimized_cv is None:
        optimized_cv = result.get("optimized_cv", "")
    if job_description is None:
        job_description = row.job_description or ""
    if cover_letter is None:
        cover_letter = result.get("cover_letter")
    if interview_questions is None:
        interview_questions = result.get("interview_questions")

    return HistoryDetailResponse(
        id=row.id,
        role=result.get("role"),
        company=result.get("company"),
        score=row.score,
        created_at=row.created_at,
        optimized_cv=optimized_cv or "",
        job_description=job_description or "",
        missing_skills=result.get("missing_skills", []),
        added_keywords=result.get("added_keywords", []),
        recommendations=result.get("recommendations", []),
        match_before=result.get("match_before"),
        match_after=result.get("match_after"),
        cover_letter=cover_letter,
        interview_questions=interview_questions,
    )

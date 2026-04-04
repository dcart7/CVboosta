from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.db.session import get_db
from app.models.analysis import Analysis
from app.schemas.history import HistoryItem, HistoryResponse

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

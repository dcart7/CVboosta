from __future__ import annotations

from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

from app.db.session import get_db
from app.models.request_log import RequestLog
from app.schemas.logging import LogSummaryResponse, PathCount, StatusCount

from app.api.routes.auth import get_current_user

router = APIRouter()


def _status_class(code: int) -> str:
    if 200 <= code < 300:
        return "2xx"
    if 300 <= code < 400:
        return "3xx"
    if 400 <= code < 500:
        return "4xx"
    if 500 <= code < 600:
        return "5xx"
    return "other"


@router.get("/logs/summary", response_model=LogSummaryResponse)
def logs_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> LogSummaryResponse:
    total_requests = db.query(func.count(RequestLog.id)).scalar() or 0
    unique_paths = db.query(func.count(func.distinct(RequestLog.path))).scalar() or 0
    avg_duration = db.query(func.avg(RequestLog.duration_ms)).scalar()
    latest_request_at = db.query(func.max(RequestLog.created_at)).scalar()

    path_rows = (
        db.query(RequestLog.path, func.count(RequestLog.id))
        .group_by(RequestLog.path)
        .order_by(func.count(RequestLog.id).desc())
        .limit(10)
        .all()
    )
    path_breakdown = [PathCount(path=row[0], count=row[1]) for row in path_rows]

    status_rows = (
        db.query(RequestLog.status_code, func.count(RequestLog.id))
        .group_by(RequestLog.status_code)
        .all()
    )
    status_counts: dict[str, int] = {}
    for status_code, count in status_rows:
        bucket = _status_class(int(status_code))
        status_counts[bucket] = status_counts.get(bucket, 0) + int(count)
    status_breakdown = [
        StatusCount(status_class=key, count=value)
        for key, value in sorted(status_counts.items())
    ]

    return LogSummaryResponse(
        total_requests=total_requests,
        unique_paths=unique_paths,
        avg_duration_ms=float(avg_duration) if avg_duration is not None else None,
        latest_request_at=latest_request_at,
        path_breakdown=path_breakdown,
        status_breakdown=status_breakdown,
    )

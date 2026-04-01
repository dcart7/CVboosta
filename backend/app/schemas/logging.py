from datetime import datetime

from pydantic import BaseModel


class PathCount(BaseModel):
    path: str
    count: int


class StatusCount(BaseModel):
    status_class: str
    count: int


class LogSummaryResponse(BaseModel):
    total_requests: int
    unique_paths: int
    avg_duration_ms: float | None
    latest_request_at: datetime | None
    path_breakdown: list[PathCount]
    status_breakdown: list[StatusCount]

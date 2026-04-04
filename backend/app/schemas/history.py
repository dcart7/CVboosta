from datetime import datetime

from pydantic import BaseModel


class HistoryItem(BaseModel):
    id: int
    role: str | None
    company: str | None
    score: int
    created_at: datetime


class HistoryResponse(BaseModel):
    items: list[HistoryItem]

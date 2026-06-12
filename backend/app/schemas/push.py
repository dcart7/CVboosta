from __future__ import annotations

import re
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

_HEX_TOKEN_PATTERN = re.compile(r"^[0-9a-fA-F]{32,512}$")


class APNSDeviceRequest(BaseModel):
    token: str = Field(min_length=32, max_length=512)
    bundle_id: str = Field(min_length=3, max_length=255)
    apns_environment: Literal["sandbox", "production"] = "production"

    @field_validator("token")
    @classmethod
    def validate_token(cls, value: str) -> str:
        if not _HEX_TOKEN_PATTERN.fullmatch(value):
            raise ValueError("APNs token must be a hex string.")
        return value.lower()


class MessageResponse(BaseModel):
    message: str


class PushAlert(BaseModel):
    title: str = Field(min_length=1, max_length=178)
    body: str = Field(min_length=1, max_length=512)


class UserPushRequest(BaseModel):
    alert: PushAlert
    badge: int | None = Field(default=None, ge=0)
    sound: str | None = Field(default="default", max_length=64)
    data: dict[str, Any] = Field(default_factory=dict)
    collapse_id: str | None = Field(default=None, max_length=64)

    @field_validator("data")
    @classmethod
    def validate_data(cls, value: dict[str, Any]) -> dict[str, Any]:
        if "aps" in value:
            raise ValueError("Custom payload data cannot include the reserved 'aps' key.")
        return value


class PushDeliveryItem(BaseModel):
    token: str
    status: Literal["sent", "failed"]
    reason: str | None = None


class PushDeliveryResponse(BaseModel):
    requested: int
    sent: int
    failed: int
    deactivated: int
    results: list[PushDeliveryItem]

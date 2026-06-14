from __future__ import annotations

import re
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

_HEX_TOKEN_PATTERN = re.compile(r"^[0-9a-fA-F]{32,512}$")
LiveActivityMode = Literal[
    "atsOptimization",
    "tailoring",
    "interviewCountdown",
    "applicationStatus",
    "dailyStreak",
    "postInterviewReflection",
]


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


class LiveActivityTokenRequest(BaseModel):
    activity_id: str = Field(min_length=1, max_length=255)
    token: str = Field(min_length=32, max_length=512)
    bundle_id: str = Field(min_length=3, max_length=255)
    apns_environment: Literal["sandbox", "production"] = "production"
    mode: LiveActivityMode
    attributes_type: str = Field(default="CVBoostaActivityAttributes", min_length=1, max_length=128)

    @field_validator("token")
    @classmethod
    def validate_token(cls, value: str) -> str:
        if not _HEX_TOKEN_PATTERN.fullmatch(value):
            raise ValueError("Live Activity push token must be a hex string.")
        return value.lower()


class LiveActivityStartTokenRequest(BaseModel):
    token: str = Field(min_length=32, max_length=512)
    bundle_id: str = Field(min_length=3, max_length=255)
    apns_environment: Literal["sandbox", "production"] = "production"
    mode: LiveActivityMode
    attributes_type: str = Field(default="CVBoostaActivityAttributes", min_length=1, max_length=128)

    @field_validator("token")
    @classmethod
    def validate_token(cls, value: str) -> str:
        if not _HEX_TOKEN_PATTERN.fullmatch(value):
            raise ValueError("Live Activity push-to-start token must be a hex string.")
        return value.lower()


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


class LiveActivityContentState(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    mode: LiveActivityMode
    title: str = Field(min_length=1, max_length=128)
    detail: str = Field(min_length=1, max_length=255)
    progress: float = Field(default=0, ge=0, le=1)
    eta_text: str = Field(default="", max_length=120, alias="etaText")

    def to_apns_dict(self) -> dict[str, Any]:
        return {
            "mode": self.mode,
            "title": self.title,
            "detail": self.detail,
            "progress": self.progress,
            "etaText": self.eta_text,
        }


class LiveActivityEventRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    event: Literal["update", "end"] = "update"
    state: LiveActivityContentState
    alert: PushAlert | None = None
    priority: Literal[5, 10] = 10
    stale_date: int | None = Field(default=None, alias="staleDate")
    dismissal_date: int | None = Field(default=None, alias="dismissalDate")
    mode: LiveActivityMode | None = None


class LiveActivityStartRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    state: LiveActivityContentState
    activity_name: str = Field(default="CVBoosta Activity", min_length=1, max_length=128, alias="activityName")
    attributes_type: str = Field(default="CVBoostaActivityAttributes", min_length=1, max_length=128, alias="attributesType")
    alert: PushAlert | None = None
    priority: Literal[5, 10] = 10
    stale_date: int | None = Field(default=None, alias="staleDate")
    dismissal_date: int | None = Field(default=None, alias="dismissalDate")
    mode: LiveActivityMode | None = None


class LiveActivityDeliveryItem(BaseModel):
    activity_id: str
    token: str
    status: Literal["sent", "failed"]
    reason: str | None = None


class LiveActivityDeliveryResponse(BaseModel):
    requested: int
    sent: int
    failed: int
    deactivated: int
    results: list[LiveActivityDeliveryItem]

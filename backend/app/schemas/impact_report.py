
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


ImpactPriority = Literal["high", "medium", "low"]
ImpactStatus = Literal[
    "pending",
    "in_review",
    "completed",
    "dismissed",
]


class ImpactItemResponse(BaseModel):
    id: str
    document_id: str | None = None
    document_title: str
    department_name: str | None = None

    changed_fact: str | None = None
    previous_value: str | None = None
    new_value: str | None = None

    priority: ImpactPriority
    status: ImpactStatus
    score: float | None = Field(default=None, ge=0, le=1)
    explanation: str | None = None
    evidence_excerpt: str | None = None
    source_page: int | None = None
    suggested_action: str | None = None

    model_config = ConfigDict(extra="ignore")


class ImpactReportResponse(BaseModel):
    id: str
    source_document_id: str | None = None
    source_document_title: str
    status: str
    summary: str | None = None
    created_at: datetime | None = None
    item_count: int = 0
    high_priority_count: int = 0


class ImpactReportListResponse(BaseModel):
    items: list[ImpactReportResponse]
    total: int
    page: int
    page_size: int


class ImpactDecisionRequest(BaseModel):
    decision: Literal[
        "confirmed",
        "not_affected",
        "needs_information",
        "completed",
    ]
    comment: str | None = Field(default=None, max_length=2000)


from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


TaskPriority = Literal["high", "medium", "low"]

TaskStatus = Literal[
    "open",
    "in_progress",
    "blocked",
    "completed",
    "cancelled",
]


class ReviewTaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    impact_report_id: str | None = None
    document_id: str | None = None
    assigned_to: str | None = None
    priority: TaskPriority = "medium"
    due_date: datetime | None = None


class ReviewTaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    assigned_to: str | None = None
    priority: TaskPriority | None = None
    status: TaskStatus | None = None
    due_date: datetime | None = None


class ReviewTaskCommentCreate(BaseModel):
    comment: str = Field(min_length=1, max_length=2000)


class ReviewTaskListResponse(BaseModel):
    items: list[dict]
    total: int

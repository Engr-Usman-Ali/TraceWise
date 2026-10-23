
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client

from app.core.dependencies import get_current_user, require_owner
from app.db.supabase_client import get_supabase
from app.schemas.review_task import (
    ReviewTaskCreate,
    ReviewTaskUpdate,
    ReviewTaskCommentCreate,
)

router = APIRouter(prefix="/review-tasks", tags=["Review Tasks"])


def get_company_id(db: Client, user: dict) -> str:
    user_id = user.get("sub")

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid user token.")

    result = (
        db.table("profiles")
        .select("company_id")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )

    profile = result.data

    if not profile or not profile.get("company_id"):
        raise HTTPException(
            status_code=403,
            detail="No authorized company found.",
        )

    return str(profile["company_id"])


def ensure_task(db: Client, company_id: str, task_id: str) -> dict:
    try:
        UUID(task_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid task ID.")

    result = (
        db.table("review_tasks")
        .select("*")
        .eq("id", task_id)
        .eq("company_id", company_id)
        .maybe_single()
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Review task not found.")

    return result.data


def record_event(
    db: Client,
    company_id: str,
    user_id: str,
    task_id: str,
    event_type: str,
    details: dict,
) -> None:
    db.table("audit_events").insert({
        "company_id": company_id,
        "actor_id": user_id,
        "entity_type": "review_task",
        "entity_id": task_id,
        "event_type": event_type,
        "details": details,
    }).execute()


def ensure_company_member(
    db: Client,
    company_id: str,
    profile_id: str,
) -> None:
    try:
        UUID(profile_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid assignee ID.")

    result = (
        db.table("profiles")
        .select("id")
        .eq("id", profile_id)
        .eq("company_id", company_id)
        .maybe_single()
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=400,
            detail="The assignee must belong to your company.",
        )


@router.get("")
def list_review_tasks(
    status: str | None = Query(default=None),
    priority: str | None = Query(default=None),
    assigned_to: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Client = Depends(get_supabase),
    user: dict = Depends(require_owner),
):
    company_id = get_company_id(db, user)

    query = (
        db.table("review_tasks")
        .select("*", count="exact")
        .eq("company_id", company_id)
        .order("created_at", desc=True)
    )

    if status:
        query = query.eq("status", status)

    if priority:
        query = query.eq("priority", priority)

    if assigned_to:
        query = query.eq("assigned_to", assigned_to)

    start = (page - 1) * page_size
    result = query.range(start, start + page_size - 1).execute()

    return {
        "items": result.data or [],
        "total": result.count or 0,
        "page": page,
        "page_size": page_size,
    }


@router.post("", status_code=201)
def create_review_task(
    body: ReviewTaskCreate,
    db: Client = Depends(get_supabase),
    user: dict = Depends(require_owner),
):
    company_id = get_company_id(db, user)
    user_id = user["sub"]

    if body.assigned_to:
        ensure_company_member(db, company_id, body.assigned_to)

    if body.impact_report_id:
        report = (
            db.table("impact_reports")
            .select("id")
            .eq("id", body.impact_report_id)
            .eq("company_id", company_id)
            .maybe_single()
            .execute()
        )
        if not report.data:
            raise HTTPException(
                status_code=400,
                detail="Impact report not found in your company.",
            )

    if body.document_id:
        document = (
            db.table("documents")
            .select("id")
            .eq("id", body.document_id)
            .eq("company_id", company_id)
            .maybe_single()
            .execute()
        )
        if not document.data:
            raise HTTPException(
                status_code=400,
                detail="Document not found in your company.",
            )

    payload = body.model_dump(mode="json")
    payload["company_id"] = company_id
    payload["created_by"] = user_id

    result = db.table("review_tasks").insert(payload).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Could not create task.")

    task = result.data[0]

    record_event(
        db, company_id, user_id, task["id"],
        "task_created", {"title": task["title"]},
    )

    return task


@router.patch("/{task_id}")
def update_review_task(
    task_id: str,
    body: ReviewTaskUpdate,
    db: Client = Depends(get_supabase),
    user: dict = Depends(require_owner),
):
    company_id = get_company_id(db, user)
    user_id = user["sub"]
    existing = ensure_task(db, company_id, task_id)

    changes = body.model_dump(exclude_unset=True, mode="json")

    if "assigned_to" in changes and changes["assigned_to"]:
        ensure_company_member(db, company_id, changes["assigned_to"])

    if not changes:
        return existing

    if changes.get("status") == "completed":
        changes["completed_at"] = datetime.now(timezone.utc).isoformat()
    elif changes.get("status") and changes["status"] != "completed":
        changes["completed_at"] = None

    changes["updated_at"] = datetime.now(timezone.utc).isoformat()

    result = (
        db.table("review_tasks")
        .update(changes)
        .eq("id", task_id)
        .eq("company_id", company_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=500, detail="Could not update task.")

    updated = result.data[0]

    record_event(
        db, company_id, user_id, task_id,
        "task_updated",
        {"before": existing, "changes": changes},
    )

    return updated


@router.get("/{task_id}/comments")
def list_task_comments(
    task_id: str,
    db: Client = Depends(get_supabase),
    user: dict = Depends(require_owner),
):
    company_id = get_company_id(db, user)
    ensure_task(db, company_id, task_id)

    result = (
        db.table("review_task_comments")
        .select("*")
        .eq("company_id", company_id)
        .eq("task_id", task_id)
        .order("created_at")
        .execute()
    )

    return {"items": result.data or []}


@router.post("/{task_id}/comments", status_code=201)
def add_task_comment(
    task_id: str,
    body: ReviewTaskCommentCreate,
    db: Client = Depends(get_supabase),
    user: dict = Depends(require_owner),
):
    company_id = get_company_id(db, user)
    user_id = user["sub"]
    ensure_task(db, company_id, task_id)

    comment_text = body.comment.strip()
    if not comment_text:
        raise HTTPException(status_code=422, detail="Comment cannot be empty.")

    result = db.table("review_task_comments").insert({
        "company_id": company_id,
        "task_id": task_id,
        "author_id": user_id,
        "comment": comment_text,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Could not add comment.")

    record_event(
        db, company_id, user_id, task_id,
        "comment_added", {"comment_id": result.data[0]["id"]},
    )

    return result.data[0]


@router.get("/{task_id}/history")
def get_task_history(
    task_id: str,
    db: Client = Depends(get_supabase),
    user: dict = Depends(require_owner),
):
    company_id = get_company_id(db, user)
    ensure_task(db, company_id, task_id)

    result = (
        db.table("audit_events")
        .select("*")
        .eq("company_id", company_id)
        .eq("entity_type", "review_task")
        .eq("entity_id", task_id)
        .order("created_at", desc=True)
        .execute()
    )

    return {"items": result.data or []}

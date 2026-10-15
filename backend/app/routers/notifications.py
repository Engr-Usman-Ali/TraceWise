"""
Notifications:
  GET   /notifications/         list company notifications
  PATCH /notifications/{id}/read  mark one as read
  POST  /notifications/read-all   mark all as read
"""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.core.dependencies import require_owner
from app.db.supabase_client import get_supabase

router = APIRouter(prefix="/notifications", tags=["notifications"])


def _now():
    return datetime.now(timezone.utc).isoformat()


class NotificationOut(BaseModel):
    id: str
    company_id: str
    department_id: Optional[str]
    title: str
    message: str
    is_read: bool
    created_at: str


@router.get("/", response_model=list[NotificationOut])
async def list_notifications(current_user: dict = Depends(require_owner)):
    db = get_supabase()
    company_id = current_user["company_id"]
    res = db.table("notifications").select("*").eq("company_id", company_id).order("created_at", desc=True).limit(50).execute()
    return [NotificationOut(**n) for n in (res.data or [])]


@router.patch("/{notif_id}/read", status_code=204)
async def mark_read(notif_id: str, current_user: dict = Depends(require_owner)):
    db = get_supabase()
    company_id = current_user["company_id"]
    check = db.table("notifications").select("id").eq("id", notif_id).eq("company_id", company_id).execute()
    if not check.data:
        raise HTTPException(404, "Notification not found")
    db.table("notifications").update({"is_read": True}).eq("id", notif_id).execute()


@router.post("/read-all", status_code=204)
async def mark_all_read(current_user: dict = Depends(require_owner)):
    db = get_supabase()
    company_id = current_user["company_id"]
    db.table("notifications").update({"is_read": True}).eq("company_id", company_id).eq("is_read", False).execute()

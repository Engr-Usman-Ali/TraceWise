"""
Overview stats:
  GET /overview/stats   — counts and summary for owner dashboard
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.core.dependencies import require_owner
from app.db.supabase_client import get_supabase

router = APIRouter(prefix="/overview", tags=["overview"])


class OverviewStats(BaseModel):
    total_documents: int
    total_departments: int
    review_needed: int
    conflicts: int
    up_to_date: int


@router.get("/stats", response_model=OverviewStats)
async def get_stats(current_user: dict = Depends(require_owner)):
    db = get_supabase()
    company_id = current_user["company_id"]

    docs  = db.table("documents").select("status").eq("company_id", company_id).execute()
    depts = db.table("departments").select("id").eq("company_id", company_id).execute()

    all_docs    = docs.data or []
    total_docs  = len(all_docs)
    review      = sum(1 for d in all_docs if d["status"] == "review-needed")
    conflicts   = sum(1 for d in all_docs if d["status"] == "conflict")
    up_to_date  = sum(1 for d in all_docs if d["status"] == "up-to-date")
    total_depts = len(depts.data or [])

    return OverviewStats(
        total_documents=total_docs,
        total_departments=total_depts,
        review_needed=review,
        conflicts=conflicts,
        up_to_date=up_to_date,
    )

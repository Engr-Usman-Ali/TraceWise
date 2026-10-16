
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client

from app.db.supabase_client import get_supabase
from app.core.dependencies import get_current_user
from app.schemas.impact_report import (
    ImpactReportListResponse,
    ImpactReportResponse,
)

router = APIRouter(
    prefix="/impact-reports",
    tags=["Impact Reports"],
)


def get_authorized_company_id(
    supabase: Client,
    user: dict,
) -> str:
    """
    Resolve the authenticated user's company from the profiles table.
    Never trust a company ID supplied by the frontend.
    """
    user_id = user.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid authenticated user.",
        )

    profile_result = (
        supabase.table("profiles")
        .select("company_id")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )

    profile = profile_result.data

    if not profile or not profile.get("company_id"):
        raise HTTPException(
            status_code=403,
            detail="No authorized company found.",
        )

    return str(profile["company_id"])


@router.get("", response_model=ImpactReportListResponse)
def list_impact_reports(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    priority: str | None = Query(
        default=None,
        pattern="^(high|medium|low)$",
    ),
    status: str | None = Query(
        default=None,
        pattern="^(pending|in_review|completed|dismissed)$",
    ),
    supabase: Client = Depends(get_supabase),
    user: dict = Depends(get_current_user),
):
    """List impact reports belonging to the authenticated user's company."""

    company_id = get_authorized_company_id(supabase, user)

    query = (
        supabase.table("impact_reports")
        .select(
            """
            id,
            company_id,
            source_document_id,
            status,
            summary,
            created_at,
            documents!impact_reports_source_document_id_fkey(name)
            """,
            count="exact",
        )
        .eq("company_id", company_id)
        .order("created_at", desc=True)
    )

    if status:
        query = query.eq("status", status)

    start = (page - 1) * page_size

    result = (
        query
        .range(start, start + page_size - 1)
        .execute()
    )

    reports = []

    for row in result.data or []:
        source = row.get("documents") or {}

        items_result = (
            supabase.table("impact_items")
            .select("id, priority, status")
            .eq("impact_report_id", row["id"])
            .execute()
        )

        impact_items = items_result.data or []

        if priority:
            impact_items = [
                item
                for item in impact_items
                if item.get("priority") == priority
            ]

        reports.append(
            ImpactReportResponse(
                id=str(row["id"]),
                source_document_id=(
                    str(row["source_document_id"])
                    if row.get("source_document_id")
                    else None
                ),
                source_document_title=source.get(
                    "title",
                    "Untitled document",
                ),
                status=row.get("status", "pending"),
                summary=row.get("summary"),
                created_at=row.get("created_at"),
                item_count=len(impact_items),
                high_priority_count=sum(
                    item.get("priority") == "high"
                    for item in impact_items
                ),
            )
        )

    return ImpactReportListResponse(
        items=reports,
        total=result.count or 0,
        page=page,
        page_size=page_size,
    )


@router.get("/{report_id}")
def get_impact_report(
    report_id: str,
    supabase: Client = Depends(get_supabase),
    user: dict = Depends(get_current_user),
):
    """Return a report and its impact items for the user's company."""

    company_id = get_authorized_company_id(supabase, user)

    result = (
        supabase.table("impact_reports")
        .select("*")
        .eq("id", report_id)
        .eq("company_id", company_id)
        .maybe_single()
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Impact report not found.",
        )

    items_result = (
        supabase.table("impact_items")
        .select("*")
        .eq("impact_report_id", report_id)
        .execute()
    )

    return {
        "report": result.data,
        "items": items_result.data or [],
    }

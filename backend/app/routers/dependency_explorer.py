"""
Dependency Explorer routes.

GET    /dependency-explorer/graph
POST   /dependency-explorer/relationships
DELETE /dependency-explorer/relationships/{relationship_id}
"""

import uuid
from datetime import datetime, timezone
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field

from app.core.dependencies import require_owner
from app.db.supabase_client import get_supabase


router = APIRouter(
    prefix="/dependency-explorer",
    tags=["dependency-explorer"],
)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------
# Request schema
# ---------------------------------------------------------

class DependencyCreate(BaseModel):
    source_document_id: str
    target_document_id: str

    relationship_type: str = Field(
        default="references",
        min_length=1,
        max_length=100,
    )

    description: Optional[str] = Field(
        default=None,
        max_length=2000,
    )

    confidence: Optional[float] = Field(
        default=None,
        ge=0,
        le=1,
    )

    verification_status: Literal[
        "candidate",
        "verified",
        "rejected",
    ] = "candidate"


# ---------------------------------------------------------
# GET /dependency-explorer/graph
# Return company documents and their stored relationships.
# ---------------------------------------------------------

@router.get("/graph")
async def get_dependency_graph(
    current_user: dict = Depends(require_owner),
):
    db = get_supabase()
    company_id = current_user["company_id"]

    documents_result = (
        db.table("documents")
        .select(
            "id, name, status, department_id, created_at, updated_at"
        )
        .eq("company_id", company_id)
        .order("created_at", desc=True)
        .execute()
    )

    dependencies_result = (
        db.table("document_dependencies")
        .select(
            "id, source_document_id, target_document_id, "
            "relationship_type, description, confidence, "
            "verification_status, created_at"
        )
        .eq("company_id", company_id)
        .execute()
    )

    nodes = [
        {
            "id": document["id"],
            "name": document["name"],
            "status": document.get("status", "up-to-date"),
            "department_id": document.get("department_id"),
            "created_at": document.get("created_at"),
            "updated_at": document.get("updated_at"),
        }
        for document in (documents_result.data or [])
    ]

    edges = [
        {
            "id": dependency["id"],
            "source": dependency["source_document_id"],
            "target": dependency["target_document_id"],
            "relationship_type": dependency["relationship_type"],
            "description": dependency.get("description"),
            "confidence": dependency.get("confidence"),
            "verification_status": dependency["verification_status"],
            "created_at": dependency.get("created_at"),
        }
        for dependency in (dependencies_result.data or [])
    ]

    return {
        "nodes": nodes,
        "edges": edges,
        "total_documents": len(nodes),
        "total_relationships": len(edges),
    }


# ---------------------------------------------------------
# POST /dependency-explorer/relationships
# Create an explicit relationship between two company docs.
# ---------------------------------------------------------

@router.post("/relationships", status_code=201)
async def create_dependency(
    body: DependencyCreate,
    current_user: dict = Depends(require_owner),
):
    db = get_supabase()
    company_id = current_user["company_id"]
    user_id = current_user.get("sub")

    if body.source_document_id == body.target_document_id:
        raise HTTPException(
            status_code=400,
            detail="A document cannot depend on itself.",
        )

    # Both documents must belong to the owner's company.
    documents_result = (
        db.table("documents")
        .select("id")
        .eq("company_id", company_id)
        .in_(
            "id",
            [
                body.source_document_id,
                body.target_document_id,
            ],
        )
        .execute()
    )

    found_ids = {
        document["id"]
        for document in (documents_result.data or [])
    }

    if (
        body.source_document_id not in found_ids
        or body.target_document_id not in found_ids
    ):
        raise HTTPException(
            status_code=404,
            detail=(
                "Both documents must exist in your company workspace."
            ),
        )

    # Check for an existing relationship before inserting.
    existing = (
        db.table("document_dependencies")
        .select("id")
        .eq("company_id", company_id)
        .eq("source_document_id", body.source_document_id)
        .eq("target_document_id", body.target_document_id)
        .eq("relationship_type", body.relationship_type)
        .execute()
    )

    if existing.data:
        raise HTTPException(
            status_code=409,
            detail="This document relationship already exists.",
        )

    relationship_id = str(uuid.uuid4())

    row = {
        "id": relationship_id,
        "company_id": company_id,
        "source_document_id": body.source_document_id,
        "target_document_id": body.target_document_id,
        "relationship_type": body.relationship_type,
        "description": body.description,
        "confidence": body.confidence,
        "verification_status": body.verification_status,
        "created_by": user_id,
        "created_at": _now(),
    }

    result = (
        db.table("document_dependencies")
        .insert(row)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=500,
            detail="Failed to create document relationship.",
        )

    dependency = result.data[0]

    return {
        "id": dependency["id"],
        "source": dependency["source_document_id"],
        "target": dependency["target_document_id"],
        "relationship_type": dependency["relationship_type"],
        "description": dependency.get("description"),
        "confidence": dependency.get("confidence"),
        "verification_status": dependency["verification_status"],
        "created_at": dependency.get("created_at"),
    }


# ---------------------------------------------------------
# DELETE /dependency-explorer/relationships/{relationship_id}
# Delete a relationship belonging to the owner's company.
# ---------------------------------------------------------

@router.delete(
    "/relationships/{relationship_id}",
    status_code=204,
)
async def delete_dependency(
    relationship_id: str,
    current_user: dict = Depends(require_owner),
):
    db = get_supabase()
    company_id = current_user["company_id"]

    existing = (
        db.table("document_dependencies")
        .select("id")
        .eq("id", relationship_id)
        .eq("company_id", company_id)
        .execute()
    )

    if not existing.data:
        raise HTTPException(
            status_code=404,
            detail="Document relationship not found.",
        )

    (
        db.table("document_dependencies")
        .delete()
        .eq("id", relationship_id)
        .eq("company_id", company_id)
        .execute()
    )

    return Response(status_code=204)
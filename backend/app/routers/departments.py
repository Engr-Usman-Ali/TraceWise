"""
Department routes (owner only):
  POST /departments/         — create a department + set hashed login credential
  GET  /departments/         — list company's departments
  DELETE /departments/{id}   — delete a department
"""
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import hash_password
from app.core.dependencies import require_owner
from app.db.supabase_client import get_supabase
from app.schemas.auth import CreateDepartmentRequest, DepartmentOut

router = APIRouter(prefix="/departments", tags=["departments"])


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


@router.post("/", response_model=DepartmentOut, status_code=201)
async def create_department(
    body: CreateDepartmentRequest,
    current_user: dict = Depends(require_owner),
):
    db         = get_supabase()
    company_id = current_user["company_id"]

    # Enforce max 3 departments per company
    existing = db.table("departments").select("id").eq("company_id", company_id).execute()
    if len(existing.data or []) >= 3:
        raise HTTPException(status_code=400, detail="Maximum 3 departments per company")

    # Check slug uniqueness within company
    dup_slug = db.table("departments").select("id").eq("company_id", company_id).eq("slug", body.slug).execute()
    if dup_slug.data:
        raise HTTPException(status_code=409, detail=f"A '{body.slug}' department already exists for this company")

    # Check email uniqueness globally
    dup_email = db.table("departments").select("id").eq("login_email", body.login_email).execute()
    if dup_email.data:
        raise HTTPException(status_code=409, detail="This login email is already in use")

    # Hash the department login password (same bcrypt + salt as owner)
    hashed_pw = hash_password(body.login_password)

    dept_id = str(uuid.uuid4())
    row = {
        "id":                    dept_id,
        "company_id":            company_id,
        "name":                  body.name,
        "slug":                  body.slug,
        "login_email":           body.login_email,
        "login_password_hash":   hashed_pw,
        "created_at":            _now_iso(),
    }
    result = db.table("departments").insert(row).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create department")

    d = result.data[0]
    return DepartmentOut(
        id=d["id"],
        company_id=d["company_id"],
        name=d["name"],
        slug=d["slug"],
        login_email=d["login_email"],
        created_at=d["created_at"],
    )


@router.get("/", response_model=list[DepartmentOut])
async def list_departments(current_user: dict = Depends(require_owner)):
    db         = get_supabase()
    company_id = current_user["company_id"]
    result     = db.table("departments").select("*").eq("company_id", company_id).execute()
    return [
        DepartmentOut(
            id=d["id"], company_id=d["company_id"],
            name=d["name"], slug=d["slug"],
            login_email=d["login_email"], created_at=d["created_at"],
        )
        for d in (result.data or [])
    ]


@router.delete("/{dept_id}", status_code=204)
async def delete_department(
    dept_id: str,
    current_user: dict = Depends(require_owner),
):
    db         = get_supabase()
    company_id = current_user["company_id"]
    # Verify it belongs to this company
    check = db.table("departments").select("id").eq("id", dept_id).eq("company_id", company_id).execute()
    if not check.data:
        raise HTTPException(status_code=404, detail="Department not found")
    db.table("departments").delete().eq("id", dept_id).execute()

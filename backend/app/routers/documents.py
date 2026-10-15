"""
Documents routes (owner scoped to company):
  GET    /documents/           list all company documents
  POST   /documents/           create a document record
  PATCH  /documents/{id}       update status / name
  DELETE /documents/{id}       delete
"""
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.dependencies import require_owner, get_current_user
from app.db.supabase_client import get_supabase

router = APIRouter(prefix="/documents", tags=["documents"])


def _now():
    return datetime.now(timezone.utc).isoformat()


# ── Schemas ──────────────────────────────────────────────────
class DocumentCreate(BaseModel):
    name: str
    department_id: Optional[str] = None
    file_path: Optional[str] = None
    status: str = "up-to-date"


class DocumentUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    department_id: Optional[str] = None


class DocumentOut(BaseModel):
    id: str
    company_id: str
    department_id: Optional[str]
    name: str
    file_path: Optional[str]
    status: str
    created_by: Optional[str]
    updated_at: str
    created_at: str
    department_name: Optional[str] = None


# ── GET /documents/ ──────────────────────────────────────────
@router.get("/", response_model=list[DocumentOut])
async def list_documents(current_user: dict = Depends(require_owner)):
    db = get_supabase()
    company_id = current_user["company_id"]

    docs = db.table("documents").select("*").eq("company_id", company_id).order("created_at", desc=True).execute()

    # Fetch dept names in one query
    dept_ids = list({d["department_id"] for d in (docs.data or []) if d.get("department_id")})
    dept_map: dict = {}
    if dept_ids:
        depts = db.table("departments").select("id,name").in_("id", dept_ids).execute()
        dept_map = {d["id"]: d["name"] for d in (depts.data or [])}

    return [
        DocumentOut(
            id=d["id"], company_id=d["company_id"],
            department_id=d.get("department_id"), name=d["name"],
            file_path=d.get("file_path"), status=d["status"],
            created_by=d.get("created_by"),
            updated_at=d.get("updated_at", d.get("created_at", _now())),
            created_at=d.get("created_at", _now()),
            department_name=dept_map.get(d.get("department_id", ""), None),
        )
        for d in (docs.data or [])
    ]


# ── POST /documents/ ─────────────────────────────────────────
@router.post("/", response_model=DocumentOut, status_code=201)
async def create_document(body: DocumentCreate, current_user: dict = Depends(require_owner)):
    db = get_supabase()
    company_id = current_user["company_id"]
    user_id    = current_user["sub"]

    if body.status not in ("up-to-date", "review-needed", "conflict"):
        raise HTTPException(400, "Invalid status value")

    doc_id = str(uuid.uuid4())
    now    = _now()
    row = {
        "id":            doc_id,
        "company_id":    company_id,
        "department_id": body.department_id,
        "name":          body.name,
        "file_path":     body.file_path,
        "status":        body.status,
        "created_by":    user_id,
        "updated_at":    now,
        "created_at":    now,
    }
    res = db.table("documents").insert(row).execute()
    if not res.data:
        raise HTTPException(500, "Failed to create document")

    d = res.data[0]
    dept_name = None
    if d.get("department_id"):
        dept = db.table("departments").select("name").eq("id", d["department_id"]).single().execute()
        if dept.data:
            dept_name = dept.data["name"]

    return DocumentOut(**{**d, "department_name": dept_name,
                          "updated_at": d.get("updated_at", now),
                          "created_at": d.get("created_at", now)})


# ── PATCH /documents/{id} ────────────────────────────────────
@router.patch("/{doc_id}", response_model=DocumentOut)
async def update_document(doc_id: str, body: DocumentUpdate, current_user: dict = Depends(require_owner)):
    db = get_supabase()
    company_id = current_user["company_id"]

    check = db.table("documents").select("id").eq("id", doc_id).eq("company_id", company_id).execute()
    if not check.data:
        raise HTTPException(404, "Document not found")

    updates: dict = {"updated_at": _now()}
    if body.name is not None:         updates["name"]          = body.name
    if body.status is not None:       updates["status"]        = body.status
    if body.department_id is not None: updates["department_id"] = body.department_id

    res = db.table("documents").update(updates).eq("id", doc_id).execute()
    d   = res.data[0]

    dept_name = None
    if d.get("department_id"):
        dept = db.table("departments").select("name").eq("id", d["department_id"]).single().execute()
        if dept.data:
            dept_name = dept.data["name"]

    return DocumentOut(**{**d, "department_name": dept_name,
                          "updated_at": d.get("updated_at", _now()),
                          "created_at": d.get("created_at", _now())})


# ── DELETE /documents/{id} ───────────────────────────────────
@router.delete("/{doc_id}", status_code=204)
async def delete_document(doc_id: str, current_user: dict = Depends(require_owner)):
    db = get_supabase()
    company_id = current_user["company_id"]

    check = db.table("documents").select("id").eq("id", doc_id).eq("company_id", company_id).execute()
    if not check.data:
        raise HTTPException(404, "Document not found")

    db.table("documents").delete().eq("id", doc_id).execute()

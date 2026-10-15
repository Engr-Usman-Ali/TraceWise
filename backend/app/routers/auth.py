"""
Auth routes — works with the existing supabase/schema.sql
  profiles table  (linked to auth.users via Supabase Auth)
  companies table
  departments table (login_email + login_password_hash)
"""
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends
from jose import JWTError

from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
)
from app.db.supabase_client import get_supabase
from app.schemas.auth import (
    OwnerSignupRequest, LoginRequest, TokenResponse,
    RefreshRequest, UserProfileOut,
)
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


def _now():
    return datetime.now(timezone.utc).isoformat()


def _err(code: int, msg: str):
    raise HTTPException(status_code=code, detail=msg)


# ── POST /auth/signup ─────────────────────────────────────────────────────
@router.post("/signup", response_model=TokenResponse, status_code=201)
async def signup_owner(body: OwnerSignupRequest):
    db = get_supabase()

    # 1. Check duplicate email in profiles via Supabase Auth
    existing = db.table("profiles").select("id").eq("id",
        # we check by creating a Supabase auth user first
        "00000000-0000-0000-0000-000000000000"  # placeholder
    ).execute()

    # 2. Create user in Supabase Auth (this auto-creates the profile via trigger)
    auth_res = db.auth.sign_up({
        "email": body.email,
        "password": body.password,
        "options": {
            "data": {
                "full_name": body.full_name,
                "role": "owner",
            }
        }
    })

    if not auth_res.user:
        _err(400, "Signup failed — email may already be registered")

    uid = auth_res.user.id

    # 3. Store bcrypt hash in profiles (in addition to Supabase Auth password)
    #    This lets FastAPI verify independently without calling Supabase Auth each time
    hashed_pw = hash_password(body.password)
    db.table("profiles").update({
        "password_hash": hashed_pw,
        "full_name": body.full_name,
        "role": "owner",
    }).eq("id", uid).execute()

    # 4. Create company
    company_id = str(uuid.uuid4())
    co = db.table("companies").insert({
        "id": company_id,
        "name": body.company_name,
        "owner_id": uid,
        "created_at": _now(),
    }).execute()

    if not co.data:
        _err(500, "Failed to create company")

    # 5. Link profile → company
    db.table("profiles").update({
        "company_id": company_id
    }).eq("id", uid).execute()

    access  = create_access_token(uid, "owner", company_id)
    refresh = create_refresh_token(uid)

    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
        role="owner",
        redirect_to="/dashboard",
    )


# ── POST /auth/login ──────────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    db = get_supabase()

    # ── Try owner login via profiles table ──────────────────────────────
    prof_res = db.table("profiles").select("*").eq("email", body.email).execute()

    if prof_res.data:
        prof = prof_res.data[0]
        hashed = prof.get("password_hash", "")

        if not hashed:
            # Profile exists but no hash yet — verify via Supabase Auth
            auth_res = db.auth.sign_in_with_password({
                "email": body.email,
                "password": body.password,
            })
            if not auth_res.user:
                _err(401, "Invalid email or password")
            # Store hash for next time
            hashed = hash_password(body.password)
            db.table("profiles").update({"password_hash": hashed}).eq("id", prof["id"]).execute()
        else:
            if not verify_password(body.password, hashed):
                _err(401, "Invalid email or password")

        role       = prof.get("role", "owner")
        company_id = prof.get("company_id")
        dept_id    = prof.get("department_id")
        redirect   = "/dashboard" if role == "owner" else "/dept"

        access  = create_access_token(prof["id"], role, company_id, dept_id)
        refresh = create_refresh_token(prof["id"])
        return TokenResponse(
            access_token=access, refresh_token=refresh,
            role=role, redirect_to=redirect,
        )

    # ── Try department login via departments table ───────────────────────
    dept_res = db.table("departments").select("*").eq("login_email", body.email).execute()

    if not dept_res.data:
        _err(401, "Invalid email or password")

    dept = dept_res.data[0]
    hashed_dept = dept.get("login_password_hash", "")

    if not hashed_dept or not verify_password(body.password, hashed_dept):
        _err(401, "Invalid email or password")

    company_id = dept["company_id"]
    dept_id    = dept["id"]

    # Check if a profile already exists for this dept login
    existing_prof = db.table("profiles").select("id").eq("email", body.email).execute()

    if existing_prof.data:
        user_id = existing_prof.data[0]["id"]
    else:
        # Create a profile row for this dept member
        user_id = str(uuid.uuid4())
        db.table("profiles").insert({
            "id":              user_id,
            "email":           body.email,
            "password_hash":   hashed_dept,
            "full_name":       dept["name"],
            "role":            "department_member",
            "company_id":      company_id,
            "department_id":   dept_id,
            "created_at":      _now(),
        }).execute()

    access  = create_access_token(user_id, "department_member", company_id, dept_id)
    refresh = create_refresh_token(user_id)

    return TokenResponse(
        access_token=access, refresh_token=refresh,
        role="department_member", redirect_to="/dept",
    )


# ── POST /auth/refresh ────────────────────────────────────────────────────
@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(body: RefreshRequest):
    db = get_supabase()
    try:
        payload = decode_token(body.refresh_token)
        if payload.get("type") != "refresh":
            _err(401, "Invalid token type")
    except JWTError:
        _err(401, "Refresh token expired or invalid")

    uid  = payload["sub"]
    prof = db.table("profiles").select("*").eq("id", uid).single().execute()
    if not prof.data:
        _err(401, "User not found")

    p        = prof.data
    role     = p.get("role", "owner")
    c_id     = p.get("company_id")
    d_id     = p.get("department_id")
    redirect = "/dashboard" if role == "owner" else "/dept"

    access  = create_access_token(uid, role, c_id, d_id)
    refresh = create_refresh_token(uid)
    return TokenResponse(
        access_token=access, refresh_token=refresh,
        role=role, redirect_to=redirect,
    )


# ── GET /auth/me ──────────────────────────────────────────────────────────
@router.get("/me", response_model=UserProfileOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    db  = get_supabase()
    uid = current_user["sub"]

    prof = db.table("profiles").select("*").eq("id", uid).single().execute()
    if not prof.data:
        _err(404, "User not found")

    p            = prof.data
    company_name = None
    dept_name    = None

    if p.get("company_id"):
        co = db.table("companies").select("name").eq("id", p["company_id"]).single().execute()
        if co.data:
            company_name = co.data["name"]

    if p.get("department_id"):
        dept = db.table("departments").select("name").eq("id", p["department_id"]).single().execute()
        if dept.data:
            dept_name = dept.data["name"]

    return UserProfileOut(
        id=uid,
        full_name=p.get("full_name", ""),
        role=p.get("role", "owner"),
        company_id=p.get("company_id"),
        department_id=p.get("department_id"),
        company_name=company_name,
        department_name=dept_name,
    )
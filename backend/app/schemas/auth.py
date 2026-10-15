from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
import re


# ── Signup ──────────────────────────────────────────────────────────────────
class OwnerSignupRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    company_name: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number")
        return v

    @field_validator("full_name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Full name is required")
        return v.strip()

    @field_validator("company_name")
    @classmethod
    def company_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Company name is required")
        return v.strip()


# ── Login ───────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Token responses ─────────────────────────────────────────────────────────
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    redirect_to: str          # "/dashboard" or "/dept"


class RefreshRequest(BaseModel):
    refresh_token: str


# ── Department creation (owner only) ────────────────────────────────────────
class CreateDepartmentRequest(BaseModel):
    name: str
    slug: str
    login_email: EmailStr
    login_password: str

    @field_validator("slug")
    @classmethod
    def valid_slug(cls, v: str) -> str:
        if v not in ("sales", "marketing", "operations"):
            raise ValueError("slug must be one of: sales, marketing, operations")
        return v

    @field_validator("login_password")
    @classmethod
    def dept_password_min(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Department password must be at least 6 characters")
        return v


# ── Response models ──────────────────────────────────────────────────────────
class DepartmentOut(BaseModel):
    id: str
    company_id: str
    name: str
    slug: str
    login_email: str
    created_at: str


class UserProfileOut(BaseModel):
    id: str
    full_name: str
    role: str
    company_id: Optional[str]
    department_id: Optional[str]
    company_name: Optional[str] = None
    department_name: Optional[str] = None

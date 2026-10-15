"""
Security utilities:
  - bcrypt password hashing (salt auto-generated per hash by passlib)
  - JWT access + refresh token creation / verification
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

settings = get_settings()

# ── bcrypt context ──────────────────────────────────────────────────────────
# rounds=12  →  ~250ms per hash on modern hardware (good balance)
# passlib generates a unique random salt for every hash automatically;
# the salt is embedded in the resulting hash string (prefix $2b$12$<22-char-salt>)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def hash_password(plain: str) -> str:
    """
    Hash a plain-text password.

    Internally passlib:
      1. Generates a cryptographically random 16-byte salt
      2. Expands it to 22 base-64 chars
      3. Runs bcrypt with cost factor 12
      4. Returns the full MCF string:  $2b$12$<salt><digest>

    You store this whole string; the salt is already inside it.
    """
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """
    Constant-time comparison of plain password against stored bcrypt hash.
    The salt is extracted from the hash string automatically.
    """
    return pwd_context.verify(plain, hashed)


# ── JWT helpers ─────────────────────────────────────────────────────────────
def _make_token(data: dict, expires_delta: timedelta) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + expires_delta
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_access_token(user_id: str, role: str, company_id: Optional[str] = None, dept_id: Optional[str] = None) -> str:
    return _make_token(
        {"sub": user_id, "role": role, "company_id": company_id, "dept_id": dept_id, "type": "access"},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def create_refresh_token(user_id: str) -> str:
    return _make_token(
        {"sub": user_id, "type": "refresh"},
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )


def decode_token(token: str) -> dict:
    """
    Decode and validate a JWT.
    Raises JWTError if expired or tampered.
    """
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])

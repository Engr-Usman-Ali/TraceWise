"""
Supabase client using the SERVICE ROLE key.
The service role bypasses RLS — only use server-side, never expose to the browser.
"""
from functools import lru_cache
from supabase import create_client, Client
from app.core.config import get_settings


@lru_cache()
def get_supabase() -> Client:
    settings = get_settings()
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env"
        )
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

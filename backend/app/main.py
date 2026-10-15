from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, departments, documents, overview, notifications

app = FastAPI(
    title="TraceWise API",
    description="Backend API for TraceWise — Document Intelligence Platform",
    version="1.0.0",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
# In production, replace "*" with your frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(departments.router)
app.include_router(documents.router)
app.include_router(overview.router)
app.include_router(notifications.router)


@app.get("/", tags=["health"])
async def root():
    return {"status": "ok", "service": "TraceWise API v1.0"}


@app.get("/health", tags=["health"])
async def health():
    return {"status": "healthy"}

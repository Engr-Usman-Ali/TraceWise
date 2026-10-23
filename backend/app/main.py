
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    auth,
    departments,
    documents,
    overview,
    notifications,
)
from app.routers.impact_reports import router as impact_reports_router
from app.routers.review_tasks import router as review_tasks_router
from app.routers.dependency_explorer import (
    router as dependency_explorer_router,
)

app = FastAPI(
    title="TraceWise API",
    description="Backend API for TraceWise - Document Intelligence Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-frontend-domain.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Existing routers
app.include_router(auth.router)
app.include_router(departments.router)
app.include_router(documents.router)
app.include_router(overview.router)
app.include_router(notifications.router)

# Impact Reports router
app.include_router(impact_reports_router, prefix="/api")

# Dependency Explorer router
app.include_router(dependency_explorer_router, prefix="/api")

app.include_router(review_tasks_router, prefix="/api")

@app.get("/", tags=["health"])
async def root():
    return {
        "status": "ok",
        "service": "TraceWise API v1.0",
    }


@app.get("/health", tags=["health"])
async def health():
    return {"status": "healthy"}

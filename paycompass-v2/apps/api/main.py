"""
PayCompass API v2 - Main FastAPI application.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import health, upload

app = FastAPI(
    title="PayCompass API",
    version="2.0.0",
    description="EU Pay Transparency Platform API",
)

# CORS - tylko dla frontendu na localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rejestracja routerów
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(upload.router, prefix="/upload", tags=["upload"])


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint - weryfikacja działania API."""
    return {"message": "PayCompass API v2"}

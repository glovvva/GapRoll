"""
GapRoll API v2 - Main FastAPI application.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import analysis, health, upload

app = FastAPI(
    title="GapRoll API",
    version="2.0.0",
    description="GapRoll — API raportowania luk płacowych i zgodności z Dyrektywą UE 2023/970.",
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
app.include_router(analysis.router)


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint - weryfikacja działania API."""
    return {"message": "GapRoll API v2"}

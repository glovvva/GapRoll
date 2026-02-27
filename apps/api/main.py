"""
GapRoll API v2 - Main FastAPI application.
"""
from pathlib import Path

from dotenv import load_dotenv

# Load .env BEFORE any router/config imports so uvicorn sees env vars
_env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.requests import Request

from limiter import limiter
from routers import analysis, evg_override, health, partner, reports, root_cause, upload

app = FastAPI(
    title="GapRoll API",
    version="2.0.0",
    description="GapRoll — API raportowania luk płacowych i zgodności z Dyrektywą UE 2023/970.",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


# CORS - whitelist production + localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://gaproll.eu",
        "https://gaproll.pl",
        "https://gaproll.com",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rejestracja routerów
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(upload.router, prefix="/upload", tags=["upload"])
app.include_router(analysis.router)
app.include_router(evg_override.router)
app.include_router(partner.router)
app.include_router(root_cause.router)
app.include_router(reports.router)


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint - weryfikacja działania API."""
    return {"message": "GapRoll API v2"}

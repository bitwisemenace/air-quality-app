"""
main.py
-------
FastAPI application entrypoint for the AirSense NCR backend.

Run with:
    uvicorn main:app --reload

Docs available at:
    http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import current, forecast, locations

app = FastAPI(
    title="AirSense NCR API",
    description=(
        "Air Pollution–Weather Coupled Forecasting System for Delhi NCR. "
        "Currently serves mock/demo data. Designed so the mock prediction "
        "functions in services/mock_data.py can be swapped for a real ML "
        "model without changing this API's contract."
    ),
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# CORS — allow the local Vite dev server (and common alternates) to call this API
# ---------------------------------------------------------------------------
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(locations.router)
app.include_router(current.router)
app.include_router(forecast.router)


@app.get("/")
def root():
    return {
        "service": "AirSense NCR API",
        "status": "online",
        "docs": "/docs",
        "note": "All data is currently mock/demo data. See services/mock_data.py.",
    }


@app.get("/health")
def health():
    return {"status": "ok"}

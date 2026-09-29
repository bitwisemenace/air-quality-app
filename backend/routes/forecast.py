"""
routes/forecast.py
-------------------
GET /forecast/{location}?hours=72 -> hourly forecast records.

Uses the trained ML models with live inputs (services/ml_model.py).
If the models/ folder is missing or live data is unavailable, it falls back to
the mock forecast so the demo never breaks. The response says which one was
used in the "source" field ("model" or "mock").
"""

from fastapi import APIRouter, HTTPException, Query

from services.mock_data import (
    LOCATION_COORDINATES,
    generate_mock_forecast,
    get_model_status,
)

router = APIRouter(tags=["forecast"])


def _generate(location: str, hours: int):
    try:
        from services.ml_model import generate_ml_forecast
        return generate_ml_forecast(location, hours), "model"
    except Exception as exc:                       # no models, offline, bad data...
        print(f"[forecast] model unavailable ({exc}); using mock forecast")
        return generate_mock_forecast(location, hours), "mock"


@router.get("/forecast/{location}")
def forecast(
    location: str,
    hours: int = Query(default=72, ge=1, le=72, description="Number of hourly records to return (max 72)"),
):
    if location not in LOCATION_COORDINATES:
        raise HTTPException(status_code=404, detail=f"Unknown location: {location}")
    records, source = _generate(location, hours)
    return {"location": location, "source": source, "forecast": records}


@router.get("/forecast/model/status")
def model_status():
    """AI Model Status panel data."""
    return get_model_status()

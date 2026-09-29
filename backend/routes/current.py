"""
routes/current.py
------------------
GET /current/{location}          -> LIVE AQI + weather (falls back to mock if offline)
GET /current/{location}/coupling -> weather-pollution interaction panel (still mock)
GET /current/{location}/alerts   -> early-warning alerts (still mock)
"""

from fastapi import APIRouter, HTTPException

from services.live_data import get_live_current
from services.mock_data import (
    LOCATION_COORDINATES,
    get_alerts,
    get_current_conditions,
    get_weather_pollution_coupling,
)

router = APIRouter(tags=["current"])


@router.get("/current/{location}")
def current_conditions(location: str):
    if location not in LOCATION_COORDINATES:
        raise HTTPException(status_code=404, detail=f"Unknown location: {location}")
    try:
        return get_live_current(location)
    except Exception as exc:                       # offline, API down, missing data...
        print(f"[current] live data unavailable ({exc}); using mock data")
        data = get_current_conditions(location)
        data["source"] = "mock"
        return data


@router.get("/current/{location}/coupling")
def current_coupling(location: str):
    """Weather–Pollution Interaction section data."""
    try:
        return get_weather_pollution_coupling(location)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/current/{location}/alerts")
def current_alerts(location: str):
    """Early-warning alert panel data."""
    try:
        return {"location": location, "alerts": get_alerts(location)}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

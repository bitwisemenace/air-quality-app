"""
mock_data.py
------------
All mock/demo data generation lives here.

FUTURE ML INTEGRATION POINT
----------------------------
Right now, `generate_mock_forecast(location, hours)` fabricates realistic-looking
hourly pollutant + weather data. When the real model is ready, the ML team should
create a new function with the SAME return shape, e.g.:

    def generate_ml_forecast(location: str, hours: int) -> list[dict]:
        raw_predictions = ml_model.predict(location, hours)   # -> PM2.5, PM10, weather
        return format_predictions(raw_predictions)            # match this file's output shape

Then in `backend/routes/forecast.py`, swap the single line:

    from services.mock_data import generate_mock_forecast as generate_forecast
    # becomes
    from services.ml_model import generate_ml_forecast as generate_forecast

No other file needs to change. The AQI is always derived via services/aqi.py,
never invented directly, so ML only ever needs to output raw concentrations.
"""

import math
import random
from datetime import datetime, timedelta
from typing import Dict, List

from services.aqi import combined_aqi

# ---------------------------------------------------------------------------
# Static list of supported Delhi NCR monitoring locations
# ---------------------------------------------------------------------------

LOCATIONS: List[str] = [
    "Anand Vihar",
    "Connaught Place",
    "Dwarka",
    "Okhla Phase III",
    "Rohini",
    "IGI Airport",
]

# Base "current" conditions per location — deterministic seed values so the
# demo looks realistic and each location is visibly different.
_BASE_CONDITIONS: Dict[str, dict] = {
    "Anand Vihar": {
        "pm25": 168, "pm10": 245, "temperature": 18, "humidity": 72,
        "wind_speed": 4.2, "wind_direction": "NW",
        "pbl_height": 680, "inversion_strength": 0.78, "stubble_influence": 24,
    },
    "Connaught Place": {
        "pm25": 142, "pm10": 210, "temperature": 19, "humidity": 65,
        "wind_speed": 6.1, "wind_direction": "N",
        "pbl_height": 810, "inversion_strength": 0.58, "stubble_influence": 15,
    },
    "Dwarka": {
        "pm25": 155, "pm10": 228, "temperature": 18, "humidity": 68,
        "wind_speed": 5.0, "wind_direction": "NW",
        "pbl_height": 740, "inversion_strength": 0.66, "stubble_influence": 19,
    },
    "Okhla Phase III": {
        "pm25": 178, "pm10": 260, "temperature": 17, "humidity": 74,
        "wind_speed": 3.6, "wind_direction": "SW",
        "pbl_height": 610, "inversion_strength": 0.82, "stubble_influence": 21,
    },
    "Rohini": {
        "pm25": 190, "pm10": 275, "temperature": 17, "humidity": 76,
        "wind_speed": 3.1, "wind_direction": "W",
        "pbl_height": 570, "inversion_strength": 0.87, "stubble_influence": 31,
    },
    "IGI Airport": {
        "pm25": 130, "pm10": 198, "temperature": 19, "humidity": 60,
        "wind_speed": 7.4, "wind_direction": "N",
        "pbl_height": 890, "inversion_strength": 0.48, "stubble_influence": 12,
    },
}

WIND_DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]


def get_locations() -> List[str]:
    return LOCATIONS


def _validate_location(location: str) -> None:
    if location not in _BASE_CONDITIONS:
        raise ValueError(f"Unknown location: {location}")


def get_current_conditions(location: str) -> dict:
    """Return current mock snapshot for a location, with AQI derived from services/aqi.py."""
    _validate_location(location)
    base = _BASE_CONDITIONS[location]
    aqi_result = combined_aqi(base["pm25"], base["pm10"])

    return {
        "location": location,
        "aqi": aqi_result["aqi"],
        "category": aqi_result["category"],
        "pm25": base["pm25"],
        "pm10": base["pm10"],
        "temperature": base["temperature"],
        "humidity": base["humidity"],
        "wind_speed": base["wind_speed"],
        "wind_direction": base["wind_direction"],
        "pbl_height": base["pbl_height"],
        "inversion_strength": base["inversion_strength"],
        "stubble_influence": base["stubble_influence"],
    }


def generate_mock_forecast(location: str, hours: int = 72) -> List[dict]:
    """
    Generate `hours` worth of hourly mock forecast records for a location.

    Uses a smooth sinusoidal + random-walk pattern layered on top of the
    location's base PM2.5/PM10 so the chart looks like a believable diurnal
    pollution cycle (worse at night/early morning, better midday).

    THIS IS THE FUNCTION THE ML TEAM WILL EVENTUALLY REPLACE.
    Keep the return shape identical: a list of dicts with the keys below.
    """
    _validate_location(location)
    base = _BASE_CONDITIONS[location]
    hours = max(1, min(hours, 72))

    # Seed randomness deterministically per-location so refresh doesn't wildly
    # jump around during a demo, but still looks organic.
    rng = random.Random(hash(location) % (2**32))

    forecast = []
    start_time = datetime.now().replace(minute=0, second=0, microsecond=0)

    pm25_walk = base["pm25"]
    pm10_walk = base["pm10"]

    for h in range(hours):
        timestamp = start_time + timedelta(hours=h)

        # Diurnal cycle: pollution peaks late night/early morning, dips midday
        hour_of_day = timestamp.hour
        diurnal_factor = 1.0 + 0.18 * math.sin((hour_of_day - 6) / 24 * 2 * math.pi + math.pi)

        # Gentle random walk drift + diurnal shape, clamped to plausible bounds
        drift = rng.uniform(-4, 4)
        pm25_walk = max(15, min(480, pm25_walk * 0.9 + (base["pm25"] * diurnal_factor) * 0.1 + drift))
        pm10_walk = max(25, min(600, pm10_walk * 0.9 + (base["pm10"] * diurnal_factor) * 0.1 + drift * 1.3))

        aqi_result = combined_aqi(pm25_walk, pm10_walk)

        # Weather drifts gently too
        temp = round(base["temperature"] + 3 * math.sin((hour_of_day - 15) / 24 * 2 * math.pi) + rng.uniform(-0.5, 0.5), 1)
        humidity = max(30, min(95, round(base["humidity"] - 4 * math.sin((hour_of_day - 15) / 24 * 2 * math.pi) + rng.uniform(-2, 2))))
        wind_speed = round(max(0.5, base["wind_speed"] + rng.uniform(-1.0, 1.0)), 1)
        wind_direction = base["wind_direction"] if rng.random() > 0.15 else rng.choice(WIND_DIRECTIONS)

        forecast.append({
            "timestamp": timestamp.isoformat(),
            "pm25": round(pm25_walk, 1),
            "pm10": round(pm10_walk, 1),
            "aqi": aqi_result["aqi"],
            "category": aqi_result["category"],
            "temperature": temp,
            "humidity": humidity,
            "wind_speed": wind_speed,
            "wind_direction": wind_direction,
        })

    return forecast


def get_weather_pollution_coupling(location: str) -> dict:
    """Mock 'Weather-Pollution Interaction' panel data."""
    _validate_location(location)
    base = _BASE_CONDITIONS[location]

    inversion_strength = base["inversion_strength"]
    if inversion_strength >= 0.75:
        inversion_label, trapping_risk = "High", "Elevated"
    elif inversion_strength >= 0.5:
        inversion_label, trapping_risk = "Moderate", "Moderate"
    else:
        inversion_label, trapping_risk = "Low", "Low"

    pbl = base["pbl_height"]
    dispersion_pbl = "Low" if pbl < 650 else "Moderate" if pbl < 800 else "Good"

    wind = base["wind_speed"]
    dispersion_wind = "Poor" if wind < 4 else "Moderate" if wind < 7 else "Good"

    stubble = base["stubble_influence"]
    stubble_status = "High" if stubble >= 30 else "Moderate" if stubble >= 15 else "Low"

    return {
        "location": location,
        "temperature_inversion": {
            "strength": inversion_label,
            "value": inversion_strength,
            "trapping_risk": trapping_risk,
        },
        "pbl_height": {
            "value_m": pbl,
            "dispersion": dispersion_pbl,
        },
        "wind_dispersion": {
            "wind_speed_kmh": wind,
            "dispersion": dispersion_wind,
        },
        "stubble_burning": {
            "regional_influence_pct": stubble,
            "status": stubble_status,
        },
    }


def get_alerts(location: str) -> List[dict]:
    """Mock early-warning alert panel data, tailored slightly per location."""
    _validate_location(location)
    coupling = get_weather_pollution_coupling(location)
    alerts = []

    inversion = coupling["temperature_inversion"]
    if inversion["trapping_risk"] in ("Elevated",):
        alerts.append({
            "severity": "high",
            "icon": "⚠",
            "title": "HIGH RISK",
            "message": "Strong temperature inversion expected",
            "description": "Low vertical mixing may trap pollutants near the surface.",
            "expected_duration_hours": 18,
        })
    elif inversion["trapping_risk"] == "Moderate":
        alerts.append({
            "severity": "moderate",
            "icon": "⚠",
            "title": "MODERATE RISK",
            "message": "Moderate temperature inversion possible overnight",
            "description": "Some reduction in vertical mixing expected.",
            "expected_duration_hours": 10,
        })

    alerts.append({
        "severity": "moderate",
        "icon": "⚠",
        "title": "MODERATE",
        "message": "PM2.5 accumulation expected overnight.",
        "description": "Pollutant levels typically rise between midnight and early morning.",
        "expected_duration_hours": 8,
    })

    stubble = coupling["stubble_burning"]
    if stubble["status"] in ("Moderate", "High"):
        alerts.append({
            "severity": "moderate" if stubble["status"] == "Moderate" else "high",
            "icon": "🔥",
            "title": "STUBBLE-BURNING INFLUENCE",
            "message": f"{stubble['status']} regional contribution detected.",
            "description": f"Estimated {stubble['regional_influence_pct']}% regional influence from agricultural burning.",
            "expected_duration_hours": None,
        })

    return alerts


def get_model_status() -> dict:
    """Mock AI model status panel — clearly labeled as demo values."""
    return {
        "status": "online",
        "model_name": "XGBoost / Hybrid ML",
        "prediction_horizon_hours": 72,
        "last_prediction_minutes_ago": 2,
        "model_confidence_pct": 91.4,
        "is_demo": True,
    }


# Coordinates for the Leaflet map (Delhi NCR approximate lat/lng)
LOCATION_COORDINATES: Dict[str, Dict[str, float]] = {
    "Anand Vihar": {"lat": 28.6469, "lng": 77.3152},
    "Connaught Place": {"lat": 28.6315, "lng": 77.2167},
    "Dwarka": {"lat": 28.5921, "lng": 77.0460},
    "Okhla Phase III": {"lat": 28.5355, "lng": 77.2757},
    "Rohini": {"lat": 28.7495, "lng": 77.0565},
    "IGI Airport": {"lat": 28.5562, "lng": 77.1000},
}

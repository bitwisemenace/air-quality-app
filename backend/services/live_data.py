"""
live_data.py
------------
Fetches REAL hourly air quality + weather for each Delhi location from
Open-Meteo (free, no API key needed):

  * Air quality : https://air-quality-api.open-meteo.com/v1/air-quality
                  (Copernicus CAMS model: PM2.5, PM10, CO, NO2)
  * Weather     : https://api.open-meteo.com/v1/forecast
                  (temperature, humidity, pressure, wind)

IMPORTANT LIMITS (say these honestly in the presentation):
  * This is CAMS *model* data on a ~45 km grid for Delhi, NOT readings from a
    ground sensor. Nearby locations therefore get very similar values, and
    numbers can differ from CPCB station readings.
  * Units: PM2.5 / PM10 / CO / NO2 are in ug/m3.

Uses only the Python standard library (no extra pip installs).
"""

import json
import time
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from services.aqi import combined_aqi
from services.mock_data import LOCATION_COORDINATES, WIND_DIRECTIONS

AQ_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
WX_URL = "https://api.open-meteo.com/v1/forecast"
TIMEZONE = "Asia/Kolkata"          # same clock as the training data (IST)
PAST_DAYS = 2                       # history needed for the model's lag features
FORECAST_DAYS = 4                   # enough hours to cover a 72-hour forecast
CACHE_SECONDS = 15 * 60             # do not call the API more than every 15 min

_cache: dict = {}


class LiveDataError(Exception):
    """Raised when live data cannot be fetched or is incomplete."""


def _get_json(url: str, params: dict) -> dict:
    full_url = url + "?" + urlencode(params)
    request = Request(full_url, headers={"User-Agent": "AirSenseNCR/1.0"})
    try:
        with urlopen(request, timeout=10) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as exc:  # network down, timeout, bad JSON, ...
        raise LiveDataError(f"Open-Meteo request failed: {exc}") from exc


def _fetch_series(location: str) -> list:
    coords = LOCATION_COORDINATES[location]
    common = {
        "latitude": coords["lat"],
        "longitude": coords["lng"],
        "timezone": TIMEZONE,
        "past_days": PAST_DAYS,
        "forecast_days": FORECAST_DAYS,
    }
    aq = _get_json(AQ_URL, {**common, "hourly": "pm2_5,pm10,carbon_monoxide,nitrogen_dioxide"})
    wx = _get_json(WX_URL, {
        **common,
        "hourly": "temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m",
    })

    try:
        aq_h, wx_h = aq["hourly"], wx["hourly"]
        wx_index = {t: i for i, t in enumerate(wx_h["time"])}
        rows = []
        for i, t in enumerate(aq_h["time"]):
            j = wx_index.get(t)
            rows.append({
                "timestamp": t,                                   # "2026-09-19T13:00" (IST)
                "pm25": aq_h["pm2_5"][i],
                "pm10": aq_h["pm10"][i],
                "co": aq_h["carbon_monoxide"][i],
                "no2": aq_h["nitrogen_dioxide"][i],
                "temp": wx_h["temperature_2m"][j] if j is not None else None,
                "humidity": wx_h["relative_humidity_2m"][j] if j is not None else None,
                "pressure": wx_h["surface_pressure"][j] if j is not None else None,
                "wind_kmh": wx_h["wind_speed_10m"][j] if j is not None else None,
                "wind_deg": wx_h["wind_direction_10m"][j] if j is not None else None,
            })
    except (KeyError, TypeError) as exc:
        raise LiveDataError(f"Unexpected Open-Meteo response: {exc}") from exc
    return rows


def get_series(location: str) -> list:
    """Hourly rows (past 2 days + next 4 days) for a location, cached for 15 minutes."""
    if location not in LOCATION_COORDINATES:
        raise ValueError(f"Unknown location: {location}")
    cached = _cache.get(location)
    if cached and time.time() - cached[0] < CACHE_SECONDS:
        return cached[1]
    rows = _fetch_series(location)
    _cache[location] = (time.time(), rows)
    return rows


def now_index(rows: list) -> int:
    """Index of the current hour (India time) inside `rows`."""
    now_ist = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
    now_str = now_ist.strftime("%Y-%m-%dT%H:00")
    idx = None
    for i, row in enumerate(rows):
        if row["timestamp"] <= now_str:      # ISO strings sort correctly
            idx = i
    if idx is None:
        raise LiveDataError("No data for the current hour")
    return idx


def deg_to_compass(deg: float) -> str:
    return WIND_DIRECTIONS[int(((deg + 22.5) % 360) // 45)]


def get_live_current(location: str) -> dict:
    """Same shape as mock_data.get_current_conditions, but with real values."""
    rows = get_series(location)
    i = now_index(rows)

    # use the newest hour that has complete data (look back up to 3 hours)
    row = None
    for k in range(4):
        cand = rows[i - k]
        if None not in (cand["pm25"], cand["pm10"], cand["temp"],
                        cand["humidity"], cand["wind_kmh"], cand["wind_deg"]):
            row = cand
            break
    if row is None:
        raise LiveDataError("Live data incomplete for the last 3 hours")

    aqi = combined_aqi(row["pm25"], row["pm10"])
    return {
        "location": location,
        "aqi": aqi["aqi"],
        "category": aqi["category"],
        "pm25": round(row["pm25"], 1),
        "pm10": round(row["pm10"], 1),
        "temperature": round(row["temp"], 1),
        "humidity": round(row["humidity"]),
        "wind_speed": round(row["wind_kmh"], 1),
        "wind_direction": deg_to_compass(row["wind_deg"]),
        "as_of": row["timestamp"],
        "source": "live",
    }

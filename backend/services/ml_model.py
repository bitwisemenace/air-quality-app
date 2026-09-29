"""
ml_model.py
-----------
Forecast using YOUR trained Random Forest models (one per horizon), fed with
LIVE inputs from Open-Meteo (see live_data.py).

Needs, inside backend/models/ :
    pm25_1h.joblib, pm25_3h.joblib, pm25_6h.joblib, pm25_12h.joblib,
    pm25_24h.joblib, pm25_48h.joblib, pm25_72h.joblib, features.json

If any file is missing, or live data is unavailable, this raises an error and
routes/forecast.py falls back to the mock forecast automatically.

CAVEATS (be honest about these):
  * The models were trained on the pollution/weather columns of your CSV; live
    inputs come from a different source (CAMS model). If the two differ in
    scale, predictions will be biased. Check CO units (see CO_SCALE below).
  * PM10 is not predicted by the model; it is estimated from the live
    PM10/PM2.5 ratio.
  * Future weather in each forecast row is Open-Meteo's weather forecast.
"""

import json
import math
from datetime import datetime
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from services.aqi import combined_aqi
from services.live_data import (
    LiveDataError, deg_to_compass, get_series, now_index,
)
from services.mock_data import LOCATION_COORDINATES

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
HORIZONS = [1, 3, 6, 12, 24, 48, 72]

# Open-Meteo gives CO in ug/m3. If your training CSV has CO in a smaller unit
# (typical values 0.5 - 5, i.e. mg/m3), set this to 0.001.
# Check with:  python -c "import pandas as pd; print(pd.read_csv('data/<your csv>')['co'].describe())"
CO_SCALE = 1.0

_features = None
_models = None


def _load():
    global _features, _models
    if _models is None:
        with open(MODEL_DIR / "features.json") as f:
            _features = json.load(f)
        _models = {h: joblib.load(MODEL_DIR / f"pm25_{h}h.joblib") for h in HORIZONS}
    return _features, _models


def _need(value, name):
    if value is None:
        raise LiveDataError(f"Missing live value: {name}")
    return float(value)


def _build_features(rows: list, i: int, location: str) -> dict:
    """Recreate the exact 32 training features for the current hour (index i)."""
    if i < 24:
        raise LiveDataError("Not enough history for 24-hour lag features")

    cur = rows[i]
    coords = LOCATION_COORDINATES[location]
    ts = datetime.fromisoformat(cur["timestamp"])

    wind_kmh = _need(cur["wind_kmh"], "wind speed")
    wind_deg = _need(cur["wind_deg"], "wind direction")
    wind_ms = wind_kmh / 3.6
    rad = math.radians(wind_deg)

    feat = {
        # location
        "lat": coords["lat"],
        "lon": coords["lng"],
        # weather (u/v follow the meteorological "wind blowing from" convention)
        "humidity": _need(cur["humidity"], "humidity"),
        "u10": -wind_ms * math.sin(rad),
        "v10": -wind_ms * math.cos(rad),
        "wind_speed_kph_era5": wind_kmh,
        "wind_dir_sin": math.sin(rad),
        "wind_dir_cos": math.cos(rad),
        "temp_era5_c": _need(cur["temp"], "temperature"),
        "pressure_era5_mb": _need(cur["pressure"], "pressure"),
        # time
        "hour": ts.hour,
        "day_of_week": ts.weekday(),
        "day": ts.day,
        "month": ts.month,
        "is_weekend": int(ts.weekday() >= 5),
    }

    def lag(key, k, scale=1.0):
        return _need(rows[i - k][key], f"{key} {k}h ago") * scale

    for k in (1, 3, 6, 12, 24):
        feat[f"pm2_5_lag_{k}h"] = lag("pm25", k)
    for k in (1, 3, 24):
        feat[f"pm10_lag_{k}h"] = lag("pm10", k)
        feat[f"co_lag_{k}h"] = lag("co", k, CO_SCALE)
        feat[f"no2_lag_{k}h"] = lag("no2", k)
    # training used shift(1).rolling(n).mean()  ->  mean of the previous n hours
    for n in (3, 6, 24):
        feat[f"pm2_5_rolling_{n}h"] = float(np.mean([lag("pm25", k) for k in range(1, n + 1)]))
    return feat


def generate_ml_forecast(location: str, hours: int = 72) -> list:
    features, models = _load()
    rows = get_series(location)
    i = now_index(rows)

    feat = _build_features(rows, i, location)
    X = pd.DataFrame([feat])[features]          # same column order as training

    pm25_now = _need(rows[i]["pm25"], "pm2.5")
    pm10_now = _need(rows[i]["pm10"], "pm10")
    ratio = pm10_now / pm25_now if pm25_now > 0 else 1.5

    known_x = [0] + HORIZONS
    known_y = [pm25_now] + [max(0.0, float(models[h].predict(X)[0])) for h in HORIZONS]

    cur = rows[i]
    hours = max(1, min(hours, 72))
    result = []
    for h in range(hours):
        pm25 = float(np.interp(h, known_x, known_y))   # fill hours between horizons
        pm10 = pm25 * ratio
        aqi = combined_aqi(pm25, pm10)

        wx = rows[i + h] if i + h < len(rows) else rows[-1]     # forecast weather
        def pick(key):
            return wx[key] if wx[key] is not None else cur[key]

        result.append({
            "timestamp": rows[i + h]["timestamp"] if i + h < len(rows) else cur["timestamp"],
            "pm25": round(pm25, 1),
            "pm10": round(pm10, 1),
            "aqi": aqi["aqi"],
            "category": aqi["category"],
            "temperature": round(pick("temp"), 1),
            "humidity": round(pick("humidity")),
            "wind_speed": round(pick("wind_kmh"), 1),
            "wind_direction": deg_to_compass(pick("wind_deg")),
        })
    return result

"""
Run from the backend folder:   python check_live.py
Prints live values for all 6 locations and tests the model forecast.
"""
from services.live_data import get_live_current
from services.mock_data import LOCATION_COORDINATES

print("=== LIVE CURRENT CONDITIONS ===")
for name in LOCATION_COORDINATES:
    try:
        d = get_live_current(name)
        print(f"{name:16} AQI {d['aqi']:>3} ({d['category']:<12}) PM2.5 {d['pm25']:>6} PM10 {d['pm10']:>6} "
              f"{d['temperature']}C {d['humidity']}% wind {d['wind_speed']} km/h {d['wind_direction']}  [{d['as_of']}]")
    except Exception as e:
        print(f"{name:16} FAILED: {e}")

print("\n=== MODEL FORECAST (Rohini) ===")
try:
    from services.ml_model import generate_ml_forecast
    f = generate_ml_forecast("Rohini", 72)
    for h in (0, 1, 6, 24, 48, 71):
        r = f[h]
        print(f"+{h:>2}h  {r['timestamp']}  PM2.5 {r['pm25']:>6}  AQI {r['aqi']:>3} ({r['category']})")
except Exception as e:
    print("Model forecast not available:", e)
    print("(The website will use the mock forecast until models/ is in place.)")

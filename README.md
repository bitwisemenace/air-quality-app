# 🌫️ AirSense NCR — Air Pollution–Weather Coupled Forecasting System

A full-stack air-quality forecasting dashboard for Delhi NCR, built as a prototype for
an SIH / college-hackathon-style demonstration. It currently runs entirely on
**mock/demo data**, but the backend is structured so the mock prediction layer can be
swapped for a real ML model without touching the frontend.

> **All environmental values in this prototype are mock/demo data — not live Delhi NCR measurements.**

---

## 1. Architecture

```text
air-quality-app/
│
├── frontend/                 React + Vite + Tailwind + Recharts + Leaflet
│   ├── src/
│   │   ├── components/       Reusable UI: cards, charts, map, table, alerts...
│   │   ├── pages/             Dashboard, Forecast, Map, Alerts, Model Status
│   │   ├── services/api.js   Single source of truth for backend calls
│   │   ├── utils/aqi.js      Display-only AQI color/format helpers
│   │   ├── hooks/            Shared data-fetching hook
│   │   └── data/             Static reference data (AQI legend, fallbacks)
│   └── package.json
│
├── backend/                  FastAPI + Pydantic + Uvicorn
│   ├── main.py                App entrypoint, CORS, router registration
│   ├── routes/
│   │   ├── locations.py       GET /locations
│   │   ├── current.py         GET /current/{location}, /coupling, /alerts
│   │   └── forecast.py        GET /forecast/{location}, /model/status
│   ├── services/
│   │   ├── mock_data.py       ⭐ ML SWAP POINT — see section 4 below
│   │   └── aqi.py             Independent PM2.5/PM10 → AQI conversion module
│   └── requirements.txt
│
└── README.md
```

Data flow:

```text
ML Model (future) ──▶ Predicted PM2.5/PM10 ──▶ pm25_to_aqi() ──▶ AQI + Category ──▶ FastAPI ──▶ React
```

---

## 2. Running the backend

```bash
cd backend
python -m venv venv

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

- Backend runs at: **http://localhost:8000**
- Interactive API docs (Swagger UI): **http://localhost:8000/docs**

### Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/locations` | List of supported locations + map coordinates |
| GET | `/current/{location}` | Current AQI, PM2.5, PM10, weather snapshot |
| GET | `/current/{location}/coupling` | Weather–Pollution Interaction panel data |
| GET | `/current/{location}/alerts` | Early-warning alerts |
| GET | `/forecast/{location}?hours=72` | Hourly forecast (`hours` = 1–72, default 72) |
| GET | `/forecast/model/status` | AI Model Status panel data |

---

## 3. Running the frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend runs at: **http://localhost:5173**
- It reads the backend URL from the `.env` file:

  ```text
  VITE_API_BASE_URL=http://localhost:8000
  ```

  Change this if your backend runs elsewhere — no URLs are hardcoded anywhere else
  in the app; everything goes through `frontend/src/services/api.js`.

**Start the backend first**, then the frontend. If the backend isn't reachable, the
UI shows a friendly "Unable to connect to forecasting API" message with a Retry
button instead of crashing.

---

## 4. Where the ML team plugs in their model

This is the **only** place that needs to change when the real forecasting model is ready:

**`backend/services/mock_data.py`** — currently exports:

```python
def generate_mock_forecast(location: str, hours: int) -> list[dict]:
    ...
```

The ML team should create a new function with the **same return shape** (a list of
dicts with `timestamp, pm25, pm10, aqi, category, temperature, humidity, wind_speed,
wind_direction`), e.g. in a new `backend/services/ml_model.py`:

```python
def generate_ml_forecast(location: str, hours: int) -> list[dict]:
    raw_predictions = your_model.predict(location, hours)  # PM2.5 / PM10 / weather
    return format_predictions(raw_predictions)               # match the shape above
```

Then in **`backend/routes/forecast.py`**, change one import line:

```python
# from:
from services.mock_data import generate_mock_forecast as generate_forecast
# to:
from services.ml_model import generate_ml_forecast as generate_forecast
```

**No other backend file and no frontend file needs to change.** The AQI value itself
should still always be derived by calling `pm25_to_aqi()` / `combined_aqi()` in
`backend/services/aqi.py` on the model's predicted PM2.5/PM10 — never invent an AQI
number directly.

Similarly, `get_current_conditions()`, `get_weather_pollution_coupling()`, and
`get_alerts()` in `mock_data.py` can each be swapped for real-data-backed versions
independently, as long as they keep the same return shape.

---

## 5. AQI calculation

`backend/services/aqi.py` implements the CPCB-style piecewise-linear breakpoint
interpolation formula (not a flat multiplier):

```text
AQI = ((AQI_high − AQI_low) / (C_high − C_low)) × (C − C_low) + AQI_low
```

- `pm25_to_aqi(pm25)` → `{"aqi": ..., "category": ...}`
- `pm10_to_aqi(pm10)` → `{"aqi": ..., "category": ...}`
- `combined_aqi(pm25, pm10)` → the higher (worse) of the two sub-indices, matching
  India's National AQI methodology of taking the max across pollutant sub-indices.

Categories (also independent, not hardcoded in the frontend):

| Range | Category |
|---|---|
| 0–50 | Good |
| 51–100 | Satisfactory |
| 101–200 | Moderate |
| 201–300 | Poor |
| 301–400 | Very Poor |
| 401–500 | Severe |

---

## 6. Adding a database later

The mock layer currently keeps everything in memory (`backend/services/mock_data.py`).
To add PostgreSQL later:

1. Add `sqlalchemy` / `asyncpg` (or your ORM of choice) to `requirements.txt`.
2. Create `backend/db.py` for the engine/session.
3. Replace the in-memory lookups inside `mock_data.py` (or the new ML service) with
   DB queries — the route files (`routes/*.py`) don't need to change since they only
   call functions, not raw data.

---

## 7. Notes on the map

The Leaflet map (`frontend/src/components/PollutionMap.jsx`) currently shows the six
NCR locations as color-coded markers based on live AQI category, with a legend and
click-to-select behavior. It's structured so future layers can be added as sibling
components inside `<MapContainer>`:

- Wind arrows
- Pollution movement / plume direction
- Stubble-burning hotspots (satellite fire data)
- Pollution concentration heatmap

These are **not** implemented with fake data — only the component architecture is
left ready for real API-backed data later.

---

## 8. Tech stack summary

**Frontend:** React 18, Vite, Tailwind CSS, Recharts, React-Leaflet, React Router, lucide-react icons
**Backend:** Python, FastAPI, Pydantic, Uvicorn
**Data:** In-memory mock data (no database required for this version)

"""
aqi.py
------
Independent AQI calculation module.

This module converts pollutant concentrations (currently PM2.5, PM10) into
India's National AQI using the CPCB-style piecewise-linear breakpoint
interpolation formula (the same style formula used for US EPA AQI, with
India-specific breakpoints).

WHY THIS MODULE IS ISOLATED:
-----------------------------
When the real ML model is plugged in, it will only ever need to output raw
pollutant concentrations (e.g. predicted PM2.5). This module remains the
single source of truth for turning concentrations into AQI + category, so:

    ML Model -> Predicted PM2.5 -> pm25_to_aqi() -> AQI + Category -> Frontend

No other part of the backend should re-implement AQI math.
"""

from typing import List, Tuple, TypedDict


class AQIResult(TypedDict):
    aqi: int
    category: str


# ---------------------------------------------------------------------------
# CPCB-style breakpoint tables: (C_low, C_high, AQI_low, AQI_high)
# ---------------------------------------------------------------------------

PM25_BREAKPOINTS: List[Tuple[float, float, int, int]] = [
    (0.0, 30.0, 0, 50),
    (30.1, 60.0, 51, 100),
    (60.1, 90.0, 101, 200),
    (90.1, 120.0, 201, 300),
    (120.1, 250.0, 301, 400),
    (250.1, 500.0, 401, 500),
]

PM10_BREAKPOINTS: List[Tuple[float, float, int, int]] = [
    (0.0, 50.0, 0, 50),
    (50.1, 100.0, 51, 100),
    (100.1, 250.0, 101, 200),
    (250.1, 350.0, 201, 300),
    (350.1, 430.0, 301, 400),
    (430.1, 600.0, 401, 500),
]

# AQI category bands (shared across pollutants once converted to AQI)
AQI_CATEGORIES: List[Tuple[int, int, str]] = [
    (0, 50, "Good"),
    (51, 100, "Satisfactory"),
    (101, 200, "Moderate"),
    (201, 300, "Poor"),
    (301, 400, "Very Poor"),
    (401, 500, "Severe"),
]


def _interpolate(concentration: float, breakpoints: List[Tuple[float, float, int, int]]) -> int:
    """
    Piecewise-linear interpolation formula:

        AQI = ((AQI_high - AQI_low) / (C_high - C_low)) * (C - C_low) + AQI_low
    """
    # Clamp to the top of the table if concentration exceeds all bands
    if concentration <= 0:
        concentration = 0.0

    top = breakpoints[-1]
    if concentration > top[1]:
        # Beyond the worst defined band -> cap at 500 (Severe+)
        return 500

    for c_low, c_high, aqi_low, aqi_high in breakpoints:
        if c_low <= concentration <= c_high:
            aqi = ((aqi_high - aqi_low) / (c_high - c_low)) * (concentration - c_low) + aqi_low
            return round(aqi)

    # Fallback (shouldn't normally hit this)
    return 0


def get_aqi_category(aqi: int) -> str:
    """Return the category label for a given AQI value. No frontend hardcoding needed."""
    for low, high, label in AQI_CATEGORIES:
        if low <= aqi <= high:
            return label
    if aqi > AQI_CATEGORIES[-1][1]:
        return AQI_CATEGORIES[-1][2]
    return AQI_CATEGORIES[0][2]


def pm25_to_aqi(pm25: float) -> AQIResult:
    """
    Convert a PM2.5 concentration (µg/m³) into AQI + category.

    Example:
        >>> pm25_to_aqi(168)
        {'aqi': 286, 'category': 'Poor'}
    """
    aqi = _interpolate(pm25, PM25_BREAKPOINTS)
    return {"aqi": aqi, "category": get_aqi_category(aqi)}


def pm10_to_aqi(pm10: float) -> AQIResult:
    """Convert a PM10 concentration (µg/m³) into AQI + category."""
    aqi = _interpolate(pm10, PM10_BREAKPOINTS)
    return {"aqi": aqi, "category": get_aqi_category(aqi)}


def combined_aqi(pm25: float, pm10: float) -> AQIResult:
    """
    India's National AQI is the MAX of all pollutant sub-indices.
    Currently we only have PM2.5 and PM10; more pollutants (NO2, SO2, O3, CO)
    can be added here later without touching any calling code.
    """
    pm25_result = pm25_to_aqi(pm25)
    pm10_result = pm10_to_aqi(pm10)
    if pm25_result["aqi"] >= pm10_result["aqi"]:
        return pm25_result
    return pm10_result

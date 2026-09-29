"""
routes/locations.py
--------------------
GET /locations -> list of supported Delhi NCR monitoring locations,
plus their map coordinates (used by the Leaflet map on the frontend).
"""

from fastapi import APIRouter

from services.mock_data import LOCATION_COORDINATES, get_locations

router = APIRouter(tags=["locations"])


@router.get("/locations")
def list_locations():
    """
    Returns:
        {
          "locations": ["Anand Vihar", "Connaught Place", ...],
          "coordinates": {
              "Anand Vihar": {"lat": 28.6469, "lng": 77.3152},
              ...
          }
        }
    """
    return {
        "locations": get_locations(),
        "coordinates": LOCATION_COORDINATES,
    }

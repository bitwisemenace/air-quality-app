// data/aqiCategories.js
//
// Static reference table of India's National AQI categories, mirroring
// backend/services/aqi.py::AQI_CATEGORIES. This is used ONLY for reference
// display (e.g. a legend or info tooltip) — the actual AQI value and
// category assigned to any reading always comes from the backend API.

export const AQI_CATEGORIES_REFERENCE = [
  { range: '0–50', label: 'Good', emoji: '🟢' },
  { range: '51–100', label: 'Satisfactory', emoji: '🟡' },
  { range: '101–200', label: 'Moderate', emoji: '🟠' },
  { range: '201–300', label: 'Poor', emoji: '🔴' },
  { range: '301–400', label: 'Very Poor', emoji: '🟣' },
  { range: '401–500', label: 'Severe', emoji: '⚫' },
]

// Fallback location list, used only to render the UI shell before the
// /locations API call resolves (never used as a substitute for live data).
export const FALLBACK_LOCATIONS = [
  'Anand Vihar',
  'Connaught Place',
  'Dwarka',
  'Okhla Phase III',
  'Rohini',
  'IGI Airport',
]

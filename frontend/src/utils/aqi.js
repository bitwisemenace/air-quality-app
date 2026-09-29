// utils/aqi.js
//
// Frontend-side display helpers for AQI categories.
// IMPORTANT: the actual AQI *value* and *category label* always come from
// the backend (services/aqi.py -> pm25_to_aqi). This file only maps a
// category string to a color/style for the UI — it never recomputes AQI.

export const AQI_STYLES = {
  Good: {
    color: '#4ade80',
    bg: 'bg-aqi-good/15',
    text: 'text-aqi-good',
    border: 'border-aqi-good/40',
    emoji: '🟢',
  },
  Satisfactory: {
    color: '#a3e635',
    bg: 'bg-aqi-satisfactory/15',
    text: 'text-aqi-satisfactory',
    border: 'border-aqi-satisfactory/40',
    emoji: '🟡',
  },
  Moderate: {
    color: '#facc15',
    bg: 'bg-aqi-moderate/15',
    text: 'text-aqi-moderate',
    border: 'border-aqi-moderate/40',
    emoji: '🟠',
  },
  Poor: {
    color: '#fb923c',
    bg: 'bg-aqi-poor/15',
    text: 'text-aqi-poor',
    border: 'border-aqi-poor/40',
    emoji: '🔴',
  },
  'Very Poor': {
    color: '#f87171',
    bg: 'bg-aqi-veryPoor/15',
    text: 'text-aqi-veryPoor',
    border: 'border-aqi-veryPoor/40',
    emoji: '🟣',
  },
  Severe: {
    color: '#a855f7',
    bg: 'bg-aqi-severe/15',
    text: 'text-aqi-severe',
    border: 'border-aqi-severe/40',
    emoji: '⚫',
  },
}

export function getAqiStyle(category) {
  return AQI_STYLES[category] || AQI_STYLES.Moderate
}

export function formatTime(isoString) {
  const d = new Date(isoString)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatShortLabel(isoString, index) {
  if (index === 0) return 'Now'
  const d = new Date(isoString)
  return d.toLocaleTimeString([], { hour: '2-digit' })
}

export function formatDateTime(isoString) {
  const d = new Date(isoString)
  return d.toLocaleString([], {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  })
}

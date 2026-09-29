// services/api.js
//
// Central API service layer. All backend communication goes through here —
// components should never call fetch() directly. This keeps the eventual
// swap to a real ML-backed API contained to the backend only; the frontend
// never needs to change.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`)
  } catch (err) {
    throw new ApiError(
      'Unable to connect to forecasting API. Please check whether the backend server is running.',
      0,
    )
  }

  if (!response.ok) {
    throw new ApiError(`Request failed (${response.status}) for ${path}`, response.status)
  }

  return response.json()
}

/** GET /locations */
export async function getLocations() {
  return request('/locations')
}

/** GET /current/{location} */
export async function getCurrent(location) {
  return request(`/current/${encodeURIComponent(location)}`)
}

/** GET /current/{location}/coupling */
export async function getWeatherCoupling(location) {
  return request(`/current/${encodeURIComponent(location)}/coupling`)
}

/** GET /current/{location}/alerts */
export async function getAlerts(location) {
  return request(`/current/${encodeURIComponent(location)}/alerts`)
}

/** GET /forecast/{location}?hours=72 */
export async function getForecast(location, hours = 72) {
  return request(`/forecast/${encodeURIComponent(location)}?hours=${hours}`)
}

/** GET /forecast/model/status */
export async function getModelStatus() {
  return request('/forecast/model/status')
}

export { ApiError }

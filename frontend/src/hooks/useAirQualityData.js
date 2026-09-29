import { useCallback, useEffect, useState } from 'react'
import { getCurrent, getLocations } from '../services/api.js'

/**
 * Central hook: owns the list of locations, the selected location, and its
 * current-conditions snapshot. Lives at the App level so every page (and the
 * header's location dropdown / map) stays in sync without prop-drilling
 * duplicate fetches.
 */
export function useAirQualityData() {
  const [locations, setLocations] = useState([])
  const [coordinates, setCoordinates] = useState({})
  const [selectedLocation, setSelectedLocation] = useState('')
  const [current, setCurrent] = useState(null)
  const [loadingLocations, setLoadingLocations] = useState(true)
  const [loadingCurrent, setLoadingCurrent] = useState(true)
  const [error, setError] = useState(null)
  const [apiOnline, setApiOnline] = useState(true)

  const loadLocations = useCallback(async () => {
    setLoadingLocations(true)
    setError(null)
    try {
      const data = await getLocations()
      setLocations(data.locations)
      setCoordinates(data.coordinates || {})
      setApiOnline(true)
      if (!selectedLocation && data.locations.length) {
        setSelectedLocation(data.locations[0])
      }
    } catch (err) {
      setApiOnline(false)
      setError(err.message)
    } finally {
      setLoadingLocations(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadCurrent = useCallback(async (location) => {
    if (!location) return
    setLoadingCurrent(true)
    setError(null)
    try {
      const data = await getCurrent(location)
      setCurrent(data)
      setApiOnline(true)
    } catch (err) {
      setApiOnline(false)
      setError(err.message)
    } finally {
      setLoadingCurrent(false)
    }
  }, [])

  useEffect(() => {
    loadLocations()
  }, [loadLocations])

  useEffect(() => {
    if (selectedLocation) loadCurrent(selectedLocation)
  }, [selectedLocation, loadCurrent])

  return {
    locations,
    coordinates,
    selectedLocation,
    setSelectedLocation,
    current,
    loadingLocations,
    loadingCurrent,
    error,
    apiOnline,
    refetch: () => {
      loadLocations()
      loadCurrent(selectedLocation)
    },
  }
}

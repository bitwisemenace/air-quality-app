import { useEffect, useState } from 'react'
import PollutionMap from '../components/PollutionMap.jsx'
import LoadingState from '../components/LoadingState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import DataSourceBadge from '../components/DataSourceBadge.jsx'
import { getCurrent } from '../services/api.js'

export default function MapPage({ locations, coordinates, selectedLocation, onSelectLocation }) {
  const [locationsData, setLocationsData] = useState([])
  const [allLive, setAllLive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!locations.length) return
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all(locations.map((name) => getCurrent(name)))
      .then((results) => {
        if (cancelled) return
        setAllLive(results.length > 0 && results.every((r) => r.source === 'live'))
        const merged = results.map((r) => {
          const coord = coordinates[r.location]
          return {
            name: r.location,
            aqi: r.aqi,
            category: r.category,
            pm25: r.pm25,
            pm10: r.pm10,
            coords: coord ? [coord.lat, coord.lng] : null,
          }
        }).filter((l) => l.coords)
        setLocationsData(merged)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [locations, coordinates])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Delhi NCR Pollution Map</h1>
          <p className="text-sm text-slate-400">Click a marker to view details, or use the header dropdown.</p>
        </div>
        <DataSourceBadge kind="current" source={allLive ? 'live' : 'mock'} />
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <LoadingState label="Loading map data..." />
      ) : (
        <PollutionMap
          locationsData={locationsData}
          selectedLocation={selectedLocation}
          onSelectLocation={onSelectLocation}
        />
      )}

      <div className="rounded-2xl border border-navy-700/60 bg-navy-900/50 p-4 text-xs text-slate-500">
        <p className="mb-1 font-semibold text-slate-400">Planned future map layers (architecture-ready, not yet populated with data):</p>
        <p>Wind arrows · Pollution movement · Plume direction · Stubble-burning hotspots · Satellite fire locations · Concentration heatmap</p>
      </div>
    </div>
  )
}

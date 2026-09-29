import { useEffect, useState } from 'react'
import LoadingState from '../components/LoadingState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import DataSourceBadge from '../components/DataSourceBadge.jsx'
import { AqiForecastChart, Pm25ForecastChart } from '../components/ForecastCharts.jsx'
import ForecastTable from '../components/ForecastTable.jsx'
import { getForecast } from '../services/api.js'

const HOUR_OPTIONS = [24, 48, 72]

export default function ForecastPage({ selectedLocation }) {
  const [hours, setHours] = useState(72)
  const [forecast, setForecast] = useState([])
  const [source, setSource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!selectedLocation) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getForecast(selectedLocation, hours)
      .then((data) => {
        if (!cancelled) {
          setForecast(data.forecast)
          setSource(data.source)
        }
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
  }, [selectedLocation, hours])

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">72-Hour Forecast — {selectedLocation}</h1>
          <p className="text-sm text-slate-400">AQI, PM2.5 and hourly conditions</p>
        </div>
        <div className="flex items-center gap-2">
          <DataSourceBadge kind="forecast" source={source} />
          <div className="flex overflow-hidden rounded-lg border border-navy-700">
            {HOUR_OPTIONS.map((h) => (
              <button
                key={h}
                onClick={() => setHours(h)}
                className={`px-3 py-1.5 text-sm font-medium transition ${
                  hours === h
                    ? 'bg-emerald-400/15 text-emerald-300'
                    : 'bg-navy-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <LoadingState label="Loading forecast..." />
      ) : (
        <>
          <div className="rounded-2xl border border-navy-700/60 bg-navy-900/70 p-4 shadow-card sm:p-6">
            <h2 className="mb-4 text-base font-bold text-white">AQI Forecast</h2>
            <AqiForecastChart data={forecast} />
          </div>

          <div className="rounded-2xl border border-navy-700/60 bg-navy-900/70 p-4 shadow-card sm:p-6">
            <h2 className="mb-4 text-base font-bold text-white">PM2.5 Forecast</h2>
            <Pm25ForecastChart data={forecast} />
          </div>

          <div>
            <h2 className="mb-4 text-base font-bold text-white">Hourly Records ({forecast.length})</h2>
            <ForecastTable data={forecast} />
          </div>
        </>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import MetricCards from '../components/MetricCards.jsx'
import LoadingState from '../components/LoadingState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import DataSourceBadge from '../components/DataSourceBadge.jsx'
import { AqiForecastChart, Pm25ForecastChart } from '../components/ForecastCharts.jsx'
import ForecastTable from '../components/ForecastTable.jsx'
import WeatherCoupling from '../components/WeatherCoupling.jsx'
import { getForecast, getWeatherCoupling } from '../services/api.js'

export default function Dashboard({ current, loadingCurrent, error, apiOnline, refetch, selectedLocation }) {
  const [forecast, setForecast] = useState([])
  const [forecastSource, setForecastSource] = useState(null)
  const [coupling, setCoupling] = useState(null)
  const [loadingForecast, setLoadingForecast] = useState(true)
  const [forecastError, setForecastError] = useState(null)

  useEffect(() => {
    if (!selectedLocation) return
    let cancelled = false
    setLoadingForecast(true)
    setForecastError(null)

    Promise.all([getForecast(selectedLocation, 72), getWeatherCoupling(selectedLocation)])
      .then(([forecastData, couplingData]) => {
        if (cancelled) return
        setForecast(forecastData.forecast)
        setForecastSource(forecastData.source)
        setCoupling(couplingData)
      })
      .catch((err) => {
        if (!cancelled) setForecastError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoadingForecast(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedLocation])

  if (!apiOnline && error) {
    return <ErrorState message={error} onRetry={refetch} />
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-white">Current Conditions — {selectedLocation}</h2>
          <DataSourceBadge kind="current" source={current?.source} asOf={current?.as_of} />
        </div>
        {loadingCurrent ? (
          <LoadingState label="Loading current conditions..." />
        ) : (
          <MetricCards current={current} />
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-white">72-Hour AQI Forecast</h2>
          <DataSourceBadge kind="forecast" source={forecastSource} />
        </div>
        <div className="rounded-2xl border border-navy-700/60 bg-navy-900/70 p-4 shadow-card sm:p-6">
          {loadingForecast ? (
            <LoadingState label="Loading forecast..." />
          ) : forecastError ? (
            <ErrorState message={forecastError} />
          ) : (
            <AqiForecastChart data={forecast} />
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-white">72-Hour PM2.5 Forecast</h2>
        <div className="rounded-2xl border border-navy-700/60 bg-navy-900/70 p-4 shadow-card sm:p-6">
          {loadingForecast ? (
            <LoadingState label="Loading forecast..." />
          ) : forecastError ? (
            <ErrorState message={forecastError} />
          ) : (
            <Pm25ForecastChart data={forecast} />
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-white">Hourly Forecast</h2>
        {loadingForecast ? (
          <LoadingState label="Loading forecast..." />
        ) : (
          <ForecastTable data={forecast.slice(0, 24)} />
        )}
      </section>

      <section>
        {loadingForecast ? (
          <LoadingState label="Loading weather–pollution coupling data..." />
        ) : (
          <WeatherCoupling coupling={coupling} />
        )}
      </section>
    </div>
  )
}

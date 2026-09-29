import { useEffect, useState } from 'react'
import AlertsPanel from '../components/AlertsPanel.jsx'
import LoadingState from '../components/LoadingState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import DemoBadge from '../components/DemoBadge.jsx'
import { getAlerts } from '../services/api.js'

export default function AlertsPage({ selectedLocation }) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!selectedLocation) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getAlerts(selectedLocation)
      .then((data) => {
        if (!cancelled) setAlerts(data.alerts)
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
  }, [selectedLocation])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">⚠ Active Alerts — {selectedLocation}</h1>
          <p className="text-sm text-slate-400">Early-warning panel for pollution and weather risk</p>
        </div>
        <DemoBadge label="Sample alerts • Prototype" />
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <LoadingState label="Loading alerts..." />
      ) : (
        <AlertsPanel alerts={alerts} />
      )}
    </div>
  )
}

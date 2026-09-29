import { useEffect, useState } from 'react'
import ModelStatusPanel from '../components/ModelStatusPanel.jsx'
import LoadingState from '../components/LoadingState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import { getModelStatus } from '../services/api.js'

export default function ModelStatusPage() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    getModelStatus()
      .then((data) => {
        if (!cancelled) setStatus(data)
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
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Model Status</h1>
        <p className="text-sm text-slate-400">Live status of the forecasting model powering AirSense NCR</p>
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <LoadingState label="Checking model status..." />
      ) : (
        <ModelStatusPanel status={status} />
      )}
    </div>
  )
}

import { Cpu, FlaskConical } from 'lucide-react'

/**
 * Shows where the numbers on a page really come from.
 *
 *  kind="current"  -> source is "live" (real Open-Meteo data) or "mock" (offline fallback)
 *  kind="forecast" -> source is "model" (trained ML models) or "mock" (sample forecast)
 *
 * If the backend is an old version that sends no `source`, it is treated as sample data.
 */
export default function DataSourceBadge({ kind = 'current', source, asOf, className = '' }) {
  const isLive = kind === 'forecast' ? source === 'model' : source === 'live'

  let label
  if (kind === 'forecast') {
    label = isLive ? 'ML model forecast • live inputs' : 'Sample forecast • model offline'
  } else {
    const time = asOf ? ` • ${String(asOf).slice(11, 16)} IST` : ''
    label = isLive ? `Live data${time}` : 'Live feed offline • Sample data'
  }

  const colors = isLive
    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
    : 'border-amber-400/30 bg-amber-400/10 text-amber-300'

  return (
    <span
      title={isLive ? 'Values come from the live feed / trained model' : 'Showing sample values, not real measurements'}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${colors} ${className}`}
    >
      {isLive ? (
        kind === 'forecast' ? (
          <Cpu className="h-3 w-3" />
        ) : (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
        )
      ) : (
        <FlaskConical className="h-3 w-3" />
      )}
      {label}
    </span>
  )
}

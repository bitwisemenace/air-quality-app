import { FlaskConical } from 'lucide-react'

export default function DemoBadge({ label = 'Forecast: ML model • Current data: sample', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-amber-300 ${className}`}
    >
      <FlaskConical className="h-3 w-3" />
      {label}
    </span>
  )
}

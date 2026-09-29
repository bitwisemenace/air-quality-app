import { Cpu, CheckCircle2, Clock, Target, Gauge } from 'lucide-react'
import DemoBadge from './DemoBadge.jsx'

export default function ModelStatusPanel({ status }) {
  if (!status) return null

  return (
    <div className="rounded-2xl border border-navy-700/60 bg-navy-900/70 p-6 shadow-card">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">AI Model Status</h2>
        </div>
        <DemoBadge label="Mock / Demo Values" />
      </div>

      <div className="mb-6 flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
        </span>
        <span className="text-sm font-semibold text-emerald-300">
          {status.status === 'online' ? 'Online' : 'Offline'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusItem icon={Cpu} label="Model" value={status.model_name} />
        <StatusItem icon={Target} label="Prediction horizon" value={`${status.prediction_horizon_hours} hours`} />
        <StatusItem icon={Clock} label="Last prediction" value={`${status.last_prediction_minutes_ago} minutes ago`} />
        <StatusItem icon={Gauge} label="Model confidence" value={`${status.model_confidence_pct}%`} />
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-xl border border-navy-700 bg-navy-800/50 p-3 text-xs text-slate-400">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
        These values are placeholders for demo purposes. Once the ML team's model is deployed,
        this panel will reflect real inference metadata from the backend (see{' '}
        <code className="rounded bg-navy-900 px-1 py-0.5">backend/routes/forecast.py</code>).
      </div>
    </div>
  )
}

function StatusItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-navy-800 bg-navy-950/40 p-4">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-base font-bold text-white">{value}</p>
    </div>
  )
}

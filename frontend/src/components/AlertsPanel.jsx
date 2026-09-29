const SEVERITY_STYLES = {
  high: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/8',
    text: 'text-red-300',
  },
  moderate: {
    border: 'border-amber-400/30',
    bg: 'bg-amber-400/8',
    text: 'text-amber-300',
  },
  low: {
    border: 'border-emerald-400/30',
    bg: 'bg-emerald-400/8',
    text: 'text-emerald-300',
  },
}

export default function AlertsPanel({ alerts }) {
  if (!alerts || !alerts.length) {
    return (
      <div className="rounded-2xl border border-navy-700/60 bg-navy-900/70 p-6 text-center text-sm text-slate-400">
        No active alerts for this location right now.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {alerts.map((alert, idx) => {
        const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.moderate
        return (
          <div
            key={idx}
            className={`rounded-2xl border p-5 shadow-card ${style.border} ${style.bg}`}
          >
            <div className={`mb-2 flex items-center gap-2 text-sm font-bold ${style.text}`}>
              <span className="text-lg leading-none">{alert.icon}</span>
              {alert.title}
            </div>
            <p className="text-sm font-medium text-slate-200">{alert.message}</p>
            {alert.description && (
              <p className="mt-1 text-sm text-slate-400">{alert.description}</p>
            )}
            {alert.expected_duration_hours != null && (
              <div className="mt-3 border-t border-white/5 pt-2 text-xs text-slate-500">
                Expected duration: <span className="font-medium text-slate-300">{alert.expected_duration_hours} hours</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

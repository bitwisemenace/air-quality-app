import { WifiOff, RefreshCw } from 'lucide-react'

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-10 text-center">
      <WifiOff className="h-8 w-8 text-red-400" />
      <p className="font-semibold text-red-300">Unable to connect to forecasting API.</p>
      <p className="max-w-sm text-sm text-slate-400">
        {message || 'Please check whether the backend server is running.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-navy-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-400/50 hover:text-emerald-300"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  )
}

import { Loader2 } from 'lucide-react'

export default function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-400">
      <Loader2 className="h-7 w-7 animate-spin text-emerald-400" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

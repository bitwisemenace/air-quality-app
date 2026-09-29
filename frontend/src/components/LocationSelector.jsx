import { MapPin } from 'lucide-react'

export default function LocationSelector({ locations, selectedLocation, onChange }) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-navy-700 bg-navy-800/80 px-3 py-2 text-sm text-slate-200 transition focus-within:border-emerald-400/50">
      <MapPin className="h-4 w-4 text-emerald-400" />
      <span className="sr-only">Select Location</span>
      <select
        value={selectedLocation}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent text-sm font-medium text-slate-100 outline-none"
      >
        {locations.map((loc) => (
          <option key={loc} value={loc} className="bg-navy-800 text-slate-100">
            {loc}
          </option>
        ))}
      </select>
    </label>
  )
}

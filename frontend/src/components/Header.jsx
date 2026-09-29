import { useEffect, useState } from 'react'
import { Menu, Wifi, WifiOff } from 'lucide-react'
import LocationSelector from './LocationSelector.jsx'

export default function Header({
  locations,
  selectedLocation,
  onLocationChange,
  apiOnline,
  onMenuClick,
}) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30)
    return () => clearInterval(t)
  }, [])

  return (
    <header className="sticky top-0 z-30 border-b border-navy-700/60 bg-navy-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <button
          onClick={onMenuClick}
          className="rounded-lg border border-navy-700 p-2 text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-1 items-center gap-3 min-w-[220px]">
          <span className="text-2xl sm:text-3xl">🌫️</span>
          <div>
            <h1 className="text-lg font-bold leading-tight text-white sm:text-xl">
              AirSense NCR
            </h1>
            <p className="text-[11px] leading-tight text-slate-400 sm:text-xs">
              Air Pollution–Weather Coupled Forecasting System · Delhi NCR
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <div className="hidden text-right text-xs text-slate-400 sm:block">
            <div className="font-medium text-slate-200">
              {now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
            <div>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>

          <div
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
              apiOnline
                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                : 'border-red-400/30 bg-red-400/10 text-red-300'
            }`}
          >
            {apiOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {apiOnline ? 'API Online' : 'API Offline'}
          </div>

          <LocationSelector
            locations={locations}
            selectedLocation={selectedLocation}
            onChange={onLocationChange}
          />
        </div>
      </div>
    </header>
  )
}

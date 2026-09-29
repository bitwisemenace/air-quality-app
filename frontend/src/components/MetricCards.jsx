import {
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  Compass,
  CircleDot,
} from 'lucide-react'
import { getAqiStyle } from '../utils/aqi.js'

function Card({ icon: Icon, label, value, unit, accent }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-navy-700/60 bg-navy-900/70 p-4 shadow-card transition hover:border-navy-600">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent || 'bg-navy-800 text-emerald-300'}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="truncate text-lg font-bold text-white">
          {value}
          {unit && <span className="ml-1 text-sm font-normal text-slate-400">{unit}</span>}
        </p>
      </div>
    </div>
  )
}

export function AqiHeroCard({ aqi, category }) {
  const style = getAqiStyle(category)
  return (
    <div
      className="col-span-2 flex flex-col justify-between rounded-2xl border p-5 shadow-card sm:col-span-1"
      style={{
        borderColor: `${style.color}40`,
        background: `linear-gradient(135deg, ${style.color}22, transparent 70%)`,
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
          Delhi NCR Air Quality
        </p>
        <span className="text-lg">{style.emoji}</span>
      </div>
      <div className="mt-2">
        <p className="text-5xl font-extrabold text-white">{aqi}</p>
        <p className="mt-1 text-sm font-semibold" style={{ color: style.color }}>
          {category}
        </p>
      </div>
    </div>
  )
}

export default function MetricCards({ current }) {
  if (!current) return null
  const { aqi, category, pm25, pm10, temperature, humidity, wind_speed, wind_direction } = current

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <AqiHeroCard aqi={aqi} category={category} />
      <Card icon={CircleDot} label="PM2.5" value={pm25} unit="µg/m³" accent="bg-orange-400/10 text-orange-300" />
      <Card icon={Gauge} label="PM10" value={pm10} unit="µg/m³" accent="bg-amber-400/10 text-amber-300" />
      <Card icon={Thermometer} label="Temperature" value={temperature} unit="°C" accent="bg-sky-400/10 text-sky-300" />
      <Card icon={Droplets} label="Humidity" value={humidity} unit="%" accent="bg-blue-400/10 text-blue-300" />
      <Card icon={Wind} label="Wind Speed" value={wind_speed} unit="km/h" accent="bg-teal-400/10 text-teal-300" />
      <Card icon={Compass} label="Wind Direction" value={wind_direction} accent="bg-emerald-400/10 text-emerald-300" />
    </div>
  )
}

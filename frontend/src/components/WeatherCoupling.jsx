import { Thermometer, Layers, Wind, Flame } from 'lucide-react'

function riskColor(level) {
  const map = {
    High: 'text-red-400',
    Elevated: 'text-red-400',
    Moderate: 'text-amber-300',
    Low: 'text-emerald-400',
    Poor: 'text-red-400',
    Good: 'text-emerald-400',
  }
  return map[level] || 'text-slate-300'
}

function CouplingCard({ icon: Icon, title, mainLabel, mainValue, subLabel, subValue }) {
  return (
    <div className="rounded-2xl border border-navy-700/60 bg-navy-900/70 p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2 text-slate-300">
        <Icon className="h-4 w-4 text-emerald-400" />
        <p className="text-xs font-semibold uppercase tracking-wide">{title}</p>
      </div>
      <p className="text-[11px] text-slate-500">{mainLabel}</p>
      <p className="text-xl font-bold text-white">{mainValue}</p>
      <div className="mt-3 border-t border-navy-800 pt-2">
        <p className="text-[11px] text-slate-500">{subLabel}</p>
        <p className={`text-sm font-semibold ${riskColor(subValue)}`}>{subValue}</p>
      </div>
    </div>
  )
}

export default function WeatherCoupling({ coupling }) {
  if (!coupling) return null
  const { temperature_inversion, pbl_height, wind_dispersion, stubble_burning } = coupling

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-white">Weather–Pollution Interaction</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CouplingCard
          icon={Thermometer}
          title="Temperature Inversion"
          mainLabel="Inversion Strength"
          mainValue={temperature_inversion.strength}
          subLabel="Pollution trapping risk"
          subValue={temperature_inversion.trapping_risk}
        />
        <CouplingCard
          icon={Layers}
          title="PBL Height"
          mainLabel="PBL Height"
          mainValue={`${pbl_height.value_m} m`}
          subLabel="Dispersion"
          subValue={pbl_height.dispersion}
        />
        <CouplingCard
          icon={Wind}
          title="Wind Dispersion"
          mainLabel="Wind Speed"
          mainValue={`${wind_dispersion.wind_speed_kmh} km/h`}
          subLabel="Dispersion"
          subValue={wind_dispersion.dispersion}
        />
        <CouplingCard
          icon={Flame}
          title="Stubble Burning Influence"
          mainLabel="Regional influence"
          mainValue={`${stubble_burning.regional_influence_pct}%`}
          subLabel="Status"
          subValue={stubble_burning.status}
        />
      </div>
    </div>
  )
}

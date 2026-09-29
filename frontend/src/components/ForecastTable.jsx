import { formatTime, getAqiStyle } from '../utils/aqi.js'

export default function ForecastTable({ data }) {
  if (!data || !data.length) return null

  return (
    <div className="overflow-x-auto rounded-2xl border border-navy-700/60">
      <table className="min-w-[760px] w-full text-left text-sm">
        <thead>
          <tr className="border-b border-navy-700/60 bg-navy-900/80 text-[11px] uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">AQI</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">PM2.5</th>
            <th className="px-4 py-3 font-medium">PM10</th>
            <th className="px-4 py-3 font-medium">Temp</th>
            <th className="px-4 py-3 font-medium">Humidity</th>
            <th className="px-4 py-3 font-medium">Wind Speed</th>
            <th className="px-4 py-3 font-medium">Direction</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const style = getAqiStyle(row.category)
            return (
              <tr
                key={row.timestamp}
                className={`border-b border-navy-800/60 transition hover:bg-navy-800/40 ${
                  idx % 2 === 0 ? 'bg-navy-900/30' : 'bg-transparent'
                }`}
              >
                <td className="whitespace-nowrap px-4 py-2.5 font-medium text-slate-200">
                  {formatTime(row.timestamp)}
                </td>
                <td className="px-4 py-2.5 font-bold text-white">{row.aqi}</td>
                <td className="px-4 py-2.5">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: `${style.color}22`, color: style.color }}
                  >
                    {style.emoji} {row.category}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-slate-300">{row.pm25}</td>
                <td className="px-4 py-2.5 text-slate-300">{row.pm10}</td>
                <td className="px-4 py-2.5 text-slate-300">{row.temperature}°C</td>
                <td className="px-4 py-2.5 text-slate-300">{row.humidity}%</td>
                <td className="px-4 py-2.5 text-slate-300">{row.wind_speed} km/h</td>
                <td className="px-4 py-2.5 text-slate-300">{row.wind_direction}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

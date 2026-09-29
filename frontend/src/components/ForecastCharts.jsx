import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { formatShortLabel, formatDateTime, getAqiStyle } from '../utils/aqi.js'

function AqiTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const d = payload[0].payload
  const style = getAqiStyle(d.category)
  return (
    <div className="rounded-lg border border-navy-700 bg-navy-900/95 px-3 py-2 text-xs shadow-card">
      <p className="mb-1 font-medium text-slate-300">{formatDateTime(d.timestamp)}</p>
      <p className="font-bold text-white">AQI: {d.aqi}</p>
      <p className="font-medium" style={{ color: style.color }}>{d.category}</p>
    </div>
  )
}

function Pm25Tooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-navy-700 bg-navy-900/95 px-3 py-2 text-xs shadow-card">
      <p className="mb-1 font-medium text-slate-300">{formatDateTime(d.timestamp)}</p>
      <p className="font-bold text-white">PM2.5: {d.pm25} µg/m³</p>
    </div>
  )
}

export function AqiForecastChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f87171" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e3358" vertical={false} />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(v, i) => formatShortLabel(v, i)}
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={{ stroke: '#1e3358' }}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={30}
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          label={{ value: 'AQI', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
        />
        <Tooltip content={<AqiTooltip />} />
        <Area
          type="monotone"
          dataKey="aqi"
          stroke="#f87171"
          strokeWidth={2.5}
          fill="url(#aqiFill)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function Pm25ForecastChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e3358" vertical={false} />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(v, i) => formatShortLabel(v, i)}
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={{ stroke: '#1e3358' }}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={30}
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          label={{ value: 'PM2.5 (µg/m³)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
        />
        <Tooltip content={<Pm25Tooltip />} />
        <Line
          type="monotone"
          dataKey="pm25"
          stroke="#fb923c"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

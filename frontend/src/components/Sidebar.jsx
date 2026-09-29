import { NavLink } from 'react-router-dom'
import { X, LayoutDashboard, TrendingUp, Map, AlertTriangle, Cpu } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/forecast', label: '72h Forecast', icon: TrendingUp },
  { to: '/map', label: 'Pollution Map', icon: Map },
  { to: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { to: '/model-status', label: 'Model Status', icon: Cpu },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-navy-700/60 bg-navy-900 px-4 py-6 transition-transform duration-200 lg:sticky lg:top-0 lg:z-0 lg:h-screen lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌫️</span>
            <span className="font-bold text-white">AirSense NCR</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-400/10 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.25)]'
                    : 'text-slate-400 hover:bg-navy-800 hover:text-slate-100'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-6 left-4 right-4 rounded-xl border border-navy-700 bg-navy-800/60 p-3 text-[11px] text-slate-500">
          Prototype. The badge on each page shows whether values are live or sample data.
        </div>
      </aside>
    </>
  )
}

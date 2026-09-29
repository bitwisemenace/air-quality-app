import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ForecastPage from './pages/ForecastPage.jsx'
import MapPage from './pages/MapPage.jsx'
import AlertsPage from './pages/AlertsPage.jsx'
import ModelStatusPage from './pages/ModelStatusPage.jsx'
import { useAirQualityData } from './hooks/useAirQualityData.js'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const {
    locations,
    coordinates,
    selectedLocation,
    setSelectedLocation,
    current,
    loadingCurrent,
    error,
    apiOnline,
    refetch,
  } = useAirQualityData()

  return (
    <div className="flex min-h-screen bg-navy-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-1 flex-col lg:min-w-0">
        <Header
          locations={locations}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          apiOnline={apiOnline}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {!selectedLocation && !apiOnline ? (
            <div className="pt-10">
              <ErrorBoundaryFallback error={error} onRetry={refetch} />
            </div>
          ) : (
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    current={current}
                    loadingCurrent={loadingCurrent}
                    error={error}
                    apiOnline={apiOnline}
                    refetch={refetch}
                    selectedLocation={selectedLocation}
                  />
                }
              />
              <Route
                path="/forecast"
                element={<ForecastPage selectedLocation={selectedLocation} />}
              />
              <Route
                path="/map"
                element={
                  <MapPage
                    locations={locations}
                    coordinates={coordinates}
                    selectedLocation={selectedLocation}
                    onSelectLocation={setSelectedLocation}
                  />
                }
              />
              <Route path="/alerts" element={<AlertsPage selectedLocation={selectedLocation} />} />
              <Route path="/model-status" element={<ModelStatusPage />} />
            </Routes>
          )}
        </main>

        <footer className="border-t border-navy-800/60 px-4 py-4 text-center text-[11px] text-slate-500 sm:px-6 lg:px-8">
          AirSense NCR · Prototype for SIH/college demonstration · Current values: live model data (Open-Meteo/CAMS) when online · Alerts and weather-coupling panel: sample data
        </footer>
      </div>
    </div>
  )
}

function ErrorBoundaryFallback({ error, onRetry }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
      <p className="font-semibold text-red-300">Unable to connect to forecasting API.</p>
      <p className="mt-2 text-sm text-slate-400">
        Please check whether the backend server is running at the configured VITE_API_BASE_URL.
      </p>
      {error && <p className="mt-2 text-xs text-slate-600">{error}</p>}
      <button
        onClick={onRetry}
        className="mt-4 rounded-lg border border-slate-600 bg-navy-800 px-4 py-2 text-sm font-medium text-slate-200 hover:border-emerald-400/50 hover:text-emerald-300"
      >
        Retry
      </button>
    </div>
  )
}

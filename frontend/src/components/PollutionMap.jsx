import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { getAqiStyle } from '../utils/aqi.js'

const DELHI_NCR_CENTER = [28.6139, 77.209]

// -----------------------------------------------------------------------
// FUTURE MAP FEATURES (architecture placeholders — not implemented with
// fake data per the project spec). When real feeds are available, add:
//   - <WindArrowLayer />           wind vector arrows
//   - <PollutionPlumeLayer />      plume/dispersion direction overlay
//   - <StubbleHotspotLayer />      satellite-detected fire/stubble hotspots
//   - <ConcentrationHeatmapLayer />pollution concentration heatmap
// Each would be a sibling component dropped inside <MapContainer> below,
// fed by a new endpoint (e.g. GET /map/wind, GET /map/hotspots).
// -----------------------------------------------------------------------

function FlyToSelected({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.flyTo(position, 12, { duration: 0.6 })
    }
  }, [position, map])
  return null
}

export default function PollutionMap({ locationsData, selectedLocation, onSelectLocation }) {
  const selectedCoords = locationsData.find((l) => l.name === selectedLocation)?.coords

  return (
    <div className="relative overflow-hidden rounded-2xl border border-navy-700/60">
      <MapContainer
        center={DELHI_NCR_CENTER}
        zoom={10}
        scrollWheelZoom={false}
        style={{ height: '460px', width: '100%' }}
      >
        <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyToSelected position={selectedCoords} />

        {locationsData.map((loc) => {
          const style = getAqiStyle(loc.category)
          const isSelected = loc.name === selectedLocation
          return (
            <CircleMarker
              key={loc.name}
              center={loc.coords}
              radius={isSelected ? 14 : 10}
              pathOptions={{
                color: isSelected ? '#ffffff' : style.color,
                weight: isSelected ? 3 : 1.5,
                fillColor: style.color,
                fillOpacity: 0.85,
              }}
              eventHandlers={{
                click: () => onSelectLocation?.(loc.name),
              }}
            >
              <Popup>
                <div className="min-w-[160px]">
                  <p className="mb-1 text-sm font-bold text-white">{loc.name}</p>
                  <p className="text-xs text-slate-300">AQI: <span className="font-semibold text-white">{loc.aqi}</span></p>
                  <p className="text-xs text-slate-300">PM2.5: {loc.pm25} µg/m³</p>
                  <p className="text-xs text-slate-300">PM10: {loc.pm10} µg/m³</p>
                  <p className="mt-1 text-xs font-semibold" style={{ color: style.color }}>
                    Category: {loc.category}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[400] rounded-xl border border-navy-700/70 bg-navy-950/90 px-3 py-2 text-xs text-slate-300 backdrop-blur">
        <p className="mb-1 font-semibold text-slate-200">Legend</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          <span>🟢 Good</span>
          <span>🟡 Satisfactory</span>
          <span>🟠 Moderate</span>
          <span>🔴 Poor</span>
          <span>🟣 Very Poor</span>
          <span>⚫ Severe</span>
        </div>
      </div>
    </div>
  )
}

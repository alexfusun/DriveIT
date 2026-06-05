import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getCars, compareCars } from '../services/carsService'
import CarCard from '../components/CarCard'
import Spinner from '../components/Spinner'
import RatingStars from '../components/RatingStars'

const FUEL_LABELS = { GASOLINE: 'Gasolina', DIESEL: 'Diésel', ELECTRIC: 'Eléctrico', HYBRID: 'Híbrido', PLUG_IN_HYBRID: 'H. enchufable' }
const TRANS_LABELS = { MANUAL: 'Manual', AUTOMATIC: 'Automático', SEMI_AUTOMATIC: 'Semiaut.' }

function CompareRow({ label, values, highlight, format = (v) => v }) {
  if (values.every((v) => v == null)) return null
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="py-2.5 px-3 text-sm text-slate-500 font-medium w-36">{label}</td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`py-2.5 px-3 text-sm text-center font-medium ${
            highlight === i ? 'text-green-600 bg-green-50' : 'text-slate-900'
          }`}
        >
          {v != null ? format(v) : <span className="text-slate-300">—</span>}
        </td>
      ))}
    </tr>
  )
}

export default function ComparatorPage() {
  const [searchParams] = useSearchParams()
  const [selected, setSelected] = useState([])
  const [comparison, setComparison] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [comparing, setComparing] = useState(false)

  useEffect(() => {
    const ids = searchParams.get('ids')
    if (ids) {
      const idArr = ids.split(',').map(Number).filter(Boolean)
      if (idArr.length >= 2) {
        setComparing(true)
        compareCars(idArr).then(({ data }) => setComparison(data)).catch(() => {}).finally(() => setComparing(false))
      }
    }
  }, [searchParams])

  const handleSearch = (q) => {
    setSearch(q)
    if (q.length < 2) { setSearchResults([]); return }
    setSearching(true)
    getCars({ model: q, size: 6 }).then(({ data }) => setSearchResults(data.content || [])).catch(() => {}).finally(() => setSearching(false))
  }

  const addCar = (car) => {
    if (selected.find((c) => c.id === car.id) || selected.length >= 4) return
    setSelected((prev) => [...prev, car])
    setSearch('')
    setSearchResults([])
  }

  const removeCar = (id) => setSelected((prev) => prev.filter((c) => c.id !== id))

  const handleCompare = () => {
    if (selected.length < 2) return
    setComparing(true)
    compareCars(selected.map((c) => c.id))
      .then(({ data }) => setComparison(data))
      .catch(() => {})
      .finally(() => setComparing(false))
  }

  const cars = comparison?.cars || []
  const h = comparison?.highlights || {}

  const cheapestIdx = cars.findIndex((c) => c.id === h.cheapest)
  const powerfulIdx = cars.findIndex((c) => c.id === h.mostPowerful)
  const efficientIdx = cars.findIndex((c) => c.id === h.mostEfficient)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Comparador</h1>
      <p className="text-slate-500 mb-6">Compara hasta 4 coches lado a lado</p>

      {/* Car selector */}
      {!comparison && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {selected.map((car) => (
              <div key={car.id} className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                <span className="text-sm font-medium text-blue-700">{car.brand} {car.model} {car.year}</span>
                <button onClick={() => removeCar(car.id)} className="text-blue-400 hover:text-blue-600 text-xs">✕</button>
              </div>
            ))}
            {selected.length < 4 && (
              <div className="relative">
                <input
                  value={search} onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Buscar coche a añadir..."
                  className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {(searching || searchResults.length > 0) && (
                  <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-xl shadow-lg w-72 z-10 max-h-64 overflow-y-auto">
                    {searching ? (
                      <div className="p-3 text-center text-sm text-slate-400">Buscando...</div>
                    ) : searchResults.map((car) => (
                      <button key={car.id} onClick={() => addCar(car)}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm flex justify-between items-center">
                        <span className="font-medium">{car.brand} {car.model}</span>
                        <span className="text-slate-400">{car.year}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={handleCompare} disabled={selected.length < 2 || comparing}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {comparing ? 'Comparando...' : `Comparar ${selected.length} coches`}
          </button>
        </div>
      )}

      {comparing && <Spinner className="h-40" />}

      {comparison && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-xl text-slate-900">Resultado de la comparación</h2>
            <button onClick={() => { setComparison(null); setSelected([]) }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium">Nueva comparación</button>
          </div>

          {/* Highlights */}
          {Object.keys(h).length > 0 && (
            <div className="flex flex-wrap gap-3 mb-5">
              {h.cheapest != null && <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">💰 Más económico: {cars[cheapestIdx]?.brand} {cars[cheapestIdx]?.model}</span>}
              {h.mostPowerful != null && <span className="bg-orange-100 text-orange-700 text-xs font-medium px-3 py-1.5 rounded-full">⚡ Más potente: {cars[powerfulIdx]?.brand} {cars[powerfulIdx]?.model}</span>}
              {h.mostEfficient != null && <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">🍃 Más eficiente: {cars[efficientIdx]?.brand} {cars[efficientIdx]?.model}</span>}
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Car headers */}
            <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: `9rem repeat(${cars.length}, 1fr)` }}>
              <div className="p-3" />
              {cars.map((car, i) => (
                <div key={car.id} className="p-4 border-l border-slate-200 text-center">
                  <div className="aspect-video bg-slate-100 rounded-lg mb-2 overflow-hidden">
                    {car.images?.[0] ? (
                      <img src={car.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🚗</div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{car.brand}</p>
                  <p className="font-bold text-slate-900">{car.model}</p>
                  <p className="text-xs text-slate-400">{car.version}</p>
                  <p className="text-lg font-bold text-blue-600 mt-1">
                    {car.price?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                  </p>
                  <div className="flex justify-center mt-1">
                    <RatingStars rating={car.averageRating} size="sm" />
                  </div>
                </div>
              ))}
            </div>

            <table className="w-full">
              <tbody>
                <tr className="bg-slate-50"><td colSpan={cars.length + 1} className="py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Motor</td></tr>
                <CompareRow label="Combustible" values={cars.map((c) => FUEL_LABELS[c.specs?.engine?.fuelType])} />
                <CompareRow label="Potencia" values={cars.map((c) => c.specs?.engine?.horsepower)} highlight={powerfulIdx} format={(v) => `${v} CV`} />
                <CompareRow label="Par motor" values={cars.map((c) => c.specs?.engine?.torque)} format={(v) => `${v} Nm`} />
                <CompareRow label="Consumo" values={cars.map((c) => c.specs?.engine?.consumption)} highlight={efficientIdx} format={(v) => `${v} L/100km`} />
                <CompareRow label="Emisiones" values={cars.map((c) => c.specs?.engine?.emissions)} format={(v) => `${v} g/km`} />
                <tr className="bg-slate-50"><td colSpan={cars.length + 1} className="py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Prestaciones</td></tr>
                <CompareRow label="0–100 km/h" values={cars.map((c) => c.specs?.performance?.acceleration0To100)} format={(v) => `${v} s`} />
                <CompareRow label="Vel. máx." values={cars.map((c) => c.specs?.performance?.topSpeed)} format={(v) => `${v} km/h`} />
                <tr className="bg-slate-50"><td colSpan={cars.length + 1} className="py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Dimensiones</td></tr>
                <CompareRow label="Largo" values={cars.map((c) => c.specs?.dimensions?.length)} format={(v) => `${v} mm`} />
                <CompareRow label="Ancho" values={cars.map((c) => c.specs?.dimensions?.width)} format={(v) => `${v} mm`} />
                <CompareRow label="Alto" values={cars.map((c) => c.specs?.dimensions?.height)} format={(v) => `${v} mm`} />
                <CompareRow label="Maletero" values={cars.map((c) => c.specs?.dimensions?.trunkCapacity)} format={(v) => `${v} L`} />
                <tr className="bg-slate-50"><td colSpan={cars.length + 1} className="py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Carrocería</td></tr>
                <CompareRow label="Transmisión" values={cars.map((c) => TRANS_LABELS[c.specs?.transmission])} />
                <CompareRow label="Puertas" values={cars.map((c) => c.specs?.doors)} />
                <CompareRow label="Plazas" values={cars.map((c) => c.specs?.seats)} />
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

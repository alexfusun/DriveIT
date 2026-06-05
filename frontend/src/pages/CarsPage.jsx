import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getCars } from '../services/carsService'
import { getBrands } from '../services/brandsService'
import CarCard from '../components/CarCard'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'

const FUEL_TYPES = ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUG_IN_HYBRID']
const FUEL_LABELS = { GASOLINE: 'Gasolina', DIESEL: 'Diésel', ELECTRIC: 'Eléctrico', HYBRID: 'Híbrido', PLUG_IN_HYBRID: 'H. enchufable' }

export default function CarsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [cars, setCars] = useState([])
  const [brands, setBrands] = useState([])
  const [meta, setMeta] = useState({ totalElements: 0, totalPages: 0, currentPage: 0 })
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    brand: searchParams.get('brand') || '',
    model: searchParams.get('model') || '',
    year: searchParams.get('year') || '',
    fuelType: searchParams.get('fuelType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: 'price,asc',
    page: Number(searchParams.get('page') || 0),
    size: 12,
  })

  useEffect(() => { getBrands().then((r) => setBrands(r.data)).catch(() => {}) }, [])

  const fetchCars = useCallback(() => {
    setLoading(true)
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== 0 || typeof v === 'number'))
    getCars(params)
      .then(({ data }) => {
        setCars(data.content || [])
        setMeta({ totalElements: data.totalElements, totalPages: data.totalPages, currentPage: data.currentPage })
      })
      .catch(() => setCars([]))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { fetchCars() }, [fetchCars])

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 0 }))
  const setPage = (page) => setFilters((f) => ({ ...f, page }))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Catálogo de coches</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <select
            value={filters.brand} onChange={(e) => setFilter('brand', e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las marcas</option>
            {brands.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>

          <input
            value={filters.model} onChange={(e) => setFilter('model', e.target.value)}
            placeholder="Modelo" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="number" value={filters.year} onChange={(e) => setFilter('year', e.target.value)}
            placeholder="Año" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filters.fuelType} onChange={(e) => setFilter('fuelType', e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Combustible</option>
            {FUEL_TYPES.map((f) => <option key={f} value={f}>{FUEL_LABELS[f]}</option>)}
          </select>

          <input
            type="number" value={filters.minPrice} onChange={(e) => setFilter('minPrice', e.target.value)}
            placeholder="Precio mín (€)" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="number" value={filters.maxPrice} onChange={(e) => setFilter('maxPrice', e.target.value)}
            placeholder="Precio máx (€)" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <p className="text-sm text-slate-500">{meta.totalElements} coches encontrados</p>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Ordenar:</label>
            <select
              value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)}
              className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="price,asc">Precio: menor a mayor</option>
              <option value="price,desc">Precio: mayor a menor</option>
              <option value="averageRating,desc">Mejor valorados</option>
              <option value="year,desc">Más recientes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <Spinner className="h-64" />
      ) : cars.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {cars.map((car) => <CarCard key={car.id} car={car} />)}
          </div>
          <Pagination currentPage={meta.currentPage} totalPages={meta.totalPages} onPageChange={setPage} />
        </>
      ) : (
        <div className="text-center py-20 text-slate-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-medium">No se encontraron coches con estos filtros</p>
        </div>
      )}
    </div>
  )
}

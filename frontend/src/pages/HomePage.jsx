import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCars } from '../services/carsService'
import { getBrands } from '../services/brandsService'
import CarCard from '../components/CarCard'
import Spinner from '../components/Spinner'

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getCars({ size: 6, sort: 'averageRating,desc' }),
      getBrands(),
    ]).then(([carsRes, brandsRes]) => {
      setFeatured(carsRes.data.content || [])
      setBrands(brandsRes.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">Descubre tu próximo coche</h1>
          <p className="text-blue-100 text-xl mb-8 max-w-2xl mx-auto">
            Compara especificaciones, lee reseñas de publishers verificados y encuentra el coche perfecto para ti.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/cars" className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
              Explorar coches
            </Link>
            <Link to="/compare" className="border border-blue-300 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
              Comparar modelos
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Coches disponibles', value: '500+' },
            { label: 'Reseñas verificadas', value: '2.000+' },
            { label: 'Publishers activos', value: '150+' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-blue-600">{s.value}</p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Brands */}
      {brands.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Marcas disponibles</h2>
          <div className="flex flex-wrap gap-3">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                to={`/cars?brand=${encodeURIComponent(brand.name)}`}
                className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 hover:border-blue-400 hover:shadow-sm transition-all"
              >
                {brand.logoUrl && <img src={brand.logoUrl} alt={brand.name} className="h-6 w-auto object-contain" />}
                <span className="text-sm font-medium text-slate-700">{brand.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured cars */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Mejor valorados</h2>
          <Link to="/cars" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Ver todos →</Link>
        </div>
        {loading ? (
          <Spinner className="h-40" />
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((car) => <CarCard key={car.id} car={car} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">🚗</p>
            <p>El catálogo estará disponible pronto.</p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-slate-900 text-white py-16 px-4 mt-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">¿Eres un experto en coches?</h2>
          <p className="text-slate-400 mb-6">Conviértete en publisher y comparte tus reseñas con miles de usuarios.</p>
          <Link to="/register" className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
            Crear cuenta gratis
          </Link>
        </div>
      </section>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCar } from '../services/carsService'
import { getCarReviews, createReview, updateReview, deleteReview } from '../services/reviewsService'
import { useAuth } from '../context/AuthContext'
import RatingStars from '../components/RatingStars'
import ReviewCard from '../components/ReviewCard'
import ReviewForm from '../components/ReviewForm'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'

const FUEL_LABELS = { GASOLINE: 'Gasolina', DIESEL: 'Diésel', ELECTRIC: 'Eléctrico', HYBRID: 'Híbrido', PLUG_IN_HYBRID: 'H. enchufable' }
const TRANS_LABELS = { MANUAL: 'Manual', AUTOMATIC: 'Automático', SEMI_AUTOMATIC: 'Semiautomático' }
const DRIVE_LABELS = { FWD: 'Tracción delantera', RWD: 'Tracción trasera', AWD: 'Tracción total', '4WD': '4WD' }

function SpecRow({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  )
}

export default function CarDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()

  const [car, setCar] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewMeta, setReviewMeta] = useState({ totalElements: 0, totalPages: 0, currentPage: 0, averageRating: 0, ratingDistribution: {} })
  const [loading, setLoading] = useState(true)
  const [reviewPage, setReviewPage] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    getCar(id).then(({ data }) => setCar(data)).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    getCarReviews(id, { page: reviewPage, size: 5 }).then(({ data }) => {
      setReviews(data.content || [])
      setReviewMeta({
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        averageRating: data.averageRating,
        ratingDistribution: data.ratingDistribution || {},
      })
    }).catch(() => {})
  }, [id, reviewPage])

  const handleCreateReview = async (data) => {
    setFormLoading(true)
    try {
      await createReview(id, data)
      setShowForm(false)
      setReviewPage(0)
      getCarReviews(id, { page: 0, size: 5 }).then(({ data: d }) => {
        setReviews(d.content || [])
        setReviewMeta({ totalElements: d.totalElements, totalPages: d.totalPages, currentPage: d.currentPage, averageRating: d.averageRating, ratingDistribution: d.ratingDistribution || {} })
      })
    } catch { } finally { setFormLoading(false) }
  }

  const handleEditReview = async (data) => {
    setFormLoading(true)
    try {
      await updateReview(editingReview.id, data)
      setEditingReview(null)
      getCarReviews(id, { page: reviewPage, size: 5 }).then(({ data: d }) => { setReviews(d.content || []) })
    } catch { } finally { setFormLoading(false) }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('¿Eliminar esta reseña?')) return
    await deleteReview(reviewId)
    getCarReviews(id, { page: reviewPage, size: 5 }).then(({ data: d }) => {
      setReviews(d.content || [])
      setReviewMeta({ totalElements: d.totalElements, totalPages: d.totalPages, currentPage: d.currentPage, averageRating: d.averageRating, ratingDistribution: d.ratingDistribution || {} })
    })
  }

  if (loading) return <Spinner className="h-96" />
  if (!car) return <div className="text-center py-20 text-slate-500">Coche no encontrado.</div>

  const { specs } = car

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-4 flex items-center gap-1">
        <Link to="/cars" className="hover:text-blue-600">Coches</Link>
        <span>›</span>
        <span className="text-slate-900">{car.brand} {car.model}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Gallery */}
        <div>
          <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden mb-2">
            {car.images?.[activeImage] ? (
              <img src={car.images[activeImage]} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-6xl">🚗</div>
            )}
          </div>
          {car.images?.length > 1 && (
            <div className="flex gap-2">
              {car.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImage ? 'border-blue-500' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-slate-500 font-medium">{car.brand}</span>
            <span className="text-slate-300">·</span>
            <span className="text-sm text-slate-500">{car.year}</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">{car.model}</h1>
          <p className="text-slate-500 mb-3">{car.version}</p>

          <div className="flex items-center gap-3 mb-5">
            <RatingStars rating={reviewMeta.averageRating} size="lg" />
            <span className="text-sm text-slate-500">({reviewMeta.totalElements} reseñas)</span>
          </div>

          <p className="text-4xl font-bold text-slate-900 mb-5">
            {car.price?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          </p>

          <div className="flex gap-3 mb-6">
            <Link
              to={`/compare?ids=${car.id}`}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              + Comparar
            </Link>
          </div>

          {/* Key specs */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Combustible', value: FUEL_LABELS[specs?.engine?.fuelType] || specs?.engine?.fuelType },
              { label: 'Potencia', value: specs?.engine?.horsepower ? `${specs.engine.horsepower} CV` : null },
              { label: 'Transmisión', value: TRANS_LABELS[specs?.transmission] || specs?.transmission },
              { label: 'Consumo', value: specs?.engine?.consumption ? `${specs.engine.consumption} L/100 km` : null },
              { label: '0–100 km/h', value: specs?.performance?.acceleration0To100 ? `${specs.performance.acceleration0To100} s` : null },
              { label: 'Puertas', value: specs?.doors },
            ].filter((s) => s.value).map((s) => (
              <div key={s.label} className="bg-slate-50 rounded-lg px-3 py-2">
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-sm font-semibold text-slate-900">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full specs */}
      {specs && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Ficha técnica completa</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Motor</h3>
              <SpecRow label="Cilindrada" value={specs.engine?.displacement ? `${specs.engine.displacement} cc` : null} />
              <SpecRow label="Potencia" value={specs.engine?.horsepower ? `${specs.engine.horsepower} CV` : null} />
              <SpecRow label="Par máximo" value={specs.engine?.torque ? `${specs.engine.torque} Nm` : null} />
              <SpecRow label="Cilindros" value={specs.engine?.cylinders} />
              <SpecRow label="Combustible" value={FUEL_LABELS[specs.engine?.fuelType]} />
              <SpecRow label="Consumo" value={specs.engine?.consumption ? `${specs.engine.consumption} L/100 km` : null} />
              <SpecRow label="Emisiones CO₂" value={specs.engine?.emissions ? `${specs.engine.emissions} g/km` : null} />
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Dimensiones</h3>
              <SpecRow label="Largo" value={specs.dimensions?.length ? `${specs.dimensions.length} mm` : null} />
              <SpecRow label="Ancho" value={specs.dimensions?.width ? `${specs.dimensions.width} mm` : null} />
              <SpecRow label="Alto" value={specs.dimensions?.height ? `${specs.dimensions.height} mm` : null} />
              <SpecRow label="Batalla" value={specs.dimensions?.wheelbase ? `${specs.dimensions.wheelbase} mm` : null} />
              <SpecRow label="Maletero" value={specs.dimensions?.trunkCapacity ? `${specs.dimensions.trunkCapacity} L` : null} />
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Prestaciones y carrocería</h3>
              <SpecRow label="0–100 km/h" value={specs.performance?.acceleration0To100 ? `${specs.performance.acceleration0To100} s` : null} />
              <SpecRow label="Vel. máxima" value={specs.performance?.topSpeed ? `${specs.performance.topSpeed} km/h` : null} />
              <SpecRow label="Transmisión" value={TRANS_LABELS[specs.transmission]} />
              <SpecRow label="Tracción" value={DRIVE_LABELS[specs.drivetrain]} />
              <SpecRow label="Puertas" value={specs.doors} />
              <SpecRow label="Plazas" value={specs.seats} />
            </div>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Reseñas ({reviewMeta.totalElements})</h2>
          {user?.role === 'PUBLISHER' && !showForm && !editingReview && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              + Escribir reseña
            </button>
          )}
        </div>

        {(showForm || editingReview) && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
            <h3 className="font-semibold text-slate-800 mb-4">{editingReview ? 'Editar reseña' : 'Nueva reseña'}</h3>
            <ReviewForm
              initial={editingReview || {}}
              onSubmit={editingReview ? handleEditReview : handleCreateReview}
              onCancel={() => { setShowForm(false); setEditingReview(null) }}
              loading={formLoading}
            />
          </div>
        )}

        {/* Rating distribution */}
        {reviewMeta.totalElements > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-900">{reviewMeta.averageRating?.toFixed(1)}</p>
              <RatingStars rating={reviewMeta.averageRating} size="lg" />
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviewMeta.ratingDistribution?.[star] || 0
                const pct = reviewMeta.totalElements ? Math.round((count / reviewMeta.totalElements) * 100) : 0
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-4 text-slate-500">{star}★</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                      <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-slate-400">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onEdit={(r) => { setEditingReview(r); setShowForm(false) }}
              onDelete={handleDeleteReview}
            />
          ))}
        </div>
        <Pagination currentPage={reviewMeta.currentPage} totalPages={reviewMeta.totalPages} onPageChange={setReviewPage} />
      </div>
    </div>
  )
}

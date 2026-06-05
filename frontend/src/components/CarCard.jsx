import { Link } from 'react-router-dom'
import RatingStars from './RatingStars'

const FUEL_LABELS = {
  GASOLINE: 'Gasolina', DIESEL: 'Diésel', ELECTRIC: 'Eléctrico',
  HYBRID: 'Híbrido', PLUG_IN_HYBRID: 'Híbrido enchufable',
}

const FUEL_COLORS = {
  GASOLINE: 'bg-orange-100 text-orange-700',
  DIESEL: 'bg-gray-100 text-gray-700',
  ELECTRIC: 'bg-green-100 text-green-700',
  HYBRID: 'bg-blue-100 text-blue-700',
  PLUG_IN_HYBRID: 'bg-purple-100 text-purple-700',
}

export default function CarCard({ car, selectable, selected, onSelect }) {
  const content = (
    <div
      className={`bg-white rounded-xl border transition-all hover:shadow-md overflow-hidden ${
        selectable ? 'cursor-pointer' : ''
      } ${selected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200'}`}
      onClick={selectable ? () => onSelect(car) : undefined}
    >
      <div className="aspect-video bg-slate-100 overflow-hidden">
        {car.imageUrl ? (
          <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl">🚗</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{car.brand}</p>
            <h3 className="font-semibold text-slate-900">{car.model}</h3>
            <p className="text-xs text-slate-500">{car.version}</p>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${FUEL_COLORS[car.fuelType] || 'bg-slate-100 text-slate-600'}`}>
            {FUEL_LABELS[car.fuelType] || car.fuelType}
          </span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-slate-900">
            {car.price?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          </span>
          <div className="flex items-center gap-1">
            <RatingStars rating={car.averageRating} size="sm" />
            <span className="text-xs text-slate-500">({car.reviewCount})</span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-1">{car.year} · {car.horsepower} CV</p>
      </div>
    </div>
  )

  if (selectable) return content
  return <Link to={`/cars/${car.id}`} className="block">{content}</Link>
}

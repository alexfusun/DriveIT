import { useState, useEffect } from 'react'
import { getBrands } from '../services/brandsService'

const FUEL_TYPES = ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUG_IN_HYBRID']
const FUEL_LABELS = { GASOLINE: 'Gasolina', DIESEL: 'Diésel', ELECTRIC: 'Eléctrico', HYBRID: 'Híbrido', PLUG_IN_HYBRID: 'H. enchufable' }
const TRANSMISSIONS = ['MANUAL', 'AUTOMATIC', 'SEMI_AUTOMATIC']
const TRANS_LABELS = { MANUAL: 'Manual', AUTOMATIC: 'Automático', SEMI_AUTOMATIC: 'Semiautomático' }
const DRIVETRAINS = ['FWD', 'RWD', 'AWD', '4WD']

function flattenCar(car) {
  const s = car?.specs || {}
  return {
    brand: car?.brand || '',
    model: car?.model || '',
    version: car?.version || '',
    year: car?.year ?? '',
    price: car?.price ?? '',
    fuelType: s.engine?.fuelType || 'GASOLINE',
    horsepower: s.engine?.horsepower ?? '',
    displacement: s.engine?.displacement ?? '',
    torque: s.engine?.torque ?? '',
    cylinders: s.engine?.cylinders ?? '',
    consumption: s.engine?.consumption ?? '',
    emissions: s.engine?.emissions ?? '',
    length: s.dimensions?.length ?? '',
    width: s.dimensions?.width ?? '',
    height: s.dimensions?.height ?? '',
    wheelbase: s.dimensions?.wheelbase ?? '',
    trunkCapacity: s.dimensions?.trunkCapacity ?? '',
    acceleration: s.performance?.acceleration0To100 ?? '',
    topSpeed: s.performance?.topSpeed ?? '',
    transmission: s.transmission || 'MANUAL',
    drivetrain: s.drivetrain || 'FWD',
    doors: s.doors ?? '',
    seats: s.seats ?? '',
    images: (car?.images || []).join('\n'),
  }
}

function buildPayload(f) {
  const num = (v) => v === '' ? undefined : Number(v)
  return {
    brand: f.brand,
    model: f.model,
    version: f.version,
    year: num(f.year),
    price: num(f.price),
    specs: {
      engine: {
        fuelType: f.fuelType,
        horsepower: num(f.horsepower),
        displacement: num(f.displacement),
        torque: num(f.torque),
        cylinders: num(f.cylinders),
        consumption: num(f.consumption),
        emissions: num(f.emissions),
      },
      dimensions: {
        length: num(f.length),
        width: num(f.width),
        height: num(f.height),
        wheelbase: num(f.wheelbase),
        trunkCapacity: num(f.trunkCapacity),
      },
      performance: {
        acceleration0To100: num(f.acceleration),
        topSpeed: num(f.topSpeed),
      },
      transmission: f.transmission,
      drivetrain: f.drivetrain,
      doors: num(f.doors),
      seats: num(f.seats),
    },
    images: f.images.split('\n').map((s) => s.trim()).filter(Boolean),
  }
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function CarForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(() => flattenCar(initial))
  const [brands, setBrands] = useState([])

  useEffect(() => {
    getBrands().then(({ data }) => setBrands(data || [])).catch(() => {})
  }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(buildPayload(form))
  }

  const SectionHeader = ({ title }) => (
    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide col-span-full border-t border-slate-100 pt-4 mt-2 first:border-0 first:pt-0 first:mt-0">
      {title}
    </h4>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">

        <SectionHeader title="Información básica" />

        <Field label="Marca *">
          <select value={form.brand} onChange={set('brand')} required className={inputCls}>
            <option value="">Seleccionar...</option>
            {brands.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
            {/* allow freetext if brand not in list */}
            {form.brand && !brands.find((b) => b.name === form.brand) && (
              <option value={form.brand}>{form.brand}</option>
            )}
          </select>
        </Field>
        <Field label="Modelo *">
          <input value={form.model} onChange={set('model')} required className={inputCls} placeholder="Corolla" />
        </Field>
        <Field label="Versión">
          <input value={form.version} onChange={set('version')} className={inputCls} placeholder="1.8 Hybrid Active Tech" />
        </Field>
        <Field label="Año *">
          <input type="number" value={form.year} onChange={set('year')} required min="1900" max="2100" className={inputCls} placeholder="2023" />
        </Field>
        <Field label="Precio (€) *">
          <input type="number" value={form.price} onChange={set('price')} required min="0" step="0.01" className={inputCls} placeholder="27500" />
        </Field>

        <SectionHeader title="Motor" />

        <Field label="Combustible *">
          <select value={form.fuelType} onChange={set('fuelType')} required className={inputCls}>
            {FUEL_TYPES.map((f) => <option key={f} value={f}>{FUEL_LABELS[f]}</option>)}
          </select>
        </Field>
        <Field label="Cilindrada (cc)">
          <input type="number" value={form.displacement} onChange={set('displacement')} min="0" className={inputCls} placeholder="1798" />
        </Field>
        <Field label="Potencia (CV)">
          <input type="number" value={form.horsepower} onChange={set('horsepower')} min="0" className={inputCls} placeholder="122" />
        </Field>
        <Field label="Par (Nm)">
          <input type="number" value={form.torque} onChange={set('torque')} min="0" className={inputCls} placeholder="142" />
        </Field>
        <Field label="Cilindros">
          <input type="number" value={form.cylinders} onChange={set('cylinders')} min="0" max="16" className={inputCls} placeholder="4" />
        </Field>
        <Field label="Consumo (L/100 km)">
          <input type="number" value={form.consumption} onChange={set('consumption')} min="0" step="0.1" className={inputCls} placeholder="4.5" />
        </Field>
        <Field label="Emisiones CO₂ (g/km)">
          <input type="number" value={form.emissions} onChange={set('emissions')} min="0" className={inputCls} placeholder="103" />
        </Field>

        <SectionHeader title="Dimensiones" />

        <Field label="Largo (mm)">
          <input type="number" value={form.length} onChange={set('length')} min="0" className={inputCls} placeholder="4370" />
        </Field>
        <Field label="Ancho (mm)">
          <input type="number" value={form.width} onChange={set('width')} min="0" className={inputCls} placeholder="1780" />
        </Field>
        <Field label="Alto (mm)">
          <input type="number" value={form.height} onChange={set('height')} min="0" className={inputCls} placeholder="1435" />
        </Field>
        <Field label="Batalla (mm)">
          <input type="number" value={form.wheelbase} onChange={set('wheelbase')} min="0" className={inputCls} placeholder="2640" />
        </Field>
        <Field label="Maletero (L)">
          <input type="number" value={form.trunkCapacity} onChange={set('trunkCapacity')} min="0" className={inputCls} placeholder="361" />
        </Field>

        <SectionHeader title="Prestaciones y carrocería" />

        <Field label="0–100 km/h (s)">
          <input type="number" value={form.acceleration} onChange={set('acceleration')} min="0" step="0.1" className={inputCls} placeholder="10.9" />
        </Field>
        <Field label="Vel. máx. (km/h)">
          <input type="number" value={form.topSpeed} onChange={set('topSpeed')} min="0" className={inputCls} placeholder="180" />
        </Field>
        <Field label="Transmisión *">
          <select value={form.transmission} onChange={set('transmission')} required className={inputCls}>
            {TRANSMISSIONS.map((t) => <option key={t} value={t}>{TRANS_LABELS[t]}</option>)}
          </select>
        </Field>
        <Field label="Tracción *">
          <select value={form.drivetrain} onChange={set('drivetrain')} required className={inputCls}>
            {DRIVETRAINS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Puertas">
          <input type="number" value={form.doors} onChange={set('doors')} min="1" max="10" className={inputCls} placeholder="4" />
        </Field>
        <Field label="Plazas">
          <input type="number" value={form.seats} onChange={set('seats')} min="1" max="20" className={inputCls} placeholder="5" />
        </Field>

        <SectionHeader title="Imágenes" />

        <div className="col-span-full">
          <Field label="URLs de imágenes (una por línea)">
            <textarea
              value={form.images} onChange={set('images')} rows={3}
              className={`${inputCls} resize-none`}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            />
          </Field>
        </div>

      </div>

      <div className="flex justify-end gap-3 pt-5 border-t border-slate-100 mt-5">
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={loading}
          className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors">
          {loading ? 'Guardando...' : initial?.id ? 'Guardar cambios' : 'Crear coche'}
        </button>
      </div>
    </form>
  )
}

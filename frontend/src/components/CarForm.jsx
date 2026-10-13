import { useState, useEffect } from 'react'
import { getBrands, getBrandModels, createBrand, createModel } from '../services/brandsService'

const FUEL_TYPES = ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUG_IN_HYBRID']
const FUEL_LABELS = { GASOLINE: 'Gasolina', DIESEL: 'Diésel', ELECTRIC: 'Eléctrico', HYBRID: 'Híbrido', PLUG_IN_HYBRID: 'H. enchufable' }
const TRANSMISSIONS = ['MANUAL', 'AUTOMATIC', 'SEMI_AUTOMATIC']
const TRANS_LABELS = { MANUAL: 'Manual', AUTOMATIC: 'Automático', SEMI_AUTOMATIC: 'Semiautomático' }
const DRIVETRAINS = ['FWD', 'RWD', 'AWD', '4WD']

function flattenCar(car) {
  const s = car?.specs || {}
  return {
    brandId: '',
    modelId: '',
    version: car?.version || '',
    year: car?.year ?? '',
    price: car?.price ?? '',
    imageUrl: car?.imageUrl || '',
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
    brandId: num(f.brandId),
    modelId: num(f.modelId),
    version: f.version,
    year: num(f.year),
    price: num(f.price),
    imageUrl: f.imageUrl || null,
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

function SectionHeader({ title }) {
  return (
    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide col-span-full border-t border-slate-100 pt-4 mt-2 first:border-0 first:pt-0 first:mt-0">
      {title}
    </h4>
  )
}

export default function CarForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(() => flattenCar(initial))
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [modelsLoading, setModelsLoading] = useState(false)

  const [addingBrand, setAddingBrand] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')
  const [newBrandCountry, setNewBrandCountry] = useState('')
  const [brandError, setBrandError] = useState('')
  const [brandSaving, setBrandSaving] = useState(false)

  const [addingModel, setAddingModel] = useState(false)
  const [newModelName, setNewModelName] = useState('')
  const [modelError, setModelError] = useState('')
  const [modelSaving, setModelSaving] = useState(false)

  // Load brands once, then resolve the initial car's brand name -> id (the
  // detail endpoint only gives us the name, not the id).
  useEffect(() => {
    getBrands().then(({ data }) => {
      const list = data || []
      setBrands(list)
      if (initial?.brand) {
        const match = list.find((b) => b.name === initial.brand)
        if (match) setForm((f) => ({ ...f, brandId: String(match.id) }))
      }
    }).catch(() => {})
  }, [])

  // Whenever the selected brand changes, load its models. If we're editing
  // an existing car, resolve its model name -> id once the list arrives.
  useEffect(() => {
    if (!form.brandId) { setModels([]); return }
    setModelsLoading(true)
    getBrandModels(form.brandId).then(({ data }) => {
      const list = data || []
      setModels(list)
      if (initial?.model && !form.modelId) {
        const match = list.find((m) => m.name === initial.model)
        if (match) setForm((f) => ({ ...f, modelId: String(match.id) }))
      }
    }).catch(() => setModels([])).finally(() => setModelsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.brandId])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleBrandChange = (e) => {
    const value = e.target.value
    if (value === '__new__') { setAddingBrand(true); return }
    setForm((f) => ({ ...f, brandId: value, modelId: '' }))
  }

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return
    setBrandSaving(true)
    setBrandError('')
    try {
      const { data } = await createBrand({ name: newBrandName.trim(), country: newBrandCountry.trim() || undefined })
      setBrands((b) => [...b, data])
      setForm((f) => ({ ...f, brandId: String(data.id), modelId: '' }))
      setAddingBrand(false)
      setNewBrandName('')
      setNewBrandCountry('')
    } catch (err) {
      setBrandError(err.response?.data?.message || 'No se pudo crear la marca.')
    } finally {
      setBrandSaving(false)
    }
  }

  const handleModelChange = (e) => {
    const value = e.target.value
    if (value === '__new__') { setAddingModel(true); return }
    setForm((f) => ({ ...f, modelId: value }))
  }

  const handleCreateModel = async () => {
    if (!newModelName.trim() || !form.brandId) return
    setModelSaving(true)
    setModelError('')
    try {
      const { data } = await createModel(form.brandId, { name: newModelName.trim() })
      setModels((m) => [...m, data])
      setForm((f) => ({ ...f, modelId: String(data.id) }))
      setAddingModel(false)
      setNewModelName('')
    } catch (err) {
      setModelError(err.response?.data?.message || 'No se pudo crear el modelo.')
    } finally {
      setModelSaving(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(buildPayload(form))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">

        <SectionHeader title="Información básica" />

        <Field label="Marca *">
          {addingBrand ? (
            <div className="space-y-2">
              {brandError && <p className="text-xs text-red-600">{brandError}</p>}
              <input value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)}
                className={inputCls} placeholder="Nombre de la marca" autoFocus />
              <input value={newBrandCountry} onChange={(e) => setNewBrandCountry(e.target.value)}
                className={inputCls} placeholder="País (opcional)" />
              <div className="flex gap-2">
                <button type="button" onClick={handleCreateBrand} disabled={brandSaving}
                  className="flex-1 px-2 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60">
                  {brandSaving ? 'Creando...' : 'Crear marca'}
                </button>
                <button type="button" onClick={() => { setAddingBrand(false); setBrandError('') }}
                  className="px-2 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <select value={form.brandId} onChange={handleBrandChange} required className={inputCls}>
              <option value="">Seleccionar...</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              <option value="__new__">+ Añadir nueva marca...</option>
            </select>
          )}
        </Field>
        <Field label="Modelo *">
          {addingModel ? (
            <div className="space-y-2">
              {modelError && <p className="text-xs text-red-600">{modelError}</p>}
              <input value={newModelName} onChange={(e) => setNewModelName(e.target.value)}
                className={inputCls} placeholder="Nombre del modelo" autoFocus />
              <div className="flex gap-2">
                <button type="button" onClick={handleCreateModel} disabled={modelSaving}
                  className="flex-1 px-2 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60">
                  {modelSaving ? 'Creando...' : 'Crear modelo'}
                </button>
                <button type="button" onClick={() => { setAddingModel(false); setModelError('') }}
                  className="px-2 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <select value={form.modelId} onChange={handleModelChange} required disabled={!form.brandId || modelsLoading} className={inputCls}>
              <option value="">{modelsLoading ? 'Cargando...' : 'Seleccionar...'}</option>
              {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              {form.brandId && <option value="__new__">+ Añadir nuevo modelo...</option>}
            </select>
          )}
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
        <Field label="Imagen principal (URL)">
          <input value={form.imageUrl} onChange={set('imageUrl')} className={inputCls} placeholder="https://example.com/cover.jpg" />
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
          <Field label="URLs de imágenes de galería (una por línea)">
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

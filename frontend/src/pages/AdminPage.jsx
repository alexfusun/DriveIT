import { useState, useEffect, useCallback } from 'react'
import { getUsers, updateUserRole, updatePublisherRank } from '../services/adminService'
import { getCars, getCar, createCar, updateCar, deleteCar } from '../services/carsService'
import CarForm from '../components/CarForm'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'

const ROLES = ['USER', 'PUBLISHER']
const RANKS = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']
const RANK_STYLES = {
  BRONZE: 'bg-amber-100 text-amber-700',
  SILVER: 'bg-slate-100 text-slate-600',
  GOLD: 'bg-yellow-100 text-yellow-700',
  PLATINUM: 'bg-cyan-100 text-cyan-700',
}
const FUEL_LABELS = {
  GASOLINE: 'Gasolina', DIESEL: 'Diésel', ELECTRIC: 'Eléctrico',
  HYBRID: 'Híbrido', PLUG_IN_HYBRID: 'H. enchufable',
}

// ─── Users tab ────────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState({ totalElements: 0, totalPages: 0, currentPage: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  const fetchUsers = useCallback(() => {
    setLoading(true)
    const params = { page, size: 15, ...(search && { search }), ...(roleFilter && { role: roleFilter }) }
    getUsers(params)
      .then(({ data }) => {
        setUsers(data.content || [])
        setMeta({ totalElements: data.totalElements, totalPages: data.totalPages, currentPage: data.currentPage })
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [page, roleFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleSearchSubmit = (e) => { e.preventDefault(); setPage(0); fetchUsers() }

  const handleRoleChange = async (userId, role) => {
    setActionLoading(userId + '-role')
    try { await updateUserRole(userId, role); fetchUsers() } catch { } finally { setActionLoading(null) }
  }

  const handleRankChange = async (publisherId, rank) => {
    setActionLoading(publisherId + '-rank')
    try { await updatePublisherRank(publisherId, rank); fetchUsers() } catch { } finally { setActionLoading(null) }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por usuario o email..."
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Buscar
          </button>
        </form>
        <div className="flex gap-2 flex-wrap">
          {['', 'USER', 'PUBLISHER', 'ADMIN'].map((r) => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(0) }}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                roleFilter === r ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
              }`}>
              {r || 'Todos'}
            </button>
          ))}
        </div>
      </div>

      <p className="px-4 py-2 text-xs text-slate-500 bg-slate-50 border-b border-slate-200">{meta.totalElements} usuarios</p>

      {loading ? <Spinner className="h-40" /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {['Usuario', 'Email', 'Rol', 'Rango', 'Registrado', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{u.username}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.role === 'ADMIN' ? (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">ADMIN</span>
                    ) : (
                      <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={actionLoading === u.id + '-role'}
                        className="text-xs border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500">
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.role === 'PUBLISHER' ? (
                      <select value={u.rank || ''} onChange={(e) => handleRankChange(u.id, e.target.value)}
                        disabled={actionLoading === u.id + '-rank'}
                        className={`text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${RANK_STYLES[u.rank] || 'border-slate-300'}`}>
                        {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString('es-ES')}</td>
                  <td className="px-4 py-3">
                    {(actionLoading === u.id + '-role' || actionLoading === u.id + '-rank') && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="text-center py-12 text-slate-400">No se encontraron usuarios</div>}
        </div>
      )}
      <div className="px-4">
        <Pagination currentPage={meta.currentPage} totalPages={meta.totalPages} onPageChange={setPage} />
      </div>
    </div>
  )
}

// ─── Cars tab ─────────────────────────────────────────────────────────────────

function CarsTab() {
  const [cars, setCars] = useState([])
  const [meta, setMeta] = useState({ totalElements: 0, totalPages: 0, currentPage: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // form state: null = closed, {} = new car, {car data} = editing
  const [formCar, setFormCar] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(null)

  const fetchCars = useCallback(() => {
    setLoading(true)
    const params = { page, size: 15, ...(search && { model: search }) }
    getCars(params)
      .then(({ data }) => {
        setCars(data.content || [])
        setMeta({ totalElements: data.totalElements, totalPages: data.totalPages, currentPage: data.currentPage })
      })
      .catch(() => setCars([]))
      .finally(() => setLoading(false))
  }, [page, search])

  useEffect(() => { fetchCars() }, [fetchCars])

  const handleSearchSubmit = (e) => { e.preventDefault(); setSearch(searchInput); setPage(0) }

  const openCreate = () => { setFormCar({}); setFormError('') }

  const openEdit = async (carId) => {
    setFormError('')
    try {
      const { data } = await getCar(carId)
      setFormCar(data)
    } catch { setFormError('No se pudo cargar el coche.') }
  }

  const handleSubmit = async (payload) => {
    setFormLoading(true)
    setFormError('')
    try {
      if (formCar?.id) {
        await updateCar(formCar.id, payload)
      } else {
        await createCar(payload)
      }
      setFormCar(null)
      fetchCars()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al guardar el coche.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (car) => {
    if (!confirm(`¿Eliminar "${car.brand} ${car.model} ${car.year}"? Esta acción no se puede deshacer.`)) return
    setDeleteLoading(car.id)
    try {
      await deleteCar(car.id)
      fetchCars()
    } catch { } finally { setDeleteLoading(null) }
  }

  if (formCar !== null) {
    return (
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">
            {formCar.id ? `Editar — ${formCar.brand} ${formCar.model} (${formCar.year})` : 'Nuevo coche'}
          </h3>
          <button onClick={() => setFormCar(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
        </div>
        <div className="p-5">
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{formError}</div>
          )}
          <CarForm
            initial={formCar}
            onSubmit={handleSubmit}
            onCancel={() => setFormCar(null)}
            loading={formLoading}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
          <input
            value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por modelo..."
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Buscar
          </button>
        </form>
        <button onClick={openCreate}
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shrink-0">
          + Nuevo coche
        </button>
      </div>

      <p className="px-4 py-2 text-xs text-slate-500 bg-slate-50 border-b border-slate-200">{meta.totalElements} coches</p>

      {loading ? <Spinner className="h-40" /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {['Marca', 'Modelo', 'Versión', 'Año', 'Precio', 'Combustible', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cars.map((car) => (
                <tr key={car.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{car.brand}</td>
                  <td className="px-4 py-3 text-slate-700">{car.model}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-[160px] truncate">{car.version}</td>
                  <td className="px-4 py-3 text-slate-600">{car.year}</td>
                  <td className="px-4 py-3 text-slate-700 font-medium">
                    {car.price?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {FUEL_LABELS[car.fuelType] || car.fuelType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      <button onClick={() => openEdit(car.id)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(car)} disabled={deleteLoading === car.id}
                        className="text-xs text-red-500 hover:text-red-600 font-medium disabled:opacity-40">
                        {deleteLoading === car.id ? '...' : 'Eliminar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cars.length === 0 && <div className="text-center py-12 text-slate-400">No se encontraron coches</div>}
        </div>
      )}
      <div className="px-4">
        <Pagination currentPage={meta.currentPage} totalPages={meta.totalPages} onPageChange={setPage} />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [tab, setTab] = useState('users')

  const tabCls = (t) =>
    `px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
      tab === t
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-slate-500 hover:text-slate-800'
    }`

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-1">Panel de administración</h1>
      <p className="text-slate-500 mb-6">Gestión de usuarios, publishers y catálogo de coches</p>

      <div className="flex border-b border-slate-200 mb-6">
        <button className={tabCls('users')} onClick={() => setTab('users')}>Usuarios</button>
        <button className={tabCls('cars')} onClick={() => setTab('cars')}>Coches</button>
      </div>

      {tab === 'users' ? <UsersTab /> : <CarsTab />}
    </div>
  )
}

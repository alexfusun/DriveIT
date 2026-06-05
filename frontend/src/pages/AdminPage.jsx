import { useState, useEffect } from 'react'
import { getUsers, updateUserRole, updatePublisherRank } from '../services/adminService'
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

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState({ totalElements: 0, totalPages: 0, currentPage: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  const fetchUsers = () => {
    setLoading(true)
    const params = { page, size: 15, ...(search && { search }), ...(roleFilter && { role: roleFilter }) }
    getUsers(params)
      .then(({ data }) => {
        setUsers(data.content || [])
        setMeta({ totalElements: data.totalElements, totalPages: data.totalPages, currentPage: data.currentPage })
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [page, roleFilter])

  const handleSearchSubmit = (e) => { e.preventDefault(); setPage(0); fetchUsers() }

  const handleRoleChange = async (userId, role) => {
    setActionLoading(userId + '-role')
    try {
      await updateUserRole(userId, role)
      fetchUsers()
    } catch { } finally { setActionLoading(null) }
  }

  const handleRankChange = async (publisherId, rank) => {
    setActionLoading(publisherId + '-rank')
    try {
      await updatePublisherRank(publisherId, rank)
      fetchUsers()
    } catch { } finally { setActionLoading(null) }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Panel de administración</h1>
      <p className="text-slate-500 mb-6">Gestión de usuarios y publishers</p>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Toolbar */}
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
          <div className="flex gap-2">
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

        {loading ? (
          <Spinner className="h-40" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Usuario</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rol</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rango</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Registrado</th>
                  <th className="px-4 py-3" />
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
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={actionLoading === u.id + '-role'}
                          className="text-xs border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.role === 'PUBLISHER' ? (
                        <select
                          value={u.rank || ''}
                          onChange={(e) => handleRankChange(u.id, e.target.value)}
                          disabled={actionLoading === u.id + '-rank'}
                          className={`text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${RANK_STYLES[u.rank] || 'border-slate-300'}`}
                        >
                          {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3">
                      {(actionLoading === u.id + '-role' || actionLoading === u.id + '-rank') && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-12 text-slate-400">No se encontraron usuarios</div>
            )}
          </div>
        )}
        <div className="px-4">
          <Pagination currentPage={meta.currentPage} totalPages={meta.totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  )
}

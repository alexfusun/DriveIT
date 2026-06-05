import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateMe, getMyReviews } from '../services/usersService'
import { useEffect } from 'react'
import ReviewCard from '../components/ReviewCard'
import Pagination from '../components/Pagination'

const RANK_STYLES = {
  BRONZE: { badge: 'bg-amber-100 text-amber-700', icon: '🥉' },
  SILVER: { badge: 'bg-slate-100 text-slate-600', icon: '🥈' },
  GOLD: { badge: 'bg-yellow-100 text-yellow-700', icon: '🥇' },
  PLATINUM: { badge: 'bg-cyan-100 text-cyan-700', icon: '💎' },
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ username: user?.username || '', email: user?.email || '', password: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [reviews, setReviews] = useState([])
  const [meta, setMeta] = useState({ totalElements: 0, totalPages: 0, currentPage: 0 })
  const [page, setPage] = useState(0)

  const isPublisher = user?.role === 'PUBLISHER'
  const style = RANK_STYLES[user?.rank] || null

  useEffect(() => {
    if (!isPublisher) return
    getMyReviews({ page, size: 5 }).then(({ data }) => {
      setReviews(data.content || [])
      setMeta({ totalElements: data.totalElements, totalPages: data.totalPages, currentPage: data.currentPage })
    }).catch(() => {})
  }, [isPublisher, page])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { username: form.username, email: form.email }
      if (form.password) payload.password = form.password
      await updateMe(payload)
      await refreshUser()
      setSuccess('Perfil actualizado')
      setEditing(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Mi perfil</h1>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.username}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-slate-500">{user?.email}</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{user?.role}</span>
              {style && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>{style.icon} {user.rank}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {editing ? 'Cancelar' : 'Editar'}
          </button>
        </div>

        {isPublisher && (
          <div className="grid grid-cols-3 gap-4 mb-5 pt-4 border-t border-slate-100">
            <div className="text-center">
              <p className="text-xl font-bold text-slate-900">{user.totalLikes?.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Likes recibidos</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-slate-900">{user.reviewCount}</p>
              <p className="text-sm text-slate-500">Reseñas</p>
            </div>
          </div>
        )}

        {!isPublisher && user?.totalLikesGiven != null && (
          <div className="border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-500">Has dado <span className="font-semibold text-slate-900">{user.totalLikesGiven}</span> likes a reseñas.</p>
          </div>
        )}

        {editing && (
          <form onSubmit={handleSave} className="space-y-4 border-t border-slate-100 pt-4">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
            {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de usuario</label>
              <input value={form.username} onChange={set('username')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={set('email')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nueva contraseña (opcional)</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="Dejar vacío para no cambiar"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors">
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}
      </div>

      {isPublisher && (
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Mis reseñas ({meta.totalElements})</h2>
          <div className="space-y-4">
            {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
          </div>
          {reviews.length === 0 && <p className="text-slate-400 text-sm text-center py-8">Aún no has publicado ninguna reseña.</p>}
          <Pagination currentPage={meta.currentPage} totalPages={meta.totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}

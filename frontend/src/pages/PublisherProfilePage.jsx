import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getPublisher, getPublisherReviews } from '../services/publishersService'
import ReviewCard from '../components/ReviewCard'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'

const RANK_STYLES = {
  BRONZE: { badge: 'bg-amber-100 text-amber-700', icon: '🥉' },
  SILVER: { badge: 'bg-slate-100 text-slate-600', icon: '🥈' },
  GOLD: { badge: 'bg-yellow-100 text-yellow-700', icon: '🥇' },
  PLATINUM: { badge: 'bg-cyan-100 text-cyan-700', icon: '💎' },
}

export default function PublisherProfilePage() {
  const { id } = useParams()
  const [publisher, setPublisher] = useState(null)
  const [reviews, setReviews] = useState([])
  const [meta, setMeta] = useState({ totalElements: 0, totalPages: 0, currentPage: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)

  useEffect(() => {
    getPublisher(id).then(({ data }) => setPublisher(data)).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    getPublisherReviews(id, { page, size: 5 }).then(({ data }) => {
      setReviews(data.content || [])
      setMeta({ totalElements: data.totalElements, totalPages: data.totalPages, currentPage: data.currentPage })
    }).catch(() => {})
  }, [id, page])

  if (loading) return <Spinner className="h-96" />
  if (!publisher) return <div className="text-center py-20 text-slate-500">Publisher no encontrado.</div>

  const style = RANK_STYLES[publisher.rank] || { badge: 'bg-slate-100 text-slate-600', icon: '🏅' }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl">
            {publisher.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{publisher.username}</h1>
            <span className={`inline-flex items-center gap-1 text-sm font-medium px-2.5 py-0.5 rounded-full mt-1 ${style.badge}`}>
              {style.icon} {publisher.rank}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{publisher.totalLikes?.toLocaleString()}</p>
            <p className="text-sm text-slate-500">Likes totales</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{publisher.reviewCount}</p>
            <p className="text-sm text-slate-500">Reseñas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">
              {publisher.reviewCount > 0 ? (publisher.totalLikes / publisher.reviewCount).toFixed(1) : '—'}
            </p>
            <p className="text-sm text-slate-500">Likes / reseña</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-4">Reseñas ({meta.totalElements})</h2>
      <div className="space-y-4">
        {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
      </div>
      {reviews.length === 0 && !loading && (
        <div className="text-center py-12 text-slate-400">Este publisher aún no ha publicado reseñas.</div>
      )}
      <Pagination currentPage={meta.currentPage} totalPages={meta.totalPages} onPageChange={setPage} />
    </div>
  )
}

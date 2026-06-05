import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { likeReview, unlikeReview } from '../services/likesService'
import RatingStars from './RatingStars'

const RANK_COLORS = {
  BRONZE: 'text-amber-700 bg-amber-50',
  SILVER: 'text-slate-600 bg-slate-100',
  GOLD: 'text-yellow-700 bg-yellow-50',
  PLATINUM: 'text-cyan-700 bg-cyan-50',
}

export default function ReviewCard({ review, onDelete, onEdit }) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(review.likedByMe)
  const [likeCount, setLikeCount] = useState(review.likeCount)
  const [likeLoading, setLikeLoading] = useState(false)

  const canLike = user?.role === 'USER'
  const isOwn = user?.id === review.publisher?.id
  const canManage = isOwn || user?.role === 'ADMIN'

  const handleLike = async () => {
    if (!user || !canLike || likeLoading) return
    setLikeLoading(true)
    try {
      if (liked) {
        await unlikeReview(review.id)
        setLiked(false)
        setLikeCount((c) => c - 1)
      } else {
        await likeReview(review.id)
        setLiked(true)
        setLikeCount((c) => c + 1)
      }
    } catch { /* ignore */ } finally {
      setLikeLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm shrink-0">
            {review.publisher?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <Link to={`/publishers/${review.publisher?.id}`} className="text-sm font-semibold text-slate-900 hover:text-blue-600">
              {review.publisher?.username}
            </Link>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${RANK_COLORS[review.publisher?.rank] || ''}`}>
                {review.publisher?.rank}
              </span>
              <span className="text-xs text-slate-400">· {review.publisher?.totalLikes} likes</span>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <RatingStars rating={review.rating} />
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date(review.createdAt).toLocaleDateString('es-ES')}
          </p>
        </div>
      </div>

      <h4 className="font-semibold text-slate-900 mb-1">{review.title}</h4>
      <p className="text-sm text-slate-600 mb-3 leading-relaxed">{review.body}</p>

      {(review.pros?.length > 0 || review.cons?.length > 0) && (
        <div className="flex gap-4 mb-3">
          {review.pros?.length > 0 && (
            <div className="flex-1">
              <p className="text-xs font-medium text-green-700 mb-1">Pros</p>
              <ul className="space-y-0.5">
                {review.pros.map((p, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-center gap-1">
                    <span className="text-green-500">+</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {review.cons?.length > 0 && (
            <div className="flex-1">
              <p className="text-xs font-medium text-red-700 mb-1">Contras</p>
              <ul className="space-y-0.5">
                {review.cons.map((c, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-center gap-1">
                    <span className="text-red-400">-</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <button
          onClick={handleLike}
          disabled={!canLike || likeLoading}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            canLike
              ? liked
                ? 'text-red-500 hover:text-red-600'
                : 'text-slate-400 hover:text-red-500'
              : 'text-slate-300 cursor-not-allowed'
          }`}
        >
          <span>{liked ? '❤️' : '🤍'}</span>
          <span className="font-medium">{likeCount}</span>
        </button>

        {canManage && (
          <div className="flex gap-2">
            {isOwn && onEdit && (
              <button onClick={() => onEdit(review)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Editar
              </button>
            )}
            {canManage && onDelete && (
              <button onClick={() => onDelete(review.id)} className="text-xs text-red-500 hover:text-red-600 font-medium">
                Eliminar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

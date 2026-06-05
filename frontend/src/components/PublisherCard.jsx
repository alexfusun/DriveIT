import { Link } from 'react-router-dom'

const RANK_STYLES = {
  BRONZE: { badge: 'bg-amber-100 text-amber-700', icon: '🥉' },
  SILVER: { badge: 'bg-slate-100 text-slate-600', icon: '🥈' },
  GOLD: { badge: 'bg-yellow-100 text-yellow-700', icon: '🥇' },
  PLATINUM: { badge: 'bg-cyan-100 text-cyan-700', icon: '💎' },
}

export default function PublisherCard({ publisher, rank: position }) {
  const style = RANK_STYLES[publisher.rank] || { badge: 'bg-slate-100 text-slate-600', icon: '🏅' }

  return (
    <Link to={`/publishers/${publisher.id}`} className="block">
      <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all flex items-center gap-4">
        {position != null && (
          <span className="text-2xl font-bold text-slate-200 w-8 text-center shrink-0">#{position + 1}</span>
        )}
        <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
          {publisher.username?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-900 truncate">{publisher.username}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${style.badge}`}>
              {style.icon} {publisher.rank}
            </span>
          </div>
          <p className="text-sm text-slate-500">{publisher.totalLikes} likes · {publisher.reviewCount} reseñas</p>
        </div>
        <span className="text-slate-300 text-xl shrink-0">›</span>
      </div>
    </Link>
  )
}

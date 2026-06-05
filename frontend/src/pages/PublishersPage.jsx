import { useState, useEffect } from 'react'
import { getPublishers } from '../services/publishersService'
import PublisherCard from '../components/PublisherCard'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'

const RANKS = ['', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM']
const RANK_LABELS = { '': 'Todos', BRONZE: '🥉 Bronze', SILVER: '🥈 Silver', GOLD: '🥇 Gold', PLATINUM: '💎 Platinum' }

export default function PublishersPage() {
  const [publishers, setPublishers] = useState([])
  const [meta, setMeta] = useState({ totalElements: 0, totalPages: 0, currentPage: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rank, setRank] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = { page, size: 10, ...(rank && { rank }) }
    getPublishers(params)
      .then(({ data }) => {
        setPublishers(data.content || [])
        setMeta({ totalElements: data.totalElements, totalPages: data.totalPages, currentPage: data.currentPage })
      })
      .catch(() => setPublishers([]))
      .finally(() => setLoading(false))
  }, [page, rank])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Publishers</h1>
          <p className="text-slate-500 mt-1">Clasificación por reputación</p>
        </div>
      </div>

      {/* Rank filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {RANKS.map((r) => (
          <button
            key={r} onClick={() => { setRank(r); setPage(0) }}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors font-medium ${
              rank === r ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
            }`}
          >
            {RANK_LABELS[r]}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner className="h-40" />
      ) : publishers.length > 0 ? (
        <>
          <div className="space-y-3">
            {publishers.map((publisher, i) => (
              <PublisherCard key={publisher.id} publisher={publisher} rank={page * 10 + i} />
            ))}
          </div>
          <Pagination currentPage={meta.currentPage} totalPages={meta.totalPages} onPageChange={setPage} />
        </>
      ) : (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">🏅</p>
          <p>No hay publishers con ese rango</p>
        </div>
      )}
    </div>
  )
}

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const delta = 2
  for (let i = Math.max(0, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ←
      </button>
      {pages[0] > 0 && (
        <>
          <button onClick={() => onPageChange(0)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 hover:bg-slate-50">1</button>
          {pages[0] > 1 && <span className="px-1 text-slate-400">…</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            p === currentPage
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {p + 1}
        </button>
      ))}
      {pages[pages.length - 1] < totalPages - 1 && (
        <>
          {pages[pages.length - 1] < totalPages - 2 && <span className="px-1 text-slate-400">…</span>}
          <button onClick={() => onPageChange(totalPages - 1)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 hover:bg-slate-50">{totalPages}</button>
        </>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        →
      </button>
    </div>
  )
}

export default function RatingStars({ rating, size = 'md' }) {
  const filled = Math.round(rating || 0)
  const sizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }

  return (
    <div className={`flex items-center gap-0.5 ${sizes[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= filled ? 'text-amber-400' : 'text-slate-200'}>★</span>
      ))}
    </div>
  )
}

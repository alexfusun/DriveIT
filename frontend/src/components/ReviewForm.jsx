import { useState } from 'react'

export default function ReviewForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    rating: initial.rating || 5,
    title: initial.title || '',
    body: initial.body || '',
    pros: (initial.pros || []).join('\n'),
    cons: (initial.cons || []).join('\n'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      rating: Number(form.rating),
      title: form.title,
      body: form.body,
      pros: form.pros.split('\n').map((s) => s.trim()).filter(Boolean),
      cons: form.cons.split('\n').map((s) => s.trim()).filter(Boolean),
    })
  }

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Valoración</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s} type="button"
              onClick={() => setForm((f) => ({ ...f, rating: s }))}
              className={`text-2xl transition-transform hover:scale-110 ${s <= form.rating ? 'text-amber-400' : 'text-slate-200'}`}
            >★</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
        <input value={form.title} onChange={set('title')} required
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Título de la reseña" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Reseña</label>
        <textarea value={form.body} onChange={set('body')} required rows={4}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Escribe tu experiencia detallada..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Pros (uno por línea)</label>
          <textarea value={form.pros} onChange={set('pros')} rows={3}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Bajo consumo&#10;Cómodo" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Contras (uno por línea)</label>
          <textarea value={form.cons} onChange={set('cons')} rows={3}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Maletero pequeño&#10;Precio elevado" />
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={loading}
          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors">
          {loading ? 'Guardando...' : 'Publicar reseña'}
        </button>
      </div>
    </form>
  )
}

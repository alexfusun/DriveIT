import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-24 text-center px-4">
      <p className="text-8xl font-bold text-slate-200 mb-4">404</p>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Página no encontrada</h1>
      <p className="text-slate-500 mb-8">La página que buscas no existe o fue movida.</p>
      <Link to="/" className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
        Volver al inicio
      </Link>
    </div>
  )
}

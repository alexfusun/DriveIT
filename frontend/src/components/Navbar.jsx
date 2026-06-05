import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}`

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold text-blue-600 tracking-tight">DriveIT</Link>
            <div className="hidden md:flex items-center gap-6">
              <NavLink to="/cars" className={linkClass}>Coches</NavLink>
              <NavLink to="/compare" className={linkClass}>Comparar</NavLink>
              <NavLink to="/publishers" className={linkClass}>Publishers</NavLink>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <NavLink to="/profile" className={linkClass}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                      {user.username?.[0]?.toUpperCase()}
                    </span>
                    <span className="hidden sm:inline">{user.username}</span>
                  </span>
                </NavLink>
                {user.role === 'ADMIN' && (
                  <NavLink to="/admin" className={linkClass}>Admin</NavLink>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

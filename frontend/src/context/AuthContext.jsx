import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMe } from '../services/usersService'
import { login as loginApi, register as registerApi } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    try {
      const { data } = await getMe()
      setUser(data)
    } catch {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMe() }, [fetchMe])

  const login = async (credentials) => {
    const { data } = await loginApi(credentials)
    localStorage.setItem('token', data.accessToken)
    await fetchMe()
  }

  const register = async (credentials) => {
    await registerApi(credentials)
    await login({ email: credentials.email, password: credentials.password })
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser: fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

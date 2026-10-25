import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const raw = localStorage.getItem('siaga_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)
  const [token, setToken] = useState(() => localStorage.getItem('siaga_token'))
  const [initializing, setInitializing] = useState(Boolean(localStorage.getItem('siaga_token')))

  const clearSession = useCallback(() => {
    localStorage.removeItem('siaga_token')
    localStorage.removeItem('siaga_user')
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    let active = true

    async function validate() {
      if (!token) {
        setInitializing(false)
        return
      }
      try {
        const { data } = await api.get('/me')
        if (!active) return
        setUser(data.user)
        localStorage.setItem('siaga_user', JSON.stringify(data.user))
      } catch {
        if (active) clearSession()
      } finally {
        if (active) setInitializing(false)
      }
    }

    validate()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => clearSession()
    window.addEventListener('siaga:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('siaga:unauthorized', handleUnauthorized)
  }, [clearSession])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/login', { email, password })
    localStorage.setItem('siaga_token', data.token)
    localStorage.setItem('siaga_user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      if (localStorage.getItem('siaga_token')) {
        await api.post('/logout')
      }
    } catch {
      // abaikan kegagalan API saat logout
    } finally {
      clearSession()
    }
  }, [clearSession])

  const refreshUser = useCallback(async () => {
    const { data } = await api.get('/me')
    setUser(data.user)
    localStorage.setItem('siaga_user', JSON.stringify(data.user))
    return data.user
  }, [])

  const applyUser = useCallback((nextUser) => {
    setUser(nextUser)
    localStorage.setItem('siaga_user', JSON.stringify(nextUser))
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      initializing,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      refreshUser,
      applyUser,
    }),
    [user, token, initializing, login, logout, refreshUser, applyUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider')
  return context
}

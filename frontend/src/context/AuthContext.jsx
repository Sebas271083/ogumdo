import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getMe, login as apiLogin, logout as apiLogout } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // undefined = todavía no sabemos si hay sesión; null = no hay
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    getMe()
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
  }, [])

  const login = useCallback(async (email, password) => {
    const { user } = await apiLogin(email, password)
    setUser(user)
    return user
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
  }, [])

  const valor = useMemo(() => ({ user, login, logout }), [user, login, logout])
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

import { Navigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

export default function RutaProtegida({ rol, children }) {
  const { user } = useAuth()

  if (user === undefined) return <div className="cargando">Cargando…</div>
  if (!user) return <Navigate to="/login" replace />
  if (rol && user.rol !== rol) return <Navigate to={user.rol === 'admin' ? '/admin' : '/alumno'} replace />
  return children
}

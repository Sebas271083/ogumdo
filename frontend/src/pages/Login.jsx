import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

const destino = (u) => (u.rol === 'admin' ? '/admin' : '/alumno')

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  if (user) return <Navigate to={destino(user)} replace />

  async function enviar(ev) {
    ev.preventDefault()
    const { email, password } = Object.fromEntries(new FormData(ev.currentTarget))
    setEnviando(true)
    setError(null)
    try {
      navigate(destino(await login(email, password)))
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card panel">
        <img className="auth-logo" src="/img/logo.jpg" alt="" />
        <h1>
          Acceso <span className="accent">alumnos</span>
        </h1>
        <p className="muted centrado">Ingresá para ver tus graduaciones, títulos, capacitaciones y logros.</p>
        <form className="form" onSubmit={enviar}>
          <label>
            Email
            <input name="email" type="email" required autoComplete="username" />
          </label>
          <label>
            Contraseña
            <input name="password" type="password" required autoComplete="current-password" />
          </label>
          {error && (
            <div className="form-msg error" role="alert">
              {error}
            </div>
          )}
          <button className="btn" type="submit" disabled={enviando}>
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
        <p className="muted centrado nota">¿No tenés usuario o te olvidaste la contraseña? Pedíselo a tu Sabonim.</p>
      </div>
    </div>
  )
}

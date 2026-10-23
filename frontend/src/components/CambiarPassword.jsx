import { useNavigate } from 'react-router'
import { cambiarPassword } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function CambiarPassword() {
  const toast = useToast()
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function enviar(ev) {
    ev.preventDefault()
    const form = ev.currentTarget
    const { actual, nueva } = Object.fromEntries(new FormData(form))
    try {
      await cambiarPassword(actual, nueva)
      form.reset()
      toast('Contraseña actualizada')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function salir() {
    await logout()
    navigate('/')
  }

  return (
    <form className="form" onSubmit={enviar} style={{ maxWidth: 520 }}>
      <label>
        Contraseña actual
        <input type="password" name="actual" required autoComplete="current-password" />
      </label>
      <label>
        Nueva contraseña (mínimo 8 caracteres)
        <input type="password" name="nueva" required minLength={8} autoComplete="new-password" />
      </label>
      <div className="botones">
        <button className="btn btn-sm" type="submit">
          Actualizar
        </button>
        <button className="btn btn-sm btn-dark" type="button" onClick={salir}>
          Cerrar sesión
        </button>
      </div>
    </form>
  )
}

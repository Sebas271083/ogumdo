import { useCallback, useEffect, useState } from 'react'
import { borrarAviso, getAvisos, publicarAviso } from '../../api/client'
import { useToast } from '../../context/ToastContext'
import AppYNotificaciones from '../../components/AppYNotificaciones'
import Avisos from '../../components/Avisos'
import ProximasClases from '../../components/ProximasClases'

export default function AdminClases() {
  const toast = useToast()
  const [avisos, setAvisos] = useState([])
  const [enviando, setEnviando] = useState(false)

  const cargarAvisos = useCallback(() => getAvisos().then(setAvisos), [])

  useEffect(() => {
    cargarAvisos().catch(() => {})
  }, [cargarAvisos])

  async function enviar(ev) {
    ev.preventDefault()
    const form = ev.currentTarget
    const { titulo, mensaje } = Object.fromEntries(new FormData(form))
    if (!confirm('Este aviso les llega como notificación a todos los alumnos. ¿Enviar?')) return
    setEnviando(true)
    try {
      const { enviados } = await publicarAviso(titulo, mensaje)
      toast(`Aviso publicado · ${enviados} ${enviados === 1 ? 'notificación enviada' : 'notificaciones enviadas'}`)
      form.reset()
      cargarAvisos()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setEnviando(false)
    }
  }

  async function borrar(aviso) {
    if (!confirm(`¿Borrar el aviso "${aviso.titulo}"?`)) return
    try {
      await borrarAviso(aviso.id)
      cargarAvisos()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <>
      <AppYNotificaciones />
      <div className="panel">
        <h2>Próximas clases</h2>
        <p className="muted">Quién viene a cada clase en los próximos 7 días. Si cancelás una, se avisa a sus alumnos.</p>
        <ProximasClases modo="admin" />
      </div>

      <div className="panel">
        <h2>Enviar un aviso</h2>
        <form className="form" onSubmit={enviar}>
          <label>
            Título
            <input name="titulo" required maxLength={120} placeholder="Ej: Examen de graduación" />
          </label>
          <label>
            Mensaje
            <textarea
              name="mensaje"
              className="corto"
              required
              maxLength={1000}
              placeholder="Ej: El sábado 15 a las 10 hs es el examen. Traer el dobok limpio."
            />
          </label>
          <div>
            <button className="btn btn-sm" type="submit" disabled={enviando}>
              {enviando ? 'Enviando…' : 'Publicar y notificar'}
            </button>
          </div>
        </form>
        <h3 className="subtitulo">Avisos publicados</h3>
        <Avisos avisos={avisos} onBorrar={borrar} />
      </div>
    </>
  )
}

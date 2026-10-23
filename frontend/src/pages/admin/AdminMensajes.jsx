import { borrarMensaje, marcarMensaje } from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { fecha } from '../../utils/format'

export default function AdminMensajes({ mensajes, onCambio }) {
  const toast = useToast()

  async function ejecutar(accion) {
    try {
      await accion()
      onCambio()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <div className="panel">
      <h2>Mensajes de contacto</h2>
      {mensajes.length === 0 && <div className="empty">No hay mensajes todavía.</div>}
      {mensajes.map((m) => (
        <div key={m.id} className={`msg ${m.leido ? '' : 'unread'}`}>
          <h4>{m.nombre}</h4>
          <div className="meta">
            <a href={`mailto:${m.email}`}>{m.email}</a>
            {m.telefono && ` · ${m.telefono}`} · {fecha(m.creado_ts)}
          </div>
          <p>{m.mensaje}</p>
          <div className="botones">
            <button className="btn btn-sm btn-dark" onClick={() => ejecutar(() => marcarMensaje(m.id, !m.leido))}>
              {m.leido ? 'Marcar no leído' : 'Marcar leído'}
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => confirm('¿Borrar este mensaje?') && ejecutar(() => borrarMensaje(m.id))}
            >
              Borrar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

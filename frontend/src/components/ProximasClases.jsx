import { useCallback, useEffect, useState } from 'react'
import { cancelarClase, getProximasClases, reactivarClase, recordarClase, responderClase } from '../api/client'
import { useToast } from '../context/ToastContext'
import { fechaClase } from '../utils/format'

function Clase({ c, modo, onResponder, onCancelar, onReactivar, onRecordar, ocupado }) {
  const [abierta, setAbierta] = useState(false)
  const puedeResponder = modo === 'alumno' && !c.cancelada && !c.empezada

  return (
    <article className={`clase ${c.cancelada ? 'cancelada' : ''} ${c.miRespuesta === true ? 'voy' : ''}`}>
      <div className="clase-cuando">
        <strong>{fechaClase(c.fecha)}</strong>
        <span>{c.inicio}</span>
      </div>
      <div className="clase-info">
        <h4>{c.nombre}</h4>
        {c.cancelada ? (
          <p className="clase-cancelada">Cancelada{c.motivo ? ` · ${c.motivo}` : ''}</p>
        ) : (
          <button className="clase-van" onClick={() => setAbierta((a) => !a)} aria-expanded={abierta}>
            <strong>{c.van.length}</strong> {c.van.length === 1 ? 'va' : 'van'}
            {c.noVan > 0 && <span className="muted"> · {c.noVan} no</span>}
            {c.van.length > 0 && <span className="muted"> · {abierta ? 'ocultar' : 'ver quiénes'}</span>}
          </button>
        )}
        {abierta && c.van.length > 0 && <p className="clase-lista">{c.van.map((p) => p.nombre).join(', ')}</p>}
      </div>

      <div className="clase-acciones">
        {puedeResponder && (
          <>
            <button
              className={`btn-asistencia si ${c.miRespuesta === true ? 'activo' : ''}`}
              disabled={ocupado}
              onClick={() => onResponder(c, c.miRespuesta === true ? null : true)}
            >
              ✔ Voy
            </button>
            <button
              className={`btn-asistencia no ${c.miRespuesta === false ? 'activo' : ''}`}
              disabled={ocupado}
              onClick={() => onResponder(c, c.miRespuesta === false ? null : false)}
            >
              ✖ No voy
            </button>
          </>
        )}
        {modo === 'alumno' && c.empezada && !c.cancelada && <span className="muted">En curso</span>}
        {modo === 'admin' &&
          (c.cancelada ? (
            <button className="btn btn-sm btn-dark" disabled={ocupado} onClick={() => onReactivar(c)}>
              Reactivar
            </button>
          ) : (
            <>
              {!c.empezada && (
                <button className="btn btn-sm btn-dark" disabled={ocupado} onClick={() => onRecordar(c)}>
                  🔔 Recordar
                </button>
              )}
              <button className="btn btn-sm btn-danger" disabled={ocupado} onClick={() => onCancelar(c)}>
                Cancelar clase
              </button>
            </>
          ))}
      </div>
    </article>
  )
}

// modo "alumno": botones Voy / No voy. modo "admin": recordar, cancelar o reactivar cada clase.
export default function ProximasClases({ modo = 'alumno' }) {
  const toast = useToast()
  const [clases, setClases] = useState(null)
  const [ocupado, setOcupado] = useState(false)

  const cargar = useCallback(
    () =>
      getProximasClases()
        .then((d) => setClases(d.clases))
        .catch((err) => toast(err.message, 'error')),
    [toast],
  )

  useEffect(() => {
    cargar()
    // Si la app queda abierta, se refresca al volver a ella (por ejemplo después de una notificación)
    const alVolver = () => document.visibilityState === 'visible' && cargar()
    document.addEventListener('visibilitychange', alVolver)
    return () => document.removeEventListener('visibilitychange', alVolver)
  }, [cargar])

  async function ejecutar(accion, mensaje) {
    setOcupado(true)
    try {
      await accion()
      if (mensaje) toast(mensaje)
      await cargar()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setOcupado(false)
    }
  }

  const responder = (c, asiste) =>
    ejecutar(
      () => responderClase(c.claseId, c.fecha, asiste),
      asiste === true ? '¡Te esperamos! 🥋' : asiste === false ? 'Anotado, ¡nos vemos la próxima!' : null,
    )

  const cancelar = (c) => {
    const motivo = prompt(`¿Cancelar ${c.nombre} (${fechaClase(c.fecha)} ${c.inicio})?\nMotivo opcional, les llega a los alumnos:`)
    if (motivo === null) return
    ejecutar(() => cancelarClase(c.claseId, c.fecha, motivo), 'Clase cancelada y alumnos avisados')
  }

  const reactivar = (c) => ejecutar(() => reactivarClase(c.claseId, c.fecha), 'Clase reactivada y alumnos avisados')

  // Recordatorio manual: solo a los alumnos de la clase que todavía no respondieron
  async function recordar(c) {
    if (!confirm(`¿Mandar el recordatorio de ${c.nombre} (${fechaClase(c.fecha)} ${c.inicio}) a los que todavía no respondieron?`)) {
      return
    }
    setOcupado(true)
    try {
      const { alumnos, enviados } = await recordarClase(c.claseId, c.fecha)
      if (alumnos === 0) toast('Todos los alumnos de esta clase ya respondieron 👍')
      else if (enviados === 0) toast(`${alumnos} sin responder, pero ninguno tiene las notificaciones activadas`, 'error')
      else toast(`Recordatorio enviado · ${alumnos} ${alumnos === 1 ? 'alumno' : 'alumnos'} sin responder`)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setOcupado(false)
    }
  }

  if (!clases) return <div className="cargando-chico">Cargando clases…</div>
  if (!clases.length) return <div className="empty">No hay clases en los próximos 7 días.</div>

  return (
    <div className="clases">
      {clases.map((c) => (
        <Clase
          key={`${c.claseId}-${c.fecha}`}
          c={c}
          modo={modo}
          ocupado={ocupado}
          onResponder={responder}
          onCancelar={cancelar}
          onReactivar={reactivar}
          onRecordar={recordar}
        />
      ))}
    </div>
  )
}

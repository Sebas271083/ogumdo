import { useEffect, useState } from 'react'
import { useToast } from '../context/ToastContext'
import { alCambiarInstalable, instalar, sePuedeInstalar } from '../utils/instalacion'
import {
  activarNotificaciones,
  desactivarNotificaciones,
  esAppInstalada,
  esIos,
  pushSoportado,
  suscripcionActual,
} from '../utils/push'

// Bloque del panel: "Instalar app" + "Activar notificaciones". Se oculta solo cuando no hay nada que hacer.
export default function AppYNotificaciones() {
  const toast = useToast()
  const [instalable, setInstalable] = useState(sePuedeInstalar())
  const [activas, setActivas] = useState(null)
  const [ocupado, setOcupado] = useState(false)
  const [entorno, setEntorno] = useState({ soportado: false, ios: false, instalada: false })

  useEffect(() => {
    setEntorno({ soportado: pushSoportado(), ios: esIos(), instalada: esAppInstalada() })
    suscripcionActual()
      .then((s) => setActivas(Boolean(s)))
      .catch(() => setActivas(false))
    return alCambiarInstalable(setInstalable)
  }, [])

  async function alternar() {
    setOcupado(true)
    try {
      if (activas) {
        await desactivarNotificaciones()
        setActivas(false)
        toast('Notificaciones desactivadas en este dispositivo')
      } else {
        await activarNotificaciones()
        setActivas(true)
        toast('¡Listo! Te mandamos una notificación de prueba')
      }
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setOcupado(false)
    }
  }

  // iPhone: las notificaciones solo existen con la web agregada a la pantalla de inicio
  const iosSinInstalar = entorno.ios && !entorno.instalada
  if (activas && !instalable) return null

  return (
    <div className="panel app-notis">
      <div>
        <h3>🔔 No te pierdas ninguna clase</h3>
        <p className="muted">
          Instalá la app y activá las notificaciones: te recordamos cada clase y podés responder <strong>Voy</strong> o{' '}
          <strong>No voy</strong> desde la misma notificación.
        </p>
        {iosSinInstalar && (
          <p className="nota-ios">
            En iPhone: tocá <strong>Compartir</strong> ⬆️ y después <strong>“Agregar a pantalla de inicio”</strong>. Abrí la
            app desde ese ícono para activar las notificaciones.
          </p>
        )}
      </div>
      <div className="botones">
        {instalable && (
          <button className="btn btn-sm btn-dark" onClick={() => instalar()}>
            📲 Instalar app
          </button>
        )}
        {entorno.soportado && !iosSinInstalar && activas !== null && (
          <button className={`btn btn-sm ${activas ? 'btn-dark' : ''}`} disabled={ocupado} onClick={alternar}>
            {activas ? 'Desactivar notificaciones' : 'Activar notificaciones'}
          </button>
        )}
      </div>
    </div>
  )
}

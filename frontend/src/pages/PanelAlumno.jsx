import { useEffect, useState } from 'react'
import { getPerfil } from '../api/client'
import { CINTURONES, indiceCinturon, nombreCinturon } from '../utils/cinturones'
import { antiguedad, fecha, iniciales } from '../utils/format'
import CambiarPassword from '../components/CambiarPassword'
import Cinturon from '../components/Cinturon'
import RegistrosTabs from '../components/RegistrosTabs'

export default function PanelAlumno() {
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getPerfil()
      .then(setDatos)
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <div className="cargando">{error}</div>
  if (!datos) return <div className="cargando">Cargando…</div>

  const { user: u, registros } = datos
  const cuenta = (tipo) => registros.filter((r) => r.tipo === tipo).length
  const kpis = [
    [antiguedad(u.fecha_ingreso), 'Entrenando'],
    [cuenta('graduacion'), 'Graduaciones'],
    [cuenta('titulo') + cuenta('capacitacion'), 'Títulos y capacitaciones'],
    [cuenta('logro'), 'Logros y medallas'],
  ]
  // Todos los Gup y, si ya es cinturón negro, hasta su Dan actual
  const actual = indiceCinturon(u.cinturon_actual)
  const progreso = CINTURONES.slice(0, Math.max(actual, 10) + 1)

  return (
    <>
      <div className="page-hero">
        <div className="container dash-hero">
          <div className="avatar">{iniciales(u.nombre)}</div>
          <div>
            <span className="eyebrow">Mi panel</span>
            <h1>{u.nombre}</h1>
            {u.fecha_ingreso && <span className="muted">Alumno desde {fecha(u.fecha_ingreso)}</span>}
          </div>
          <div className="belt-box">
            <Cinturon id={u.cinturon_actual} grande />
            <small>{nombreCinturon(u.cinturon_actual)}</small>
          </div>
        </div>
      </div>

      <section className="sin-padding-top">
        <div className="container">
          <div className="kpis">
            {kpis.map(([valor, etiqueta]) => (
              <div className="kpi" key={etiqueta}>
                <strong>{valor}</strong>
                <span>{etiqueta}</span>
              </div>
            ))}
          </div>

          <div className="panel">
            <h2>Mi progreso</h2>
            <p className="muted">Cinturones que ya alcanzaste en tu camino.</p>
            <div className="belt-progress">
              {progreso.map((c, i) => (
                <Cinturon key={c.id} id={c.id} className={`${i <= actual ? 'done' : ''} ${i === actual ? 'current' : ''}`} />
              ))}
            </div>
          </div>

          <div className="panel">
            <h2>Mi historial</h2>
            <RegistrosTabs registros={registros} />
          </div>

          <div className="panel">
            <h2>Cambiar contraseña</h2>
            <CambiarPassword />
          </div>
        </div>
      </section>
    </>
  )
}

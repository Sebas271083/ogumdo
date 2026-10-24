import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getEventos } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useDatosIniciales } from '../context/DatosContext'
import { mesAnio } from '../utils/format'
import Evento from '../components/Evento'
import PageHero from '../components/PageHero'

// Separa próximos (agrupados por mes) y pasados, usando el "hoy" del servidor (hora argentina)
export function separarEventos({ hoy, eventos }) {
  const proximos = eventos.filter((e) => (e.fecha_fin || e.fecha) >= hoy)
  const pasados = eventos.filter((e) => (e.fecha_fin || e.fecha) < hoy).reverse()
  const porMes = []
  for (const e of proximos) {
    const mes = mesAnio(e.fecha)
    if (porMes.at(-1)?.mes !== mes) porMes.push({ mes, eventos: [] })
    porMes.at(-1).eventos.push(e)
  }
  return { porMes, pasados }
}

export default function Calendario() {
  const { calendario } = useDatosIniciales()
  const { user } = useAuth()
  const [datos, setDatos] = useState(calendario ?? null)

  // Con sesión vuelve a pedir los eventos: incluye los que son solo para alumnos
  useEffect(() => {
    getEventos()
      .then(setDatos)
      .catch(() => {})
  }, [user])

  const { porMes, pasados } = datos ? separarEventos(datos) : { porMes: [], pasados: [] }

  return (
    <>
      <PageHero
        eyebrow="Calendario"
        titulo={
          <>
            Fechas <span className="accent">importantes</span>
          </>
        }
      >
        <p>Exámenes de graduación, torneos, seminarios y días sin clase.</p>
      </PageHero>

      <section>
        <div className="container calendario">
          {!datos && <div className="cargando-chico">Cargando…</div>}
          {datos && porMes.length === 0 && <div className="empty">No hay fechas próximas cargadas por ahora.</div>}
          {porMes.map(({ mes, eventos }) => (
            <div key={mes} className="mes">
              <h2>{mes}</h2>
              <div className="eventos">
                {eventos.map((e) => (
                  <Evento key={e.id} e={e} />
                ))}
              </div>
            </div>
          ))}

          {!user && (
            <p className="muted nota-alumnos">
              Los alumnos ven también los eventos internos <Link to="/login">iniciando sesión</Link>.
            </p>
          )}

          {pasados.length > 0 && (
            <details className="pasados">
              <summary>Fechas pasadas ({pasados.length})</summary>
              <div className="eventos">
                {pasados.map((e) => (
                  <Evento key={e.id} e={e} pasado />
                ))}
              </div>
            </details>
          )}
        </div>
      </section>
    </>
  )
}

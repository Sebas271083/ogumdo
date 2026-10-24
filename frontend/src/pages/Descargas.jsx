import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getDescargas } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useDatosIniciales } from '../context/DatosContext'
import { CATEGORIAS_DESCARGA } from '../utils/catalogos'
import { tamanoArchivo } from '../utils/format'
import PageHero from '../components/PageHero'

const extension = (nombre = '') => nombre.split('.').pop().toLowerCase()

export function Archivo({ d, acciones }) {
  const ext = extension(d.archivo_nombre)
  return (
    <article className="archivo">
      <div className={`archivo-ext ext-${ext}`}>{ext.toUpperCase()}</div>
      <div className="archivo-info">
        <h4>
          {d.titulo} {!d.publico && <span className="chip privado">Solo alumnos</span>}
        </h4>
        {d.descripcion && <p className="muted">{d.descripcion}</p>}
        <span className="archivo-peso">{tamanoArchivo(d.tamano)}</span>
      </div>
      <div className="archivo-acciones">
        {acciones ?? (
          <>
            {ext === 'pdf' && (
              <a className="btn btn-sm btn-dark" href={`${d.url}?ver`} target="_blank" rel="noopener noreferrer">
                Ver
              </a>
            )}
            <a className="btn btn-sm" href={d.url}>
              Descargar
            </a>
          </>
        )}
      </div>
    </article>
  )
}

export default function Descargas() {
  const { descargas } = useDatosIniciales()
  const { user } = useAuth()
  const [lista, setLista] = useState(descargas ?? null)

  // Con sesión vuelve a pedir la lista: incluye el material solo para alumnos
  useEffect(() => {
    getDescargas()
      .then(setLista)
      .catch(() => {})
  }, [user])

  const categorias = Object.entries(CATEGORIAS_DESCARGA)
    .map(([id, c]) => ({ id, ...c, archivos: (lista ?? []).filter((d) => d.categoria === id) }))
    .filter((c) => c.archivos.length)

  return (
    <>
      <PageHero
        eyebrow="Descargas"
        titulo={
          <>
            Material de <span className="accent">estudio</span>
          </>
        }
      >
        <p>Historia del taekwondo, reglamentos, terminología coreana y material para practicar.</p>
      </PageHero>

      <section>
        <div className="container descargas">
          {!lista && <div className="cargando-chico">Cargando…</div>}
          {lista && categorias.length === 0 && <div className="empty">Todavía no hay material para descargar.</div>}
          {categorias.map((c) => (
            <div key={c.id} className="categoria">
              <h2>
                {c.icono} {c.label}
              </h2>
              <div className="archivos">
                {c.archivos.map((d) => (
                  <Archivo key={d.id} d={d} />
                ))}
              </div>
            </div>
          ))}
          {!user && (
            <p className="muted nota-alumnos">
              Los alumnos tienen material adicional <Link to="/login">iniciando sesión</Link>.
            </p>
          )}
        </div>
      </section>
    </>
  )
}

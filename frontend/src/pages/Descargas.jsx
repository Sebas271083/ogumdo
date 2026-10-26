import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getDescargas, getEnlaces } from '../api/client'
import { dominio, idYoutube } from '../utils/youtube'
import VideoYoutube from '../components/VideoYoutube'
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

// Video de YouTube con su título (acciones: botones del panel del Sabonim)
export function Video({ e, acciones }) {
  return (
    <article className="video-card">
      <VideoYoutube id={idYoutube(e.url)} titulo={e.titulo} />
      <div>
        <h4>
          {e.titulo} {!e.publico && <span className="chip privado">Solo alumnos</span>}
        </h4>
        {e.descripcion && <p className="muted">{e.descripcion}</p>}
        {acciones && <div className="archivo-acciones">{acciones}</div>}
      </div>
    </article>
  )
}

// Link externo que no es video
export function Enlace({ e, acciones }) {
  return (
    <article className="archivo">
      <div className="archivo-ext ext-link">🔗</div>
      <div className="archivo-info">
        <h4>
          {e.titulo} {!e.publico && <span className="chip privado">Solo alumnos</span>}
        </h4>
        {e.descripcion && <p className="muted">{e.descripcion}</p>}
        <span className="archivo-peso">{dominio(e.url)}</span>
      </div>
      <div className="archivo-acciones">
        {acciones ?? (
          <a className="btn btn-sm btn-dark" href={e.url} target="_blank" rel="noopener noreferrer">
            Abrir ↗
          </a>
        )}
      </div>
    </article>
  )
}

export default function Descargas() {
  const { descargas } = useDatosIniciales()
  const { enlaces: enlacesIniciales } = useDatosIniciales()
  const { user } = useAuth()
  const [lista, setLista] = useState(descargas ?? null)
  const [enlaces, setEnlaces] = useState(enlacesIniciales ?? [])

  // Con sesión vuelve a pedir todo: incluye el material solo para alumnos
  useEffect(() => {
    getDescargas()
      .then(setLista)
      .catch(() => {})
    getEnlaces()
      .then(setEnlaces)
      .catch(() => {})
  }, [user])

  const categorias = Object.entries(CATEGORIAS_DESCARGA)
    .map(([id, c]) => {
      const deEsta = enlaces.filter((e) => e.categoria === id)
      return {
        id,
        ...c,
        archivos: (lista ?? []).filter((d) => d.categoria === id),
        videos: deEsta.filter((e) => idYoutube(e.url)),
        links: deEsta.filter((e) => !idYoutube(e.url)),
      }
    })
    .filter((c) => c.archivos.length || c.videos.length || c.links.length)

  return (
    <>
      <PageHero
        eyebrow="Material"
        titulo={
          <>
            Material de <span className="accent">estudio</span>
          </>
        }
      >
        <p>Historia del taekwondo, reglamentos, terminología coreana, videos y material para practicar.</p>
      </PageHero>

      <section>
        <div className="container descargas">
          {!lista && <div className="cargando-chico">Cargando…</div>}
          {lista && categorias.length === 0 && <div className="empty">Todavía no hay material cargado.</div>}
          {categorias.map((c) => (
            <div key={c.id} className="categoria">
              <h2>
                {c.icono} {c.label}
              </h2>
              {c.videos.length > 0 && (
                <div className="videos">
                  {c.videos.map((e) => (
                    <Video key={e.id} e={e} />
                  ))}
                </div>
              )}
              <div className="archivos">
                {c.archivos.map((d) => (
                  <Archivo key={d.id} d={d} />
                ))}
                {c.links.map((e) => (
                  <Enlace key={e.id} e={e} />
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

import { useEffect, useState } from 'react'
import { getAlbumes, getGaleria } from '../api/client'
import { useDatosIniciales } from '../context/DatosContext'
import { fecha } from '../utils/format'
import Galeria from '../components/Galeria'
import PageHero from '../components/PageHero'

export default function GaleriaPage() {
  const inicial = useDatosIniciales()
  const [fotos, setFotos] = useState(inicial.galeria ?? null)
  const [albumes, setAlbumes] = useState(inicial.albumes ?? [])
  // "todas", "dojang" (fotos sin álbum) o el id de un álbum
  const [filtro, setFiltro] = useState('todas')

  useEffect(() => {
    getGaleria()
      .then(setFotos)
      .catch(() => setFotos([]))
    getAlbumes()
      .then(setAlbumes)
      .catch(() => {})
  }, [])

  const visibles = (fotos ?? []).filter((f) =>
    filtro === 'todas' ? true : filtro === 'dojang' ? f.albumId === null : f.albumId === filtro,
  )
  const albumElegido = albumes.find((a) => a.id === filtro)
  const conFotos = albumes.filter((a) => a.cantidad > 0)
  const hayDojang = (fotos ?? []).some((f) => f.albumId === null)

  return (
    <>
      <PageHero
        eyebrow="Galería"
        titulo={
          <>
            Momentos en el <span className="accent">dojang</span>
          </>
        }
      >
        <p>Clases, exámenes de graduación, torneos y eventos de nuestra escuela.</p>
      </PageHero>
      <section>
        <div className="container">
          {conFotos.length > 0 && (
            <div className="filtros" role="tablist" aria-label="Álbumes">
              <button className={filtro === 'todas' ? 'activo' : ''} onClick={() => setFiltro('todas')}>
                Todas
              </button>
              {hayDojang && (
                <button className={filtro === 'dojang' ? 'activo' : ''} onClick={() => setFiltro('dojang')}>
                  Dojang
                </button>
              )}
              {conFotos.map((a) => (
                <button key={a.id} className={filtro === a.id ? 'activo' : ''} onClick={() => setFiltro(a.id)}>
                  {a.nombre}
                  <span className="count">{a.cantidad}</span>
                </button>
              ))}
            </div>
          )}

          {albumElegido && (
            <div className="album-info">
              <h2>{albumElegido.nombre}</h2>
              <p className="muted">{[albumElegido.fecha && fecha(albumElegido.fecha), albumElegido.descripcion].filter(Boolean).join(' · ')}</p>
            </div>
          )}

          {fotos ? <Galeria key={filtro} fotos={visibles} /> : <div className="cargando">Cargando…</div>}
        </div>
      </section>
    </>
  )
}

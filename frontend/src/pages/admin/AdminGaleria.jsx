import { useCallback, useEffect, useState } from 'react'
import {
  borrarAlbum,
  borrarFoto,
  crearAlbum,
  elegirDestacada,
  getAlbumes,
  getDestacadas,
  getGaleria,
  moverFoto,
  subirFotos,
} from '../../api/client'

const LUGARES = [
  ['inicio', 'Inicio'],
  ['historia', 'Historia'],
]
import { useToast } from '../../context/ToastContext'
import { fecha } from '../../utils/format'

function OpcionesAlbum({ albumes }) {
  return (
    <>
      <option value="dojang">Dojang (fotos generales)</option>
      {albumes.map((a) => (
        <option key={a.id} value={a.id}>
          {a.nombre}
        </option>
      ))}
    </>
  )
}

export default function AdminGaleria() {
  const toast = useToast()
  const [fotos, setFotos] = useState([])
  const [albumes, setAlbumes] = useState([])
  const [subiendo, setSubiendo] = useState(false)
  const [filtro, setFiltro] = useState('todas')
  const [destacadas, setDestacadas] = useState({})

  const recargar = useCallback(
    () =>
      Promise.all([getGaleria().then(setFotos), getAlbumes().then(setAlbumes), getDestacadas().then(setDestacadas)]),
    [],
  )

  // Tocar la estrella de la foto ya elegida la quita (vuelve a la automática)
  function destacar(lugar, foto) {
    const yaEsta = destacadas[lugar]?.id === foto.id
    const nombre = LUGARES.find(([id]) => id === lugar)[1]
    ejecutar(
      () => elegirDestacada(lugar, yaEsta ? null : foto.id),
      yaEsta ? `${nombre}: vuelve a usar la foto más reciente` : `Foto elegida para ${nombre}`,
    )
  }

  useEffect(() => {
    recargar().catch(() => {})
  }, [recargar])

  async function ejecutar(accion, mensaje) {
    try {
      const resultado = await accion()
      if (mensaje) toast(typeof mensaje === 'function' ? mensaje(resultado) : mensaje)
      await recargar()
      return true
    } catch (err) {
      toast(err.message, 'error')
      return false
    }
  }

  async function subir(ev) {
    ev.preventDefault()
    const form = ev.currentTarget
    setSubiendo(true)
    const ok = await ejecutar(
      () => subirFotos(new FormData(form)),
      ({ cantidad }) => (cantidad === 1 ? 'Foto subida' : `${cantidad} fotos subidas`),
    )
    if (ok) form.reset()
    setSubiendo(false)
  }

  async function nuevoAlbum(ev) {
    ev.preventDefault()
    const form = ev.currentTarget
    if (await ejecutar(() => crearAlbum(Object.fromEntries(new FormData(form))), 'Álbum creado')) form.reset()
  }

  function eliminarAlbum(a) {
    if (!confirm(`¿Borrar el álbum "${a.nombre}"? Sus ${a.cantidad} fotos no se borran: pasan a "Dojang".`)) return
    ejecutar(() => borrarAlbum(a.id), 'Álbum borrado')
  }

  function eliminarFoto(foto) {
    if (!confirm('¿Borrar esta foto de la galería?')) return
    ejecutar(() => borrarFoto(foto.id), 'Foto borrada')
  }

  const visibles = fotos.filter((f) =>
    filtro === 'todas' ? true : filtro === 'dojang' ? f.albumId === null : f.albumId === Number(filtro),
  )

  return (
    <>
      <div className="panel">
        <h2>Fotos de Inicio e Historia</h2>
        <p className="muted">
          Tocá <strong>★ Inicio</strong> o <strong>★ Historia</strong> en cualquier foto de abajo para elegir cuál se muestra en
          esas páginas. Si no elegís ninguna, se usa la más reciente.
        </p>
        <div className="destacadas">
          {LUGARES.map(([lugar, nombre]) => (
            <figure key={lugar}>
              {destacadas[lugar] ? (
                <img src={destacadas[lugar].url} alt={`Foto de ${nombre}`} />
              ) : (
                <div className="destacada-auto">Automática</div>
              )}
              <figcaption>
                <strong>{nombre}</strong>
                {destacadas[lugar] && (
                  <button
                    className="btn btn-sm btn-dark"
                    onClick={() => ejecutar(() => elegirDestacada(lugar, null), `${nombre}: vuelve a usar la foto más reciente`)}
                  >
                    Usar automática
                  </button>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Álbumes de eventos</h2>
        <p className="muted">Agrupá las fotos de un examen, torneo o evento. Las fotos sin álbum quedan en “Dojang”.</p>
        <form className="form" onSubmit={nuevoAlbum}>
          <div className="form-row">
            <label>
              Nombre del álbum
              <input name="nombre" required maxLength={120} placeholder="Ej: Examen de graduación diciembre 2026" />
            </label>
            <label>
              Fecha del evento
              <input name="fecha" type="date" />
            </label>
          </div>
          <label>
            Descripción (opcional)
            <input name="descripcion" maxLength={300} />
          </label>
          <div>
            <button className="btn btn-sm" type="submit">
              Crear álbum
            </button>
          </div>
        </form>
        {albumes.length > 0 && (
          <div className="lista-simple">
            {albumes.map((a) => (
              <div key={a.id}>
                <span>
                  <strong>{a.nombre}</strong>{' '}
                  <span className="muted">
                    {[a.fecha && fecha(a.fecha), `${a.cantidad} ${a.cantidad === 1 ? 'foto' : 'fotos'}`].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <button className="btn btn-sm btn-danger" onClick={() => eliminarAlbum(a)}>
                  Borrar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <h2>Subir fotos</h2>
        <form className="form" onSubmit={subir}>
          <div className="form-row">
            <label>
              Fotos (podés elegir varias, máx. 8 MB c/u)
              <input type="file" name="fotos" accept="image/jpeg,image/png,image/webp,image/gif" multiple required />
            </label>
            <label>
              Álbum
              <select name="album_id" defaultValue="dojang">
                <OpcionesAlbum albumes={albumes} />
              </select>
            </label>
          </div>
          <label>
            Descripción (opcional, se aplica a todas)
            <input name="titulo" maxLength={150} placeholder="Ej: Entrega de cinturones" />
          </label>
          <div>
            <button className="btn btn-sm" type="submit" disabled={subiendo}>
              {subiendo ? 'Subiendo…' : 'Subir'}
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-titulo">
          <h2>Fotos publicadas ({visibles.length})</h2>
          <select value={filtro} onChange={(ev) => setFiltro(ev.target.value)} aria-label="Filtrar por álbum">
            <option value="todas">Todas</option>
            <OpcionesAlbum albumes={albumes} />
          </select>
        </div>
        {visibles.length === 0 ? (
          <div className="empty">No hay fotos acá.</div>
        ) : (
          <div className="gallery admin-gallery">
            {visibles.map((f) => (
              <figure key={f.id}>
                <img src={f.url} alt={f.titulo || ''} loading="lazy" />
                <figcaption>
                  <span>{f.titulo || 'Sin descripción'}</span>
                  <div className="botones-destacar">
                    {LUGARES.map(([lugar, nombre]) => (
                      <button
                        key={lugar}
                        className={`btn-destacar ${destacadas[lugar]?.id === f.id ? 'activo' : ''}`}
                        onClick={() => destacar(lugar, f)}
                        title={`Mostrar esta foto en ${nombre}`}
                      >
                        ★ {nombre}
                      </button>
                    ))}
                  </div>
                  <select
                    value={f.albumId ?? 'dojang'}
                    onChange={(ev) => ejecutar(() => moverFoto(f.id, ev.target.value), 'Foto movida')}
                    aria-label="Mover a álbum"
                  >
                    <OpcionesAlbum albumes={albumes} />
                  </select>
                  <button className="btn btn-sm btn-danger" onClick={() => eliminarFoto(f)}>
                    Borrar
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

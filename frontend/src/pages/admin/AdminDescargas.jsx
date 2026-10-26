import { useCallback, useEffect, useState } from 'react'
import {
  borrarDescarga,
  borrarEnlace,
  crearEnlace,
  editarDescarga,
  editarEnlace,
  getDescargas,
  getEnlaces,
  subirDescarga,
} from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { CATEGORIAS_DESCARGA } from '../../utils/catalogos'
import { idYoutube } from '../../utils/youtube'
import { Archivo, Enlace, Video } from '../Descargas'

const mensajePublicado = (base, notificar, enviados) =>
  notificar ? `${base} · ${enviados} ${enviados === 1 ? 'notificación enviada' : 'notificaciones enviadas'}` : base

function OpcionesCategoria() {
  return Object.entries(CATEGORIAS_DESCARGA).map(([id, c]) => (
    <option key={id} value={id}>
      {c.label}
    </option>
  ))
}

export default function AdminDescargas() {
  const toast = useToast()
  const [lista, setLista] = useState([])
  const [enlaces, setEnlaces] = useState([])
  const [subiendo, setSubiendo] = useState(false)

  const recargar = useCallback(() => Promise.all([getDescargas().then(setLista), getEnlaces().then(setEnlaces)]), [])

  async function agregarEnlace(ev) {
    ev.preventDefault()
    const form = ev.currentTarget
    const fd = new FormData(form)
    try {
      const notificar = fd.has('notificar')
      const { enviados } = await crearEnlace({
        ...Object.fromEntries(fd),
        publico: fd.has('publico'),
        enHistoria: fd.has('enHistoria'),
        notificar,
      })
      toast(mensajePublicado('Enlace agregado', notificar, enviados))
      form.reset()
      recargar()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function cambiarEnlace(e, cambios, mensaje) {
    try {
      await editarEnlace(e.id, { ...e, ...cambios })
      toast(mensaje)
      recargar()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function eliminarEnlace(e) {
    if (!confirm(`¿Borrar "${e.titulo}"?`)) return
    try {
      await borrarEnlace(e.id)
      toast('Enlace borrado')
      recargar()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const accionesEnlace = (e) => (
    <>
      <span className="chip">{CATEGORIAS_DESCARGA[e.categoria]?.label}</span>
      {idYoutube(e.url) && (
        <button
          className={`btn btn-sm ${e.enHistoria ? '' : 'btn-dark'}`}
          onClick={() =>
            cambiarEnlace(
              e,
              { enHistoria: !e.enHistoria, publico: e.enHistoria ? e.publico : true },
              e.enHistoria ? 'Ya no se muestra en Historia' : 'Ahora se muestra en Historia',
            )
          }
        >
          {e.enHistoria ? '★ En Historia' : 'Mostrar en Historia'}
        </button>
      )}
      <button
        className="btn btn-sm btn-dark"
        onClick={() =>
          cambiarEnlace(
            e,
            { publico: !e.publico, enHistoria: e.publico ? false : e.enHistoria },
            e.publico ? 'Ahora solo lo ven los alumnos' : 'Ahora es público',
          )
        }
      >
        {e.publico ? 'Hacer privado' : 'Hacer público'}
      </button>
      <button className="btn btn-sm btn-danger" onClick={() => eliminarEnlace(e)}>
        Borrar
      </button>
    </>
  )

  useEffect(() => {
    recargar().catch(() => {})
  }, [recargar])

  async function subir(ev) {
    ev.preventDefault()
    const form = ev.currentTarget
    setSubiendo(true)
    try {
      const fd = new FormData(form)
      const { enviados } = await subirDescarga(fd)
      toast(mensajePublicado('Archivo publicado', fd.has('notificar'), enviados))
      form.reset()
      recargar()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSubiendo(false)
    }
  }

  async function alternarPublico(d) {
    try {
      await editarDescarga(d.id, { titulo: d.titulo, descripcion: d.descripcion, categoria: d.categoria, publico: !d.publico })
      toast(d.publico ? 'Ahora solo lo ven los alumnos' : 'Ahora es público')
      recargar()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function eliminar(d) {
    if (!confirm(`¿Borrar "${d.titulo}"?`)) return
    try {
      await borrarDescarga(d.id)
      toast('Archivo borrado')
      recargar()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <>
      <div className="panel">
        <h2>Subir material</h2>
        <form className="form" onSubmit={subir}>
          <div className="form-row">
            <label>
              Archivo (PDF, Word, PowerPoint o imagen, máx. 25 MB)
              <input
                type="file"
                name="archivo"
                required
                accept=".pdf,.doc,.docx,.ppt,.pptx,image/jpeg,image/png,image/webp"
              />
            </label>
            <label>
              Categoría
              <select name="categoria" defaultValue="reglamentos">
                <OpcionesCategoria />
              </select>
            </label>
          </div>
          <label>
            Título
            <input name="titulo" required maxLength={150} placeholder="Ej: Reglamento de combate WT 2025" />
          </label>
          <label>
            Descripción (opcional)
            <input name="descripcion" maxLength={300} />
          </label>
          <label className="check">
            <input type="checkbox" name="publico" value="true" defaultChecked />
            Público (si lo desmarcás, solo lo ven los alumnos con sesión iniciada)
          </label>
          <label className="check">
            <input type="checkbox" name="notificar" value="true" defaultChecked />
            Avisar a los alumnos con una notificación
          </label>
          <div>
            <button className="btn btn-sm" type="submit" disabled={subiendo}>
              {subiendo ? 'Subiendo…' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <h2>Agregar un enlace o video</h2>
        <p className="muted">
          Pegá un link de YouTube (se ve en la misma página) o de cualquier otra web, como un reglamento online o un artículo.
        </p>
        <form className="form" onSubmit={agregarEnlace}>
          <div className="form-row">
            <label>
              Link
              <input name="url" type="url" required maxLength={500} placeholder="https://www.youtube.com/watch?v=..." />
            </label>
            <label>
              Categoría
              <select name="categoria" defaultValue="historia">
                <OpcionesCategoria />
              </select>
            </label>
          </div>
          <label>
            Título
            <input name="titulo" required maxLength={150} placeholder="Ej: Historia del Taekwondo (documental)" />
          </label>
          <label>
            Descripción (opcional)
            <input name="descripcion" maxLength={300} />
          </label>
          <label className="check">
            <input type="checkbox" name="publico" defaultChecked />
            Público (si lo desmarcás, solo lo ven los alumnos con sesión iniciada)
          </label>
          <label className="check">
            <input type="checkbox" name="enHistoria" />
            Mostrar también en la página de Historia (solo videos de YouTube públicos)
          </label>
          <label className="check">
            <input type="checkbox" name="notificar" defaultChecked />
            Avisar a los alumnos con una notificación
          </label>
          <div>
            <button className="btn btn-sm" type="submit">
              Agregar
            </button>
          </div>
        </form>
      </div>

      {enlaces.length > 0 && (
        <div className="panel">
          <h2>Enlaces y videos ({enlaces.length})</h2>
          <div className="videos">
            {enlaces
              .filter((e) => idYoutube(e.url))
              .map((e) => (
                <Video key={e.id} e={e} acciones={accionesEnlace(e)} />
              ))}
          </div>
          <div className="archivos">
            {enlaces
              .filter((e) => !idYoutube(e.url))
              .map((e) => (
                <Enlace key={e.id} e={e} acciones={accionesEnlace(e)} />
              ))}
          </div>
        </div>
      )}

      <div className="panel">
        <h2>Archivos publicados ({lista.length})</h2>
        {lista.length === 0 && <div className="empty">Todavía no subiste material.</div>}
        <div className="archivos">
          {lista.map((d) => (
            <Archivo
              key={d.id}
              d={d}
              acciones={
                <>
                  <span className="chip">{CATEGORIAS_DESCARGA[d.categoria]?.label}</span>
                  <button className="btn btn-sm btn-dark" onClick={() => alternarPublico(d)}>
                    {d.publico ? 'Hacer privado' : 'Hacer público'}
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => eliminar(d)}>
                    Borrar
                  </button>
                </>
              }
            />
          ))}
        </div>
      </div>
    </>
  )
}

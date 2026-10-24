import { useCallback, useEffect, useState } from 'react'
import { borrarDescarga, editarDescarga, getDescargas, subirDescarga } from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { CATEGORIAS_DESCARGA } from '../../utils/catalogos'
import { Archivo } from '../Descargas'

export default function AdminDescargas() {
  const toast = useToast()
  const [lista, setLista] = useState([])
  const [subiendo, setSubiendo] = useState(false)

  const recargar = useCallback(() => getDescargas().then(setLista), [])

  useEffect(() => {
    recargar().catch(() => {})
  }, [recargar])

  async function subir(ev) {
    ev.preventDefault()
    const form = ev.currentTarget
    setSubiendo(true)
    try {
      await subirDescarga(new FormData(form))
      toast('Archivo publicado')
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
                {Object.entries(CATEGORIAS_DESCARGA).map(([id, c]) => (
                  <option key={id} value={id}>
                    {c.label}
                  </option>
                ))}
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
          <div>
            <button className="btn btn-sm" type="submit" disabled={subiendo}>
              {subiendo ? 'Subiendo…' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <h2>Material publicado ({lista.length})</h2>
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

import { useCallback, useEffect, useState } from 'react'
import { borrarFoto, getGaleria, subirFotos } from '../../api/client'
import { useToast } from '../../context/ToastContext'

export default function AdminGaleria() {
  const toast = useToast()
  const [fotos, setFotos] = useState([])
  const [subiendo, setSubiendo] = useState(false)

  const recargar = useCallback(() => getGaleria().then(setFotos), [])

  useEffect(() => {
    recargar().catch(() => {})
  }, [recargar])

  async function subir(ev) {
    ev.preventDefault()
    const form = ev.currentTarget
    setSubiendo(true)
    try {
      const { cantidad } = await subirFotos(new FormData(form))
      toast(cantidad === 1 ? 'Foto subida' : `${cantidad} fotos subidas`)
      form.reset()
      recargar()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSubiendo(false)
    }
  }

  async function borrar(foto) {
    if (!confirm('¿Borrar esta foto de la galería?')) return
    try {
      await borrarFoto(foto.id)
      toast('Foto borrada')
      recargar()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <>
      <div className="panel">
        <h2>Subir fotos</h2>
        <form className="form" onSubmit={subir}>
          <div className="form-row">
            <label>
              Fotos (podés elegir varias, máx. 8 MB c/u)
              <input type="file" name="fotos" accept="image/jpeg,image/png,image/webp,image/gif" multiple required />
            </label>
            <label>
              Descripción (opcional, se aplica a todas)
              <input name="titulo" maxLength={150} placeholder="Ej: Examen de graduación diciembre 2026" />
            </label>
          </div>
          <div>
            <button className="btn btn-sm" type="submit" disabled={subiendo}>
              {subiendo ? 'Subiendo…' : 'Subir'}
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <h2>Fotos publicadas ({fotos.length})</h2>
        {fotos.length === 0 ? (
          <div className="empty">Todavía no subiste fotos.</div>
        ) : (
          <div className="gallery admin-gallery">
            {fotos.map((f) => (
              <figure key={f.id}>
                <img src={f.url} alt={f.titulo || ''} loading="lazy" />
                <figcaption>
                  <span>{f.titulo || 'Sin descripción'}</span>
                  <button className="btn btn-sm btn-danger" onClick={() => borrar(f)}>
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

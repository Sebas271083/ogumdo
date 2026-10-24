import { useCallback, useEffect, useState } from 'react'
import { borrarEvento, crearEvento, editarEvento, getEventos } from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { TIPOS_EVENTO } from '../../utils/catalogos'
import Evento from '../../components/Evento'
import { separarEventos } from '../Calendario'

export default function AdminCalendario() {
  const toast = useToast()
  const [datos, setDatos] = useState(null)
  // Evento que se está editando (null = alta de uno nuevo)
  const [editando, setEditando] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const recargar = useCallback(() => getEventos().then(setDatos), [])

  useEffect(() => {
    recargar().catch(() => {})
  }, [recargar])

  async function guardar(ev) {
    ev.preventDefault()
    const form = ev.currentTarget
    const fd = new FormData(form)
    const evento = { ...Object.fromEntries(fd), publico: fd.has('publico'), notificar: fd.has('notificar') }
    setGuardando(true)
    try {
      if (editando) {
        await editarEvento(editando.id, evento)
        toast('Evento actualizado')
      } else {
        const { enviados } = await crearEvento(evento)
        toast(evento.notificar ? `Evento creado · ${enviados} notificaciones enviadas` : 'Evento creado')
      }
      setEditando(null)
      form.reset()
      recargar()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar(e) {
    if (!confirm(`¿Borrar "${e.titulo}"?`)) return
    try {
      await borrarEvento(e.id)
      toast('Evento borrado')
      if (editando?.id === e.id) setEditando(null)
      recargar()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  function editar(e) {
    setEditando(e)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const { porMes, pasados } = datos ? separarEventos(datos) : { porMes: [], pasados: [] }
  const acciones = (e) => (
    <>
      <button className="btn btn-sm btn-dark" onClick={() => editar(e)}>
        Editar
      </button>
      <button className="btn btn-sm btn-danger" onClick={() => eliminar(e)}>
        Borrar
      </button>
    </>
  )

  return (
    <>
      <div className="panel">
        <h2>{editando ? `Editar: ${editando.titulo}` : 'Nueva fecha'}</h2>
        {/* key: al elegir otro evento el formulario se vuelve a armar con sus datos */}
        <form className="form" onSubmit={guardar} key={editando?.id ?? 'nuevo'}>
          <div className="form-row">
            <label>
              Título
              <input name="titulo" required maxLength={150} defaultValue={editando?.titulo} placeholder="Ej: Examen de graduación" />
            </label>
            <label>
              Tipo
              <select name="tipo" defaultValue={editando?.tipo ?? 'examen'}>
                {Object.entries(TIPOS_EVENTO).map(([id, t]) => (
                  <option key={id} value={id}>
                    {t.icono} {t.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>
              Fecha
              <input name="fecha" type="date" required defaultValue={editando?.fecha} />
            </label>
            <label>
              Hasta (si dura varios días)
              <input name="fecha_fin" type="date" defaultValue={editando?.fecha_fin ?? ''} />
            </label>
          </div>
          <div className="form-row">
            <label>
              Hora (opcional)
              <input name="hora" type="time" defaultValue={editando?.hora ?? ''} />
            </label>
            <label>
              Lugar (opcional)
              <input name="lugar" maxLength={150} defaultValue={editando?.lugar ?? ''} placeholder="Ej: Dojang / Parque Roca" />
            </label>
          </div>
          <label>
            Descripción (opcional)
            <textarea name="descripcion" className="corto" defaultValue={editando?.descripcion ?? ''} />
          </label>
          <label className="check">
            <input type="checkbox" name="publico" defaultChecked={editando ? editando.publico : true} />
            Público (si lo desmarcás, solo lo ven los alumnos)
          </label>
          {!editando && (
            <label className="check">
              <input type="checkbox" name="notificar" />
              Avisar a los alumnos con una notificación
            </label>
          )}
          <div className="botones">
            <button className="btn btn-sm" type="submit" disabled={guardando}>
              {editando ? 'Guardar cambios' : 'Agregar al calendario'}
            </button>
            {editando && (
              <button className="btn btn-sm btn-dark" type="button" onClick={() => setEditando(null)}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="panel">
        <h2>Próximas fechas</h2>
        {datos && porMes.length === 0 && <div className="empty">No hay fechas próximas.</div>}
        {porMes.map(({ mes, eventos }) => (
          <div key={mes} className="mes">
            <h3 className="subtitulo">{mes}</h3>
            <div className="eventos">
              {eventos.map((e) => (
                <Evento key={e.id} e={e} acciones={acciones(e)} />
              ))}
            </div>
          </div>
        ))}
        {pasados.length > 0 && (
          <details className="pasados">
            <summary>Fechas pasadas ({pasados.length})</summary>
            <div className="eventos">
              {pasados.map((e) => (
                <Evento key={e.id} e={e} pasado acciones={acciones(e)} />
              ))}
            </div>
          </details>
        )}
      </div>
    </>
  )
}

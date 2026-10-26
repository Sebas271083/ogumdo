import { useState } from 'react'
import { agregarApto, archivoAptoUrl, borrarApto } from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { fecha, hoyLocal } from '../../utils/format'
import { MensajeApto } from '../../components/EstadoApto'

const unAnioDespues = (iso) => {
  const [a, m, d] = iso.split('-').map(Number)
  // 29/2 + 1 año no existe: pasa al 28/2
  const dia = m === 2 && d === 29 ? 28 : d
  return `${a + 1}-${String(m).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}
const hoy = hoyLocal

// Sección del apto físico en la ficha del alumno (panel del Sabonim)
export default function AptoFisico({ alumno, apto, onCambio }) {
  const toast = useToast()
  const [vencimiento, setVencimiento] = useState(unAnioDespues(hoy()))
  const [guardando, setGuardando] = useState(false)

  async function guardar(ev) {
    ev.preventDefault()
    const form = ev.currentTarget
    setGuardando(true)
    try {
      await agregarApto(alumno.id, new FormData(form))
      toast('Apto físico cargado')
      form.reset()
      setVencimiento(unAnioDespues(hoy()))
      onCambio()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar(a) {
    if (!confirm(`¿Borrar el apto que vence el ${fecha(a.fecha_vencimiento)}?`)) return
    try {
      await borrarApto(a.id)
      toast('Apto borrado')
      onCambio()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <div className="panel">
      <h2>Apto físico</h2>
      <MensajeApto apto={apto} />

      <h3 className="subtitulo">{apto.actual ? 'Cargar renovación' : 'Cargar apto físico'}</h3>
      <form className="form" onSubmit={guardar}>
        <div className="form-row">
          <label>
            Fecha de entrega
            <input
              type="date"
              name="fecha_emision"
              required
              defaultValue={hoy()}
              // Al cambiar la entrega se propone el vencimiento a un año (se puede editar)
              onChange={(ev) => ev.target.value && setVencimiento(unAnioDespues(ev.target.value))}
            />
          </label>
          <label>
            Vence
            <input
              type="date"
              name="fecha_vencimiento"
              required
              value={vencimiento}
              onChange={(ev) => setVencimiento(ev.target.value)}
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Observaciones (opcional)
            <input name="observaciones" maxLength={300} placeholder="Ej: médico, institución, restricciones" />
          </label>
          <label>
            Certificado (foto o PDF, opcional)
            <input type="file" name="archivo" accept="image/*,application/pdf" />
          </label>
        </div>
        <div>
          <button className="btn btn-sm" type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar apto'}
          </button>
        </div>
      </form>

      {apto.historial.length > 0 && (
        <>
          <h3 className="subtitulo">Historial</h3>
          <div className="lista-simple">
            {apto.historial.map((a) => (
              <div key={a.id}>
                <span>
                  <strong>
                    {fecha(a.fecha_emision)} → {fecha(a.fecha_vencimiento)}
                  </strong>
                  {a.observaciones && <span className="muted"> · {a.observaciones}</span>}
                </span>
                <span className="botones">
                  {a.tiene_archivo && (
                    <a className="btn btn-sm btn-dark" href={archivoAptoUrl(a.id)} target="_blank" rel="noopener noreferrer">
                      Ver
                    </a>
                  )}
                  <button className="btn btn-sm btn-danger" onClick={() => eliminar(a)}>
                    Borrar
                  </button>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

import { useState } from 'react'
import { agregarRegistro } from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { CINTURONES, TIPOS_REGISTRO, indiceCinturon } from '../../utils/cinturones'
import { hoyLocal } from '../../utils/format'

const hoy = hoyLocal

export default function RegistroForm({ alumno, onAgregado }) {
  const toast = useToast()
  const [tipo, setTipo] = useState('graduacion')
  const [enviando, setEnviando] = useState(false)
  // Por defecto se sugiere el cinturón siguiente al actual
  const siguiente = CINTURONES[Math.min(indiceCinturon(alumno.cinturon_actual) + 1, CINTURONES.length - 1)].id

  async function enviar(ev) {
    ev.preventDefault()
    const form = ev.currentTarget
    setEnviando(true)
    try {
      await agregarRegistro(alumno.id, new FormData(form))
      toast('Registro agregado')
      form.reset()
      setTipo('graduacion')
      onAgregado()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="panel">
      <h2>Agregar registro</h2>
      <form className="form" onSubmit={enviar}>
        <div className="form-row">
          <label>
            Tipo
            <select name="tipo" value={tipo} onChange={(ev) => setTipo(ev.target.value)}>
              {Object.entries(TIPOS_REGISTRO).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.singular}
                </option>
              ))}
            </select>
          </label>
          <label>
            Fecha
            <input type="date" name="fecha" defaultValue={hoy()} />
          </label>
        </div>
        <label>
          Título *
          <input name="titulo" required placeholder="Ej: Examen de 5° Gup, Medalla de oro Torneo Nacional…" />
        </label>
        {tipo === 'graduacion' && (
          <div className="form-row">
            <label>
              Cinturón obtenido
              <select name="cinturon" defaultValue={siguiente} key={siguiente}>
                {CINTURONES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} – {c.grado}
                  </option>
                ))}
              </select>
            </label>
            <label className="check">
              <input type="checkbox" name="actualizar_cinturon" value="true" defaultChecked />
              Actualizar el cinturón actual del alumno
            </label>
          </div>
        )}
        <label>
          Descripción
          <textarea name="descripcion" className="corto" placeholder="Detalles opcionales" />
        </label>
        <label>
          Diploma / certificado (imagen o PDF, máx. 8 MB)
          <input type="file" name="archivo" accept="image/*,application/pdf" />
        </label>
        <div>
          <button className="btn btn-sm" type="submit" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Agregar'}
          </button>
        </div>
      </form>
    </div>
  )
}

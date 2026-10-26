import { useCallback, useEffect, useState } from 'react'
import { getAlumnos } from '../../api/client'
import { getCinturon } from '../../utils/cinturones'
import Cinturon from '../../components/Cinturon'
import { ChipApto } from '../../components/EstadoApto'
import AlumnoDetalle from './AlumnoDetalle'
import AlumnoForm from './AlumnoForm'

export default function AdminAlumnos() {
  const [alumnos, setAlumnos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  // Mostrar solo los que adeudan el apto o lo tienen por vencer
  const [soloApto, setSoloApto] = useState(false)
  // null = nada elegido, 'nuevo' = alta, número = id del alumno
  const [seleccion, setSeleccion] = useState(null)

  const recargar = useCallback(() => getAlumnos().then(setAlumnos), [])

  useEffect(() => {
    recargar().catch(() => {})
  }, [recargar])

  const conProblemaApto = (a) => a.apto?.estado !== 'vigente'
  const adeudan = alumnos.filter((a) => a.apto?.adeuda).length
  const porVencer = alumnos.filter((a) => a.apto?.estado === 'por-vencer').length

  const q = busqueda.trim().toLowerCase()
  const filtrados = alumnos.filter(
    (a) => `${a.nombre} ${a.email}`.toLowerCase().includes(q) && (!soloApto || conProblemaApto(a)),
  )

  return (
    <div className="admin-grid">
      <aside className="panel">
        <button className="btn btn-sm ancho" onClick={() => setSeleccion('nuevo')}>
          + Nuevo alumno
        </button>
        <input
          type="search"
          placeholder="Buscar alumno…"
          value={busqueda}
          onChange={(ev) => setBusqueda(ev.target.value)}
          style={{ marginTop: '1rem' }}
        />
        {(adeudan > 0 || porVencer > 0) && (
          <label className="check resumen-apto">
            <input type="checkbox" checked={soloApto} onChange={(ev) => setSoloApto(ev.target.checked)} />
            <span>
              Apto físico: {adeudan > 0 && <strong className="txt-rojo">{adeudan} {adeudan === 1 ? 'adeuda' : 'adeudan'}</strong>}
              {adeudan > 0 && porVencer > 0 && ' · '}
              {porVencer > 0 && <strong className="txt-amarillo">{porVencer} por vencer</strong>}
              <small className="muted"> (mostrar solo esos)</small>
            </span>
          </label>
        )}
        <div className="student-list">
          {filtrados.length === 0 && <p className="muted">Sin resultados.</p>}
          {filtrados.map((a) => (
            <button key={a.id} className={a.id === seleccion ? 'active' : ''} onClick={() => setSeleccion(a.id)}>
              <strong>{a.nombre}</strong>
              {conProblemaApto(a) && <ChipApto apto={a.apto} />}
              <span>
                <Cinturon id={a.cinturon_actual} />{' '}
                <small>
                  {getCinturon(a.cinturon_actual).grado} · {a.total_registros} registros
                </small>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <div>
        {seleccion === null && <div className="panel empty">Elegí un alumno de la lista o creá uno nuevo.</div>}
        {seleccion === 'nuevo' && (
          <AlumnoForm
            onGuardado={async (id) => {
              await recargar()
              setSeleccion(id)
            }}
          />
        )}
        {typeof seleccion === 'number' && (
          <AlumnoDetalle
            key={seleccion}
            id={seleccion}
            onCambio={recargar}
            onEliminado={async () => {
              await recargar()
              setSeleccion(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

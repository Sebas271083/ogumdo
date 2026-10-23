import { useCallback, useEffect, useState } from 'react'
import { getAlumnos } from '../../api/client'
import { getCinturon } from '../../utils/cinturones'
import Cinturon from '../../components/Cinturon'
import AlumnoDetalle from './AlumnoDetalle'
import AlumnoForm from './AlumnoForm'

export default function AdminAlumnos() {
  const [alumnos, setAlumnos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  // null = nada elegido, 'nuevo' = alta, número = id del alumno
  const [seleccion, setSeleccion] = useState(null)

  const recargar = useCallback(() => getAlumnos().then(setAlumnos), [])

  useEffect(() => {
    recargar().catch(() => {})
  }, [recargar])

  const q = busqueda.trim().toLowerCase()
  const filtrados = alumnos.filter((a) => `${a.nombre} ${a.email}`.toLowerCase().includes(q))

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
        <div className="student-list">
          {filtrados.length === 0 && <p className="muted">Sin resultados.</p>}
          {filtrados.map((a) => (
            <button key={a.id} className={a.id === seleccion ? 'active' : ''} onClick={() => setSeleccion(a.id)}>
              <strong>{a.nombre}</strong>
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

import { useState } from 'react'
import { archivoRegistroUrl } from '../api/client'
import { TIPOS_REGISTRO, nombreCinturon } from '../utils/cinturones'
import { fecha } from '../utils/format'
import Cinturon from './Cinturon'

function Registro({ r, onBorrar }) {
  const esGraduacion = r.tipo === 'graduacion' && r.cinturon
  const detalle = [esGraduacion && nombreCinturon(r.cinturon), r.descripcion].filter(Boolean).join(' — ')
  return (
    <article className="record">
      <div className={`record-icon ${esGraduacion ? 'con-cinturon' : ''}`}>
        {esGraduacion ? <Cinturon id={r.cinturon} /> : TIPOS_REGISTRO[r.tipo].icono}
      </div>
      <div>
        <h4>{r.titulo}</h4>
        {detalle && <p>{detalle}</p>}
      </div>
      <div className="actions">
        <span className="date">{fecha(r.fecha)}</span>
        {r.tiene_archivo && (
          <a className="btn btn-sm btn-dark" href={archivoRegistroUrl(r.id)} target="_blank" rel="noopener noreferrer">
            Ver diploma
          </a>
        )}
        {onBorrar && (
          <button className="btn btn-sm btn-danger" onClick={() => onBorrar(r)}>
            Borrar
          </button>
        )}
      </div>
    </article>
  )
}

// Historial de un alumno filtrable por tipo. onBorrar solo se pasa desde el panel admin.
export default function RegistrosTabs({ registros, onBorrar }) {
  const [activo, setActivo] = useState('todos')
  const tabs = [['todos', 'Todos'], ...Object.entries(TIPOS_REGISTRO).map(([k, v]) => [k, v.label])]
  const filtrados = activo === 'todos' ? registros : registros.filter((r) => r.tipo === activo)

  return (
    <>
      <div className="tabs" role="tablist">
        {tabs.map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={k === activo}
            className={k === activo ? 'active' : ''}
            onClick={() => setActivo(k)}
          >
            {label}
            <span className="count">{k === 'todos' ? registros.length : registros.filter((r) => r.tipo === k).length}</span>
          </button>
        ))}
      </div>
      <div className="records">
        {filtrados.length ? (
          filtrados.map((r) => <Registro key={r.id} r={r} onBorrar={onBorrar} />)
        ) : (
          <div className="empty">Todavía no hay registros en esta categoría.</div>
        )}
      </div>
    </>
  )
}

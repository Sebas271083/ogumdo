import { fecha } from '../utils/format'

export default function Avisos({ avisos, onBorrar }) {
  if (!avisos.length) return <div className="empty">No hay avisos.</div>
  return (
    <div className="avisos">
      {avisos.map((a) => (
        <article key={a.id} className="aviso">
          <div>
            <h4>{a.titulo}</h4>
            <span className="muted">{fecha(a.creado_ts)}</span>
          </div>
          <p>{a.mensaje}</p>
          {onBorrar && (
            <button className="btn btn-sm btn-danger" onClick={() => onBorrar(a)}>
              Borrar
            </button>
          )}
        </article>
      ))}
    </div>
  )
}

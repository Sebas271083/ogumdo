import { TIPOS_EVENTO } from '../utils/catalogos'
import { partesFecha } from '../utils/format'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const corta = (iso) => `${Number(iso.slice(8, 10))} ${MESES[Number(iso.slice(5, 7)) - 1]}`
const compacta = (iso) => iso.replaceAll('-', '')
const diaSiguiente = (iso) => {
  const [a, m, d] = iso.split('-').map(Number)
  const f = new Date(Date.UTC(a, m - 1, d + 1))
  return f.toISOString().slice(0, 10)
}

// "10:00" -> "120000" (dos horas después, sin pasar de las 23:59)
function horaFin(hora) {
  const [h, m] = hora.split(':').map(Number)
  const total = Math.min(h * 60 + m + 120, 23 * 60 + 59)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}${String(total % 60).padStart(2, '0')}00`
}

// Link para agregar el evento al Google Calendar del alumno
function linkGoogleCalendar(e) {
  const fin = e.fecha_fin || e.fecha
  const fechas = e.hora
    ? `${compacta(e.fecha)}T${e.hora.replace(':', '')}00/${compacta(fin)}T${horaFin(e.hora)}`
    : `${compacta(e.fecha)}/${compacta(diaSiguiente(fin))}`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.titulo,
    dates: fechas,
    details: e.descripcion || '',
    location: e.lugar || '',
    ctz: 'America/Argentina/Buenos_Aires',
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

// acciones: botones extra (editar / borrar en el panel del Sabonim)
export default function Evento({ e, pasado = false, acciones }) {
  const tipo = TIPOS_EVENTO[e.tipo] ?? TIPOS_EVENTO.evento
  const { dia, mes } = partesFecha(e.fecha)
  return (
    <article className={`evento tipo-${e.tipo} ${pasado ? 'pasado' : ''}`}>
      <div className="evento-fecha">
        <strong>{dia}</strong>
        <span>{mes}</span>
      </div>
      <div className="evento-info">
        <div className="evento-etiquetas">
          <span className="chip">
            {tipo.icono} {tipo.label}
          </span>
          {!e.publico && <span className="chip privado">Solo alumnos</span>}
        </div>
        <h4>{e.titulo}</h4>
        <p className="muted">
          {[e.fecha_fin && `Del ${corta(e.fecha)} al ${corta(e.fecha_fin)}`, e.hora && `${e.hora} hs`, e.lugar]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {e.descripcion && <p className="evento-desc">{e.descripcion}</p>}
      </div>
      <div className="evento-acciones">
        {!pasado && !acciones && e.tipo !== 'sin-clase' && (
          <a className="btn btn-sm btn-dark" href={linkGoogleCalendar(e)} target="_blank" rel="noopener noreferrer">
            + Agendar
          </a>
        )}
        {acciones}
      </div>
    </article>
  )
}

import { getCinturon } from '../utils/cinturones'

// Los colores salen del CSS por data-cinturon (index.css), no de un style en línea: la CSP del
// sitio no permite estilos en el HTML y en las páginas renderizadas en el servidor se perderían.
export default function Cinturon({ id, grande = false, className = '' }) {
  const c = getCinturon(id)
  return (
    <span className={`belt ${grande ? 'lg' : ''} ${className}`} data-cinturon={c.id} title={`${c.nombre} · ${c.grado}`}>
      {c.dan > 0 && (
        <span className="dan-stripes">
          {Array.from({ length: c.dan }, (_, i) => (
            <i key={i} />
          ))}
        </span>
      )}
    </span>
  )
}

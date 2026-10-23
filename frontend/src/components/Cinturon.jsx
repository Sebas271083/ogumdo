import { getCinturon } from '../utils/cinturones'

export default function Cinturon({ id, grande = false, className = '' }) {
  const c = getCinturon(id)
  return (
    <span
      className={`belt ${grande ? 'lg' : ''} ${className}`}
      style={{ '--c1': c.c1, '--c2': c.c2 }}
      title={`${c.nombre} · ${c.grado}`}
    >
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

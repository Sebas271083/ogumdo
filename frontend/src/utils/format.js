const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// "2024-03-16" -> "16 mar 2024". Se parsea a mano para no depender del huso horario.
export function fecha(iso) {
  if (!iso) return ''
  const [a, m, d] = String(iso).slice(0, 10).split('-')
  if (!m) return a
  return `${Number(d)} ${MESES[Number(m) - 1]} ${a}`
}

export function antiguedad(desde) {
  if (!desde) return '—'
  const meses = Math.max(0, Math.floor((Date.now() - new Date(desde)) / (1000 * 60 * 60 * 24 * 30.44)))
  const anios = Math.floor(meses / 12)
  const resto = meses % 12
  if (!anios) return `${resto} ${resto === 1 ? 'mes' : 'meses'}`
  return `${anios} ${anios === 1 ? 'año' : 'años'}${resto ? ` y ${resto} m` : ''}`
}

export const iniciales = (nombre = '') =>
  nombre
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

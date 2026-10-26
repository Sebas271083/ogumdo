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

// diasSemana de escuela.json: 0 = domingo … 6 = sábado
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

// [1, 3, 5] -> "Lunes, miércoles y viernes"
export function diasTexto(dias = []) {
  const nombres = [...dias].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map((d) => DIAS[d])
  const texto = nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}` : nombres[0] ?? ''
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export const rangoHorario = (h) => `${h.inicio} – ${h.fin}`

const isoLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Fecha de hoy según el reloj del dispositivo ("YYYY-MM-DD"). toISOString() da la de UTC:
// en Argentina, después de las 21 hs devolvería la de mañana.
export const hoyLocal = () => isoLocal(new Date())

// "2026-10-27" -> "Hoy", "Mañana" o "Martes 27/10"
export function fechaClase(iso) {
  const hoy = new Date()
  const manana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1)
  if (iso === isoLocal(hoy)) return 'Hoy'
  if (iso === isoLocal(manana)) return 'Mañana'
  const [a, m, d] = iso.split('-').map(Number)
  const dia = DIAS[new Date(a, m - 1, d).getDay()]
  return `${dia.charAt(0).toUpperCase() + dia.slice(1)} ${d}/${m}`
}

export function tamanoArchivo(bytes = 0) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}

const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

// "2026-12-12" -> "Diciembre 2026"
export function mesAnio(iso) {
  const m = MESES_LARGOS[Number(iso.slice(5, 7)) - 1]
  return `${m.charAt(0).toUpperCase() + m.slice(1)} ${iso.slice(0, 4)}`
}

// Para el bloque de fecha del calendario: { dia: "12", mes: "dic" }
export const partesFecha = (iso) => ({ dia: String(Number(iso.slice(8, 10))), mes: fecha(iso).split(' ')[1] })

export const iniciales = (nombre = '') =>
  nombre
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

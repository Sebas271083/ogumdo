// Sistema Kukkiwon de 10 Gup + Dan. Si la escuela usa otra progresión, se ajusta acá.
const GUPS = [
  ['blanco', 'Blanco', '10° Gup', '#f5f5f5'],
  ['blanco-amarillo', 'Blanco punta amarilla', '9° Gup', '#f5f5f5', '#f7c600'],
  ['amarillo', 'Amarillo', '8° Gup', '#f7c600'],
  ['amarillo-verde', 'Amarillo punta verde', '7° Gup', '#f7c600', '#1f9d4c'],
  ['verde', 'Verde', '6° Gup', '#1f9d4c'],
  ['verde-azul', 'Verde punta azul', '5° Gup', '#1f9d4c', '#1f4fd1'],
  ['azul', 'Azul', '4° Gup', '#1f4fd1'],
  ['azul-rojo', 'Azul punta roja', '3° Gup', '#1f4fd1', '#d01c2e'],
  ['rojo', 'Rojo', '2° Gup', '#d01c2e'],
  ['rojo-negro', 'Rojo punta negra', '1° Gup', '#d01c2e', '#111111'],
]

export const CINTURONES = [
  ...GUPS.map(([id, nombre, grado, c1, c2]) => ({ id, nombre, grado, c1, c2: c2 || c1, dan: 0 })),
  ...Array.from({ length: 9 }, (_, i) => ({
    id: `negro-${i + 1}`,
    nombre: 'Negro',
    grado: `${i + 1}° Dan`,
    c1: '#111111',
    c2: '#111111',
    dan: i + 1,
  })),
]

export const getCinturon = (id) => CINTURONES.find((c) => c.id === id) || CINTURONES[0]
export const indiceCinturon = (id) => Math.max(0, CINTURONES.findIndex((c) => c.id === id))
export const nombreCinturon = (id) => {
  const c = getCinturon(id)
  return `${c.nombre} · ${c.grado}`
}

export const TIPOS_REGISTRO = {
  graduacion: { label: 'Graduaciones', singular: 'Graduación', icono: '🥋' },
  titulo: { label: 'Títulos', singular: 'Título', icono: '📜' },
  capacitacion: { label: 'Capacitaciones', singular: 'Capacitación', icono: '🎓' },
  logro: { label: 'Logros', singular: 'Logro', icono: '🏆' },
}

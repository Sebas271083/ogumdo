// Chrome avisa que la web se puede instalar con "beforeinstallprompt", apenas carga la página
// (antes de que se monte el panel). Se guarda acá para mostrar el botón "Instalar app" después.

let eventoInstalacion = null
const oyentes = new Set()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (ev) => {
    ev.preventDefault()
    eventoInstalacion = ev
    oyentes.forEach((fn) => fn(true))
  })
  window.addEventListener('appinstalled', () => {
    eventoInstalacion = null
    oyentes.forEach((fn) => fn(false))
  })
}

export const sePuedeInstalar = () => Boolean(eventoInstalacion)

export function alCambiarInstalable(fn) {
  oyentes.add(fn)
  return () => oyentes.delete(fn)
}

export async function instalar() {
  if (!eventoInstalacion) return false
  eventoInstalacion.prompt()
  const { outcome } = await eventoInstalacion.userChoice
  eventoInstalacion = null
  oyentes.forEach((fn) => fn(false))
  return outcome === 'accepted'
}

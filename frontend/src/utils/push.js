import { desuscribirPush, getClavePush, probarPush, suscribirPush } from '../api/client'

// Notificaciones push del navegador. En iPhone solo funcionan con la web instalada en la
// pantalla de inicio (iOS 16.4+), por eso "soportado" también mira si corre como app.

export const pushSoportado = () =>
  typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window

export const esIos = () => typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)

export const esAppInstalada = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true)

// La clave VAPID viaja en base64url y el navegador la necesita como bytes
function claveABytes(base64) {
  const relleno = '='.repeat((4 - (base64.length % 4)) % 4)
  const binario = atob((base64 + relleno).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(binario, (c) => c.charCodeAt(0))
}

export async function suscripcionActual() {
  if (!pushSoportado()) return null
  const registro = await navigator.serviceWorker.ready
  return registro.pushManager.getSubscription()
}

export async function activarNotificaciones() {
  const { clave } = await getClavePush()
  if (!clave) throw new Error('Las notificaciones todavía no están configuradas en el servidor')

  const permiso = await Notification.requestPermission()
  if (permiso !== 'granted') throw new Error('No diste permiso para notificaciones. Podés habilitarlo en la configuración del navegador.')

  const registro = await navigator.serviceWorker.ready
  const suscripcion =
    (await registro.pushManager.getSubscription()) ??
    (await registro.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: claveABytes(clave) }))
  await suscribirPush(suscripcion.toJSON())
  await probarPush()
}

export async function desactivarNotificaciones() {
  const suscripcion = await suscripcionActual()
  if (!suscripcion) return
  await desuscribirPush(suscripcion.endpoint).catch(() => {})
  await suscripcion.unsubscribe()
}

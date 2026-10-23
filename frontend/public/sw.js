// Service worker: recibe las notificaciones push y responde "Voy" / "No voy" sin abrir la app.
// El payload lo arma backend/src/services/pushService.js: { titulo, cuerpo, url, tag, asistencia? }

const ICONO = '/img/icon-192.png'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  let datos = {}
  try {
    datos = event.data ? event.data.json() : {}
  } catch {
    datos = { cuerpo: event.data?.text() }
  }

  const opciones = {
    body: datos.cuerpo || '',
    icon: ICONO,
    badge: ICONO,
    tag: datos.tag,
    renotify: Boolean(datos.tag),
    data: datos,
    // Botones dentro de la notificación (Android y escritorio; iPhone los ignora y abre la app)
    actions: datos.asistencia
      ? [
          { action: 'voy', title: '✔ Voy' },
          { action: 'no-voy', title: '✖ No voy' },
        ]
      : [],
  }
  event.waitUntil(self.registration.showNotification(datos.titulo || 'Ogum Do Taekwondo', opciones))
})

async function abrir(url = '/') {
  const ventanas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  for (const v of ventanas) {
    if ('focus' in v) {
      await v.focus()
      return v.navigate ? v.navigate(url) : undefined
    }
  }
  return self.clients.openWindow(url)
}

async function responderAsistencia(datos, asiste) {
  const { claseId, fecha } = datos.asistencia
  try {
    // La cookie de sesión viaja igual que desde la app (mismo origen)
    const res = await fetch(`/api/clases/${claseId}/${fecha}/asistencia`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ asiste }),
    })
    if (!res.ok) return abrir(datos.url)
    return self.registration.showNotification(asiste ? '¡Te esperamos! 🥋' : 'Anotado, ¡nos vemos la próxima!', {
      body: datos.titulo,
      icon: ICONO,
      badge: ICONO,
      tag: datos.tag,
    })
  } catch {
    return abrir(datos.url)
  }
}

self.addEventListener('notificationclick', (event) => {
  const datos = event.notification.data || {}
  event.notification.close()

  if (datos.asistencia && (event.action === 'voy' || event.action === 'no-voy')) {
    event.waitUntil(responderAsistencia(datos, event.action === 'voy'))
  } else {
    event.waitUntil(abrir(datos.url || '/'))
  }
})

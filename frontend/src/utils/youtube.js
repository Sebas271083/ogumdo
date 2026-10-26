// Devuelve el id del video si la URL es de YouTube (watch, youtu.be, shorts, embed, live), o null
export function idYoutube(texto) {
  try {
    const url = new URL(texto)
    const host = url.hostname.replace(/^(www|m|music)\./, '')
    if (host === 'youtu.be') return url.pathname.slice(1).split('/')[0] || null
    if (host !== 'youtube.com' && host !== 'youtube-nocookie.com') return null
    if (url.pathname === '/watch') return url.searchParams.get('v')
    const [, tipo, id] = url.pathname.split('/')
    return ['shorts', 'embed', 'live', 'v'].includes(tipo) ? id || null : null
  } catch {
    return null
  }
}

// "https://www.worldtaekwondo.org/rules" -> "worldtaekwondo.org"
export const dominio = (texto) => {
  try {
    return new URL(texto).hostname.replace(/^www\./, '')
  } catch {
    return texto
  }
}

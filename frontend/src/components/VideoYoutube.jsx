import { useState } from 'react'

// Muestra la miniatura y recién al tocar play carga el reproductor de YouTube:
// así la página no carga varios reproductores pesados de entrada.
export default function VideoYoutube({ id, titulo }) {
  const [reproduciendo, setReproduciendo] = useState(false)

  if (reproduciendo) {
    return (
      <div className="video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <button className="video" onClick={() => setReproduciendo(true)} aria-label={`Reproducir: ${titulo}`}>
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
      <span className="video-play" aria-hidden="true">
        ▶
      </span>
    </button>
  )
}

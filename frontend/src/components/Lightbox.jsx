import { useEffect, useRef, useState } from 'react'

// Visor de imágenes a pantalla completa. items: [{ src, alt }]
export default function Lightbox({ items, inicio = 0, onCerrar }) {
  const [i, setI] = useState(inicio)
  const cerrarRef = useRef(null)
  const mover = (d) => setI((actual) => (actual + d + items.length) % items.length)

  useEffect(() => {
    const teclas = (ev) => {
      if (ev.key === 'Escape') onCerrar()
      if (ev.key === 'ArrowRight') setI((a) => (a + 1) % items.length)
      if (ev.key === 'ArrowLeft') setI((a) => (a - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', teclas)
    document.body.style.overflow = 'hidden'
    cerrarRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', teclas)
      document.body.style.overflow = ''
    }
  }, [items.length, onCerrar])

  const item = items[i]
  return (
    <div className="lightbox" role="dialog" aria-modal="true" onClick={(ev) => ev.target === ev.currentTarget && onCerrar()}>
      <figure>
        <img src={item.src} alt={item.alt || ''} />
        {item.alt && <figcaption>{item.alt}</figcaption>}
      </figure>
      <button ref={cerrarRef} className="lb-close" aria-label="Cerrar" onClick={onCerrar}>
        ✕
      </button>
      {items.length > 1 && (
        <>
          <button className="lb-prev" aria-label="Anterior" onClick={() => mover(-1)}>
            ‹
          </button>
          <button className="lb-next" aria-label="Siguiente" onClick={() => mover(1)}>
            ›
          </button>
        </>
      )}
    </div>
  )
}

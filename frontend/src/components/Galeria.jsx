import { useState } from 'react'
import { Link } from 'react-router'
import { useEscuela } from '../context/EscuelaContext'
import Lightbox from './Lightbox'
import Reveal from './Reveal'

export default function Galeria({ fotos }) {
  const { nombre } = useEscuela()
  const [abierta, setAbierta] = useState(null)

  if (!fotos.length) {
    return (
      <div className="gallery-empty">
        Todavía no hay fotos. El Sabonim puede subirlas desde el <Link to="/admin">panel de administración</Link>.
      </div>
    )
  }

  const items = fotos.map((f) => ({ src: f.url, alt: f.titulo }))
  // Las fotos sin descripción igual llevan un alt: Google Imágenes lo usa para indexarlas
  const alt = (f) => f.titulo || `Taekwondo en ${nombre}`
  return (
    <>
      <div className="gallery">
        {fotos.map((f, i) => (
          <Reveal as="button" key={f.id} onClick={() => setAbierta(i)} aria-label={f.titulo || 'Ver foto'}>
            <img src={f.url} alt={alt(f)} loading="lazy" />
            {f.titulo && <span className="caption">{f.titulo}</span>}
          </Reveal>
        ))}
      </div>
      {abierta !== null && <Lightbox items={items} inicio={abierta} onCerrar={() => setAbierta(null)} />}
    </>
  )
}

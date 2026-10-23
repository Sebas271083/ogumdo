import { useEffect, useState } from 'react'
import { getProfesor } from '../api/client'
import { useDatosIniciales } from '../context/DatosContext'
import Lightbox from '../components/Lightbox'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'

export default function Profesor() {
  const { profesor } = useDatosIniciales()
  const [p, setP] = useState(profesor ?? null)
  const [diplomaAbierto, setDiplomaAbierto] = useState(null)

  useEffect(() => {
    getProfesor()
      .then(setP)
      .catch(() => {})
  }, [])

  if (!p) return <div className="cargando">Cargando…</div>

  const diplomas = p.diplomas || []
  return (
    <>
      <PageHero eyebrow="Trayectoria" titulo={p.nombre}>
        <p>{p.grado}</p>
      </PageHero>

      <section>
        <div className="container profile">
          <Reveal className="profile-photo">
            <img src={p.foto} alt={p.nombre} />
            <span className="rank">{p.grado}</span>
          </Reveal>

          <div>
            <Reveal>
              <span className="eyebrow">Biografía</span>
              {p.frase && <blockquote className="quote">“{p.frase}”</blockquote>}
              <div className="muted">
                {(p.bio || []).map((parrafo) => (
                  <p key={parrafo}>{parrafo}</p>
                ))}
              </div>
            </Reveal>

            <div className="bloque">
              <span className="eyebrow">Graduaciones</span>
              <h2>Camino del cinturón negro</h2>
              <div className="dan-track">
                {(p.graduaciones || []).map((g) => (
                  <Reveal className="dan" key={g.grado}>
                    <div className="dan-badge">{g.grado}</div>
                    <div>
                      <strong>{g.entidad}</strong>
                      {g.detalle && <span className="muted">{g.detalle}</span>}
                    </div>
                    <div className="when">{g.fecha}</div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Certificaciones</span>
            <h2>Diplomas y títulos</h2>
            <p className="muted">Hacé clic en cualquier diploma para verlo en tamaño completo.</p>
          </Reveal>
          <div className="diplomas">
            {diplomas.map((d, i) => (
              <Reveal as="article" className="diploma" key={d.titulo}>
                <button onClick={() => setDiplomaAbierto(i)} aria-label={`Ver ${d.titulo}`}>
                  <img src={d.imagen} alt={d.titulo} loading="lazy" />
                </button>
                <div>
                  <h3>{d.titulo}</h3>
                  <p>
                    {d.entidad} · {d.fecha}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {diplomaAbierto !== null && (
        <Lightbox
          items={diplomas.map((d) => ({ src: d.imagen, alt: `${d.titulo} – ${d.entidad}` }))}
          inicio={diplomaAbierto}
          onCerrar={() => setDiplomaAbierto(null)}
        />
      )}
    </>
  )
}

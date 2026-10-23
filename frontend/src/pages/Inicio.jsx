import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getGaleria } from '../api/client'
import { useEscuela } from '../context/EscuelaContext'
import { useDatosIniciales } from '../context/DatosContext'
import { diasTexto, rangoHorario } from '../utils/format'
import Galeria from '../components/Galeria'
import Reveal from '../components/Reveal'

const BENEFICIOS = [
  {
    titulo: 'Defensa personal',
    texto: 'Técnicas eficaces de pateo, golpes y bloqueos para protegerte con confianza.',
    icono: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
  {
    titulo: 'Disciplina y respeto',
    texto: 'Valores que se trasladan a la escuela, el trabajo y la vida diaria.',
    icono: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
  },
  {
    titulo: 'Salud y estado físico',
    texto: 'Flexibilidad, coordinación, fuerza y resistencia en cada entrenamiento.',
    icono: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  },
  {
    titulo: 'Competencia',
    texto: 'Equipo de combate y poomsae que participa en torneos regionales y nacionales.',
    icono: (
      <>
        <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
        <path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
      </>
    ),
  },
]

// Banner de la portada: "banner" en escuela.json (GIF, imagen o .mp4). Sin banner queda el
// fondo animado de CSS. No se detecta con onError: con el render en el servidor el error
// llega antes de que React escuche y el banner quedaba en blanco.
function BannerMedia({ src }) {
  if (!src) return null
  if (src.endsWith('.mp4')) {
    return <video src={src} autoPlay muted loop playsInline aria-hidden="true" />
  }
  return <img src={src} alt="" />
}

export default function Inicio() {
  const escuela = useEscuela()
  const { galeria } = useDatosIniciales()
  const [fotos, setFotos] = useState(galeria?.slice(0, 8) ?? [])

  useEffect(() => {
    getGaleria({ limit: 8 })
      .then(setFotos)
      .catch(() => {})
  }, [])

  return (
    <>
      <section className="hero">
        <div className="hero-fallback" />
        <div className="hero-media">
          <BannerMedia src={escuela.banner} />
        </div>
        <div className="container hero-content">
          <img className="hero-logo" src="/img/logo.jpg" alt={`Logo de ${escuela.nombre}`} />
          <span className="eyebrow">태권도 · Escuela de Taekwondo</span>
          <h1>
            <span className="line">
              <span>Disciplina.</span>
            </span>
            <span className="line">
              <span>Fuerza.</span>
            </span>
            <span className="line">
              <span className="accent">Espíritu.</span>
            </span>
          </h1>
          <p className="lead">
            {escuela.descripcion || 'Formamos deportistas y personas con valores. Clases para niños, adolescentes y adultos.'}
          </p>
          <div className="hero-actions">
            <Link className="btn" to="/contacto">
              Reservá tu clase gratis
            </Link>
            <Link className="btn btn-ghost" to="/profesor">
              Conocé al Sabonim
            </Link>
          </div>
        </div>
        <span className="scroll-cue" aria-hidden="true" />
      </section>

      {escuela.estadisticas?.length > 0 && (
        <div className="container">
          <div className="stats">
            {escuela.estadisticas.map((s) => (
              <div className="stat" key={s.etiqueta}>
                <strong>{s.valor}</strong>
                <span>{s.etiqueta}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <section>
        <div className="container">
          <Reveal className="section-head center">
            <span className="eyebrow">¿Por qué taekwondo?</span>
            <h2>Mucho más que un deporte</h2>
            <p className="muted">
              El taekwondo es un arte marcial coreano y deporte olímpico que desarrolla el cuerpo, la mente y el
              carácter.
            </p>
          </Reveal>
          <div className="cards">
            {BENEFICIOS.map((b) => (
              <Reveal as="article" className="card" key={b.titulo}>
                <div className="icon">
                  <svg viewBox="0 0 24 24">{b.icono}</svg>
                </div>
                <h3>{b.titulo}</h3>
                <p>{b.texto}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container split">
          <Reveal>
            <span className="eyebrow">El camino del pie y el puño</span>
            <h2>Más de 2000 años de historia</h2>
            <p className="muted">
              Desde los guerreros Hwarang del antiguo reino de Silla hasta los Juegos Olímpicos, el taekwondo recorrió
              un largo camino. Conocé sus orígenes, su filosofía y sus principios.
            </p>
            <Link className="btn btn-ghost" to="/historia">
              Leer la historia
            </Link>
          </Reveal>
          <Reveal className="split-media">
            <img src={fotos[0]?.url || '/img/profesor/placeholder.svg'} alt="Entrenamiento de taekwondo" />
          </Reveal>
        </div>
      </section>

      {escuela.horarios?.length > 0 && (
        <section>
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">Horarios</span>
              <h2>Encontrá tu clase</h2>
            </Reveal>
            <Reveal className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Clase</th>
                    <th>Días</th>
                    <th>Horario</th>
                  </tr>
                </thead>
                <tbody>
                  {escuela.horarios.map((h) => (
                    <tr key={h.id}>
                      <td>
                        <strong>{h.clase}</strong>
                      </td>
                      <td>{diasTexto(h.diasSemana)}</td>
                      <td>{rangoHorario(h)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          </div>
        </section>
      )}

      <section className="section-alt">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Galería</span>
            <h2>Vida en el dojang</h2>
          </Reveal>
          <Galeria fotos={fotos} />
          {fotos.length > 0 && (
            <p style={{ marginTop: '2rem' }}>
              <Link className="btn btn-ghost" to="/galeria">
                Ver todas las fotos
              </Link>
            </p>
          )}
        </div>
      </section>

      <section>
        <div className="container">
          <Reveal className="cta">
            <h2>Tu primera clase es gratis</h2>
            <p>Vení a conocernos, probá una clase y descubrí todo lo que el taekwondo puede hacer por vos.</p>
            <Link className="btn" to="/contacto">
              Quiero probar
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}

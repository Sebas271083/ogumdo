import { useState } from 'react'
import { enviarContacto } from '../api/client'
import { useEscuela } from '../context/EscuelaContext'
import { diasTexto, rangoHorario } from '../utils/format'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'

const ICONOS = {
  direccion: (
    <>
      <path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  telefono: (
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  ),
  email: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </>
  ),
  horario: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
}

function Dato({ icono, children }) {
  return (
    <li>
      <svg viewBox="0 0 24 24">{ICONOS[icono]}</svg>
      <div>{children}</div>
    </li>
  )
}

export default function Contacto() {
  const e = useEscuela()
  const [estado, setEstado] = useState({ enviando: false, ok: null, error: null })

  async function enviar(ev) {
    ev.preventDefault()
    const form = ev.currentTarget
    setEstado({ enviando: true, ok: null, error: null })
    try {
      await enviarContacto(Object.fromEntries(new FormData(form)))
      form.reset()
      setEstado({ enviando: false, ok: '¡Gracias! Recibimos tu mensaje y te vamos a contactar pronto.', error: null })
    } catch (err) {
      setEstado({ enviando: false, ok: null, error: err.message })
    }
  }

  const textoWhatsapp = encodeURIComponent('¡Hola! Quiero información sobre las clases de taekwondo.')

  return (
    <>
      <PageHero
        eyebrow="Contacto"
        titulo={
          <>
            Empezá tu <span className="accent">camino</span>
          </>
        }
      >
        <p>¿Tenés dudas o querés reservar una clase de prueba gratis? Escribinos y te respondemos a la brevedad.</p>
      </PageHero>

      <section>
        <div className="container contact">
          <Reveal className="panel">
            <h2>Envianos un mensaje</h2>
            <form className="form" onSubmit={enviar}>
              <div className="form-row">
                <label>
                  Nombre *
                  <input name="nombre" required maxLength={100} autoComplete="name" />
                </label>
                <label>
                  Teléfono
                  <input name="telefono" type="tel" maxLength={40} autoComplete="tel" />
                </label>
              </div>
              <label>
                Email *
                <input name="email" type="email" required maxLength={150} autoComplete="email" />
              </label>
              <label>
                Mensaje *
                <textarea
                  name="mensaje"
                  required
                  minLength={5}
                  maxLength={2000}
                  placeholder="Contanos qué clase te interesa, edad del alumno, etc."
                />
              </label>
              {/* Campo trampa para bots: invisible para personas */}
              <input className="hp" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              {estado.ok && <div className="form-msg ok">{estado.ok}</div>}
              {estado.error && <div className="form-msg error">{estado.error}</div>}
              <button className="btn" type="submit" disabled={estado.enviando}>
                {estado.enviando ? 'Enviando…' : 'Enviar mensaje'}
              </button>
            </form>
          </Reveal>

          <Reveal>
            <div className="panel">
              <h2>Dónde estamos</h2>
              <ul className="info-list">
                {e.direccion && <Dato icono="direccion">{e.direccion}</Dato>}
                {e.telefono && (
                  <Dato icono="telefono">
                    <a href={`tel:${e.telefono.replace(/\s/g, '')}`}>{e.telefono}</a>
                  </Dato>
                )}
                {e.email && (
                  <Dato icono="email">
                    <a href={`mailto:${e.email}`}>{e.email}</a>
                  </Dato>
                )}
                {e.horarios?.length > 0 && (
                  <Dato icono="horario">
                    {e.horarios.map((h) => (
                      <div key={h.id} className="muted">
                        {h.clase}: {diasTexto(h.diasSemana)}, {rangoHorario(h)}
                      </div>
                    ))}
                  </Dato>
                )}
              </ul>
              {e.whatsapp && (
                <a
                  className="btn whatsapp"
                  href={`https://wa.me/${e.whatsapp}?text=${textoWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Escribinos por WhatsApp
                </a>
              )}
            </div>
            {e.direccion && (
              <iframe
                className="map"
                title="Mapa"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(e.direccion)}&output=embed`}
              />
            )}
          </Reveal>
        </div>
      </section>
    </>
  )
}

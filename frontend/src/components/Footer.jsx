import { Link } from 'react-router'
import { useEscuela } from '../context/EscuelaContext'
import { LINKS } from './Header'

const ICONOS_REDES = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r=".5" />
    </>
  ),
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  youtube: (
    <>
      <path d="M22.5 6.4a2.8 2.8 0 0 0-2-2C18.8 4 12 4 12 4s-6.8 0-8.5.4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1 12a29 29 0 0 0 .5 5.6 2.8 2.8 0 0 0 2 2c1.7.4 8.5.4 8.5.4s6.8 0 8.5-.4a2.8 2.8 0 0 0 2-2A29 29 0 0 0 23 12a29 29 0 0 0-.5-5.6z" />
      <path d="m10 15 5-3-5-3z" />
    </>
  ),
}

export default function Footer() {
  const e = useEscuela()
  const redes = Object.entries(e.redes || {}).filter(([red, url]) => url && ICONOS_REDES[red])

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <img className="footer-logo" src="/img/logo.jpg" alt={`Logo de ${e.nombre}`} />
            <h4>{e.nombre}</h4>
            <p>{e.descripcion || e.lema}</p>
            <div className="socials">
              {redes.map(([red, url]) => (
                <a key={red} href={url} target="_blank" rel="noopener noreferrer" aria-label={red}>
                  <svg viewBox="0 0 24 24">{ICONOS_REDES[red]}</svg>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4>Navegación</h4>
            <ul>
              {LINKS.map(([to, texto]) => (
                <li key={to}>
                  <Link to={to}>{texto}</Link>
                </li>
              ))}
              <li>
                <Link to="/login">Acceso alumnos</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Contacto</h4>
            <ul>
              {e.direccion && <li>{e.direccion}</li>}
              {e.telefono && (
                <li>
                  <a href={`tel:${e.telefono.replace(/\s/g, '')}`}>{e.telefono}</a>
                </li>
              )}
              {e.email && (
                <li>
                  <a href={`mailto:${e.email}`}>{e.email}</a>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {e.nombre}. Todos los derechos reservados.
          </span>
          <span>태권도 · Taekwondo</span>
        </div>
      </div>
    </footer>
  )
}

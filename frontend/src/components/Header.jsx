import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { useEscuela } from '../context/EscuelaContext'

export const LINKS = [
  ['/', 'Inicio'],
  ['/historia', 'Historia'],
  ['/profesor', 'Sabonim'],
  ['/galeria', 'Galería'],
  ['/calendario', 'Calendario'],
  ['/descargas', 'Descargas'],
  ['/contacto', 'Contacto'],
]

export default function Header() {
  const { user } = useAuth()
  const { nombre } = useEscuela()
  const { pathname } = useLocation()
  const [abierto, setAbierto] = useState(false)
  const [scrolleado, setScrolleado] = useState(false)

  useEffect(() => {
    const actualizar = () => setScrolleado(window.scrollY > 40)
    window.addEventListener('scroll', actualizar, { passive: true })
    actualizar()
    return () => window.removeEventListener('scroll', actualizar)
  }, [])

  // Cerrar el menú mobile al navegar
  useEffect(() => setAbierto(false), [pathname])

  // En la portada el header arranca transparente sobre el banner
  const solido = pathname !== '/' || scrolleado || abierto

  return (
    <header className={`site-header ${solido ? 'solid' : ''}`}>
      <div className="container header-inner">
        <Link className="logo" to="/">
          <img src="/img/logo.jpg" alt="" />
          {nombre}
        </Link>
        <button
          className="menu-toggle"
          aria-label="Abrir menú"
          aria-expanded={abierto}
          onClick={() => setAbierto((a) => !a)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav className={`nav ${abierto ? 'open' : ''}`}>
          {LINKS.map(([to, texto]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {texto}
            </NavLink>
          ))}
          {user ? (
            <Link className="btn btn-sm" to={user.rol === 'admin' ? '/admin' : '/alumno'}>
              {user.rol === 'admin' ? 'Panel admin' : 'Mi panel'}
            </Link>
          ) : (
            <Link className="btn btn-sm" to="/login">
              Alumnos
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { getMensajes } from '../../api/client'
import CambiarPassword from '../../components/CambiarPassword'
import AdminAlumnos from './AdminAlumnos'
import AdminClases from './AdminClases'
import AdminCalendario from './AdminCalendario'
import AdminDescargas from './AdminDescargas'
import AdminGaleria from './AdminGaleria'
import AdminMensajes from './AdminMensajes'

const VISTAS = [
  ['clases', 'Clases y avisos'],
  ['calendario', 'Calendario'],
  ['alumnos', 'Alumnos'],
  ['galeria', 'Galería'],
  ['descargas', 'Material'],
  ['mensajes', 'Mensajes'],
  ['cuenta', 'Mi cuenta'],
]

export default function Admin() {
  const [vista, setVista] = useState('clases')
  const [mensajes, setMensajes] = useState([])

  const recargarMensajes = useCallback(() => {
    getMensajes()
      .then(setMensajes)
      .catch(() => {})
  }, [])

  useEffect(recargarMensajes, [recargarMensajes])

  const noLeidos = mensajes.filter((m) => !m.leido).length

  return (
    <>
      <div className="page-hero admin-hero">
        <div className="container">
          <span className="eyebrow">Administración</span>
          <h1>
            Panel del <span className="accent">Sabonim</span>
          </h1>
          <div className="tabs" role="tablist">
            {VISTAS.map(([id, label]) => (
              <button key={id} role="tab" className={vista === id ? 'active' : ''} onClick={() => setVista(id)}>
                {label}
                {id === 'mensajes' && noLeidos > 0 && <span className="count">{noLeidos}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="admin-section">
        <div className="container">
          {vista === 'clases' && <AdminClases />}
          {vista === 'calendario' && <AdminCalendario />}
          {vista === 'alumnos' && <AdminAlumnos />}
          {vista === 'galeria' && <AdminGaleria />}
          {vista === 'descargas' && <AdminDescargas />}
          {vista === 'mensajes' && <AdminMensajes mensajes={mensajes} onCambio={recargarMensajes} />}
          {vista === 'cuenta' && (
            <div className="panel" style={{ maxWidth: 560 }}>
              <h2>Cambiar mi contraseña</h2>
              <CambiarPassword />
            </div>
          )}
        </div>
      </section>
    </>
  )
}

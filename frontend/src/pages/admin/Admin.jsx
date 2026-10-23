import { useCallback, useEffect, useState } from 'react'
import { getMensajes } from '../../api/client'
import CambiarPassword from '../../components/CambiarPassword'
import AdminAlumnos from './AdminAlumnos'
import AdminGaleria from './AdminGaleria'
import AdminMensajes from './AdminMensajes'

const VISTAS = [
  ['alumnos', 'Alumnos'],
  ['galeria', 'Galería'],
  ['mensajes', 'Mensajes'],
  ['cuenta', 'Mi cuenta'],
]

export default function Admin() {
  const [vista, setVista] = useState('alumnos')
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
          {vista === 'alumnos' && <AdminAlumnos />}
          {vista === 'galeria' && <AdminGaleria />}
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

import { useCallback, useEffect, useState } from 'react'
import { borrarRegistro, getAlumno } from '../../api/client'
import { useToast } from '../../context/ToastContext'
import RegistrosTabs from '../../components/RegistrosTabs'
import AlumnoForm from './AlumnoForm'
import AptoFisico from './AptoFisico'
import RegistroForm from './RegistroForm'

export default function AlumnoDetalle({ id, onCambio, onEliminado }) {
  const toast = useToast()
  const [datos, setDatos] = useState(null)

  const cargar = useCallback(() => getAlumno(id).then(setDatos), [id])

  useEffect(() => {
    cargar().catch((err) => toast(err.message, 'error'))
  }, [cargar, toast])

  // Después de cualquier cambio se refresca la ficha y la lista de la izquierda
  const refrescar = () => Promise.all([cargar(), onCambio()])

  async function borrar(registro) {
    if (!confirm(`¿Borrar "${registro.titulo}"? Esta acción no se puede deshacer.`)) return
    try {
      await borrarRegistro(registro.id)
      toast('Registro borrado')
      refrescar()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  if (!datos) return <div className="panel cargando">Cargando…</div>

  return (
    <>
      <AlumnoForm alumno={datos.user} clases={datos.clases} onGuardado={refrescar} onEliminado={onEliminado} />
      <AptoFisico alumno={datos.user} apto={datos.apto} onCambio={refrescar} />
      <RegistroForm alumno={datos.user} onAgregado={refrescar} />
      <div className="panel">
        <h2>Historial</h2>
        <RegistrosTabs registros={datos.registros} onBorrar={borrar} />
      </div>
    </>
  )
}

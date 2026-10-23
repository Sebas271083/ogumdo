import { borrarAlumno, crearAlumno, editarAlumno } from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { CINTURONES } from '../../utils/cinturones'

// Alta (sin `alumno`) o edición de los datos de un alumno
export default function AlumnoForm({ alumno, onGuardado, onEliminado }) {
  const toast = useToast()
  const nuevo = !alumno

  async function guardar(ev) {
    ev.preventDefault()
    const datos = Object.fromEntries(new FormData(ev.currentTarget))
    try {
      if (nuevo) {
        const { id } = await crearAlumno(datos)
        toast('Alumno creado')
        onGuardado(id)
      } else {
        await editarAlumno(alumno.id, datos)
        toast('Datos guardados')
        onGuardado(alumno.id)
      }
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar a ${alumno.nombre} y todos sus registros? Esta acción no se puede deshacer.`)) return
    try {
      await borrarAlumno(alumno.id)
      toast('Alumno eliminado')
      onEliminado()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <div className="panel">
      <h2>{nuevo ? 'Nuevo alumno' : alumno.nombre}</h2>
      <form className="form" onSubmit={guardar} key={alumno?.id ?? 'nuevo'}>
        <div className="form-row">
          <label>
            Nombre completo *
            <input name="nombre" required defaultValue={alumno?.nombre} />
          </label>
          <label>
            Email (usuario) *
            <input name="email" type="email" required defaultValue={alumno?.email} />
          </label>
        </div>
        <div className="form-row">
          <label>
            Fecha de nacimiento
            <input name="fecha_nacimiento" type="date" defaultValue={alumno?.fecha_nacimiento ?? ''} />
          </label>
          <label>
            Fecha de ingreso
            <input name="fecha_ingreso" type="date" defaultValue={alumno?.fecha_ingreso ?? ''} />
          </label>
        </div>
        <div className="form-row">
          <label>
            Cinturón actual
            <select name="cinturon_actual" defaultValue={alumno?.cinturon_actual ?? 'blanco'}>
              {CINTURONES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} – {c.grado}
                </option>
              ))}
            </select>
          </label>
          <label>
            {nuevo ? 'Contraseña *' : 'Nueva contraseña (vacío = no cambiarla)'}
            <input name="password" type="text" required={nuevo} minLength={8} autoComplete="off" />
          </label>
        </div>
        <div className="botones">
          <button className="btn btn-sm" type="submit">
            {nuevo ? 'Crear alumno' : 'Guardar cambios'}
          </button>
          {!nuevo && (
            <button className="btn btn-sm btn-danger" type="button" onClick={eliminar}>
              Eliminar alumno
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

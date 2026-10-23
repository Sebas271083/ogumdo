const API_URL = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const esFormulario = options.body instanceof FormData
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    // Con FormData el navegador arma el Content-Type (multipart con boundary)
    headers: esFormulario ? undefined : { 'Content-Type': 'application/json' },
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const err = new Error(data?.errores?.join(', ') || data?.error || `Error ${res.status}`)
    err.status = res.status
    throw err
  }
  return data
}

const json = (body) => JSON.stringify(body)

export const archivoRegistroUrl = (id) => `${API_URL}/registros/${id}/archivo`

// Sesión
export const getMe = () => request('/auth/me')
export const login = (email, password) => request('/auth/login', { method: 'POST', body: json({ email, password }) })
export const logout = () => request('/auth/logout', { method: 'POST' })
export const cambiarPassword = (actual, nueva) =>
  request('/auth/password', { method: 'POST', body: json({ actual, nueva }) })

// Público
export const getEscuela = () => request('/contenido/escuela')
export const getProfesor = () => request('/contenido/profesor')
export const getGaleria = (params = {}) => request(`/galeria?${new URLSearchParams(params)}`)
export const enviarContacto = (datos) => request('/contacto', { method: 'POST', body: json(datos) })

// Alumno
export const getPerfil = () => request('/alumno/perfil')

// Clases y asistencia
export const getProximasClases = () => request('/clases/proximas')
export const responderClase = (claseId, fecha, asiste) =>
  request(`/clases/${claseId}/${fecha}/asistencia`, { method: 'PUT', body: json({ asiste }) })
export const getAvisos = () => request('/avisos')

// Notificaciones push
export const getClavePush = () => request('/push/clave')
export const suscribirPush = (suscripcion) => request('/push/suscripcion', { method: 'POST', body: json(suscripcion) })
export const desuscribirPush = (endpoint) => request('/push/suscripcion', { method: 'DELETE', body: json({ endpoint }) })
export const probarPush = () => request('/push/prueba', { method: 'POST' })

// Admin
export const cancelarClase = (claseId, fecha, motivo) =>
  request(`/admin/clases/${claseId}/${fecha}/cancelacion`, { method: 'POST', body: json({ motivo }) })
export const reactivarClase = (claseId, fecha) => request(`/admin/clases/${claseId}/${fecha}/cancelacion`, { method: 'DELETE' })
export const publicarAviso = (titulo, mensaje) => request('/admin/avisos', { method: 'POST', body: json({ titulo, mensaje }) })
export const borrarAviso = (id) => request(`/admin/avisos/${id}`, { method: 'DELETE' })

export const getAlumnos = () => request('/admin/alumnos')
export const getAlumno = (id) => request(`/admin/alumnos/${id}`)
export const crearAlumno = (datos) => request('/admin/alumnos', { method: 'POST', body: json(datos) })
export const editarAlumno = (id, datos) => request(`/admin/alumnos/${id}`, { method: 'PUT', body: json(datos) })
export const borrarAlumno = (id) => request(`/admin/alumnos/${id}`, { method: 'DELETE' })
export const agregarRegistro = (alumnoId, formData) =>
  request(`/admin/alumnos/${alumnoId}/registros`, { method: 'POST', body: formData })
export const borrarRegistro = (id) => request(`/admin/registros/${id}`, { method: 'DELETE' })

export const subirFotos = (formData) => request('/admin/galeria', { method: 'POST', body: formData })
export const borrarFoto = (id) => request(`/admin/galeria/${id}`, { method: 'DELETE' })

export const getMensajes = () => request('/admin/mensajes')
export const marcarMensaje = (id, leido) => request(`/admin/mensajes/${id}`, { method: 'PATCH', body: json({ leido }) })
export const borrarMensaje = (id) => request(`/admin/mensajes/${id}`, { method: 'DELETE' })

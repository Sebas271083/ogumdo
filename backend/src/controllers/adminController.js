import {
  listarAlumnos,
  getAlumno,
  crearUsuario,
  actualizarAlumno,
  actualizarCinturon,
  borrarAlumno,
  cambiarPassword,
} from "../services/usuariosService.js";
import {
  TIPOS_REGISTRO,
  listarRegistros,
  crearRegistro,
  getRegistro,
  archivosDeUsuario,
  borrarRegistro,
} from "../services/registrosService.js";
import { borrarSesionesDeUsuario } from "../services/sesionesService.js";
import { clasesDeAlumno, asignarClases } from "../services/clasesService.js";
import { listarMensajes, marcarLeido, borrarMensaje } from "../services/mensajesService.js";
import {
  crearFotos,
  getFoto,
  borrarFoto,
  moverFoto,
  existeAlbum,
  crearAlbum,
  actualizarAlbum,
  borrarAlbum,
} from "../services/galeriaService.js";
import { esFechaIso } from "../utils/fechas.js";
import { borrarArchivo } from "../middleware/upload.js";
import { httpError } from "../utils/httpError.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function datosAlumno(body, { passwordObligatoria }) {
  const datos = {
    nombre: String(body?.nombre ?? "").trim(),
    email: String(body?.email ?? "").trim(),
    password: String(body?.password ?? ""),
    fecha_nacimiento: body?.fecha_nacimiento,
    fecha_ingreso: body?.fecha_ingreso,
    cinturon_actual: body?.cinturon_actual,
  };
  if (!datos.nombre) throw httpError(400, "El nombre es obligatorio");
  if (!EMAIL_RE.test(datos.email)) throw httpError(400, "Email inválido");
  if ((passwordObligatoria || datos.password) && datos.password.length < 8) {
    throw httpError(400, "La contraseña debe tener al menos 8 caracteres");
  }
  return datos;
}

// ===== Alumnos =====

export async function alumnos(req, res, next) {
  try {
    res.json(await listarAlumnos());
  } catch (err) {
    next(err);
  }
}

export async function alumno(req, res, next) {
  try {
    const user = await getAlumno(Number(req.params.id));
    if (!user) return res.status(404).json({ error: "Alumno no encontrado" });
    res.json({ user, registros: await listarRegistros(user.id), clases: await clasesDeAlumno(user.id) });
  } catch (err) {
    next(err);
  }
}

export async function crearAlumno(req, res, next) {
  try {
    const id = await crearUsuario(datosAlumno(req.body, { passwordObligatoria: true }));
    if (Array.isArray(req.body?.clases)) await asignarClases(id, req.body.clases);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
}

export async function editarAlumno(req, res, next) {
  try {
    const id = Number(req.params.id);
    const datos = datosAlumno(req.body, { passwordObligatoria: false });
    if (!(await actualizarAlumno(id, datos))) return res.status(404).json({ error: "Alumno no encontrado" });
    if (Array.isArray(req.body?.clases)) await asignarClases(id, req.body.clases);
    if (datos.password) {
      await cambiarPassword(id, datos.password);
      await borrarSesionesDeUsuario(id); // lo desloguea de todos lados
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function eliminarAlumno(req, res, next) {
  try {
    const id = Number(req.params.id);
    const archivos = await archivosDeUsuario(id);
    if (!(await borrarAlumno(id))) return res.status(404).json({ error: "Alumno no encontrado" });
    archivos.forEach(borrarArchivo);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// ===== Registros (graduaciones, títulos, capacitaciones, logros) =====

export async function agregarRegistro(req, res, next) {
  try {
    const usuarioId = Number(req.params.id);
    const b = req.body ?? {};
    if (!(await getAlumno(usuarioId))) throw httpError(404, "Alumno no encontrado");
    if (!TIPOS_REGISTRO.includes(b.tipo)) throw httpError(400, "Tipo de registro inválido");
    if (!String(b.titulo ?? "").trim()) throw httpError(400, "El título es obligatorio");

    const cinturon = b.tipo === "graduacion" ? b.cinturon || null : null;
    await crearRegistro({
      usuarioId,
      tipo: b.tipo,
      titulo: b.titulo.trim(),
      descripcion: b.descripcion?.trim(),
      fecha: b.fecha,
      cinturon,
      archivo: req.file?.filename,
      archivoNombre: req.file?.originalname,
    });
    // Una graduación nueva puede actualizar el cinturón actual del alumno
    if (cinturon && b.actualizar_cinturon === "true") await actualizarCinturon(usuarioId, cinturon);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function eliminarRegistro(req, res, next) {
  try {
    const r = await getRegistro(Number(req.params.id));
    if (!r) return res.status(404).json({ error: "Registro no encontrado" });
    await borrarRegistro(r.id);
    borrarArchivo(r.archivo);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// ===== Galería =====

// "" / null / "dojang" = fotos generales (sin álbum)
async function albumValido(valor) {
  if (!valor || valor === "dojang") return null;
  const id = Number(valor);
  if (!(await existeAlbum(id))) throw httpError(400, "El álbum no existe");
  return id;
}

export async function subirFotos(req, res, next) {
  try {
    if (!req.files?.length) throw httpError(400, "Elegí al menos una foto");
    const albumId = await albumValido(req.body?.album_id);
    await crearFotos(String(req.body?.titulo ?? "").trim().slice(0, 150), req.files.map((f) => f.filename), albumId);
    res.status(201).json({ ok: true, cantidad: req.files.length });
  } catch (err) {
    next(err);
  }
}

export async function cambiarAlbumFoto(req, res, next) {
  try {
    const foto = await getFoto(Number(req.params.id));
    if (!foto) return res.status(404).json({ error: "Foto no encontrada" });
    await moverFoto(foto.id, await albumValido(req.body?.album_id));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

function datosAlbum(body) {
  const datos = {
    nombre: String(body?.nombre ?? "").trim(),
    descripcion: String(body?.descripcion ?? "").trim().slice(0, 300),
    fecha: body?.fecha || null,
  };
  if (!datos.nombre || datos.nombre.length > 120) throw httpError(400, "El nombre es obligatorio (máx. 120 caracteres)");
  if (datos.fecha && !esFechaIso(datos.fecha)) throw httpError(400, "Fecha inválida");
  return datos;
}

export async function nuevoAlbum(req, res, next) {
  try {
    res.status(201).json({ id: await crearAlbum(datosAlbum(req.body)) });
  } catch (err) {
    next(err);
  }
}

export async function editarAlbum(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!(await existeAlbum(id))) return res.status(404).json({ error: "Álbum no encontrado" });
    await actualizarAlbum(id, datosAlbum(req.body));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function eliminarAlbum(req, res, next) {
  try {
    await borrarAlbum(Number(req.params.id));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function eliminarFoto(req, res, next) {
  try {
    const foto = await getFoto(Number(req.params.id));
    if (!foto) return res.status(404).json({ error: "Foto no encontrada" });
    await borrarFoto(foto.id);
    borrarArchivo(foto.archivo);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// ===== Mensajes de contacto =====

export async function mensajes(req, res, next) {
  try {
    res.json(await listarMensajes());
  } catch (err) {
    next(err);
  }
}

export async function editarMensaje(req, res, next) {
  try {
    await marcarLeido(Number(req.params.id), req.body?.leido);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function eliminarMensaje(req, res, next) {
  try {
    await borrarMensaje(Number(req.params.id));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

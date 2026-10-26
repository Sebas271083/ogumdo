import {
  CATEGORIAS_DESCARGA,
  listarDescargas,
  getDescarga,
  crearDescarga,
  actualizarDescarga,
  borrarDescarga,
  payloadMaterialNuevo,
} from "../services/descargasService.js";
import { enviarATodosLosAlumnos } from "../services/pushService.js";
import { borrarArchivo, enviarArchivo } from "../middleware/upload.js";
import { httpError } from "../utils/httpError.js";

// Checkbox de un formulario multipart ("true"/"on") o booleano de JSON
const esVerdadero = (v) => v === true || v === "true" || v === "on";

function datosDescarga(body) {
  const datos = {
    titulo: String(body?.titulo ?? "").trim(),
    descripcion: String(body?.descripcion ?? "").trim().slice(0, 300),
    categoria: CATEGORIAS_DESCARGA.includes(body?.categoria) ? body.categoria : "otros",
    publico: esVerdadero(body?.publico),
  };
  if (!datos.titulo || datos.titulo.length > 150) throw httpError(400, "El título es obligatorio (máx. 150 caracteres)");
  return datos;
}

// Visitantes: solo las públicas. Con sesión (alumnos y Sabonim): todas.
export async function listar(req, res, next) {
  try {
    res.json(await listarDescargas({ soloPublicas: !req.user }));
  } catch (err) {
    next(err);
  }
}

export async function archivo(req, res, next) {
  try {
    const d = await getDescarga(Number(req.params.id));
    if (!d) return res.status(404).json({ error: "Archivo no encontrado" });
    if (!d.publico && !req.user) return res.status(401).json({ error: "Este archivo es solo para alumnos: iniciá sesión" });
    enviarArchivo(res, d.archivo, { descarga: d.archivo_nombre, adjunto: req.query.ver === undefined });
  } catch (err) {
    next(err);
  }
}

export async function subir(req, res, next) {
  try {
    if (!req.file) throw httpError(400, "Elegí un archivo");
    const datos = datosDescarga(req.body);
    const id = await crearDescarga({
      ...datos,
      archivo: req.file.filename,
      archivoNombre: req.file.originalname,
      tamano: req.file.size,
    });
    const enviados = esVerdadero(req.body?.notificar)
      ? await enviarATodosLosAlumnos(payloadMaterialNuevo({ id, titulo: datos.titulo, categoria: datos.categoria, tipo: "archivo" }))
      : 0;
    res.status(201).json({ id, enviados });
  } catch (err) {
    next(err);
  }
}

export async function editar(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!(await getDescarga(id))) return res.status(404).json({ error: "Archivo no encontrado" });
    await actualizarDescarga(id, datosDescarga(req.body));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    const d = await getDescarga(Number(req.params.id));
    if (!d) return res.status(404).json({ error: "Archivo no encontrado" });
    await borrarDescarga(d.id);
    borrarArchivo(d.archivo);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

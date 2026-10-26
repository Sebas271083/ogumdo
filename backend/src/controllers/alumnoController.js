import { listarRegistros, getRegistro } from "../services/registrosService.js";
import { aptoDeAlumno, getApto } from "../services/aptosService.js";
import { enviarArchivo } from "../middleware/upload.js";

export async function perfil(req, res, next) {
  try {
    const [registros, apto] = await Promise.all([listarRegistros(req.user.id), aptoDeAlumno(req.user.id)]);
    res.json({ user: req.user, registros, apto });
  } catch (err) {
    next(err);
  }
}

// Diploma adjunto a un registro: solo lo ve el alumno dueño o un admin
export async function archivoRegistro(req, res, next) {
  try {
    const r = await getRegistro(Number(req.params.id));
    if (!r?.archivo) return res.status(404).json({ error: "Archivo no encontrado" });
    if (r.usuario_id !== req.user.id && req.user.rol !== "admin") {
      return res.status(403).json({ error: "No tenés permiso" });
    }
    enviarArchivo(res, r.archivo, { descarga: r.archivo_nombre || r.archivo });
  } catch (err) {
    next(err);
  }
}

// Certificado del apto físico: dato médico, solo el alumno dueño o un admin
export async function archivoApto(req, res, next) {
  try {
    const a = await getApto(Number(req.params.id));
    if (!a?.archivo) return res.status(404).json({ error: "Archivo no encontrado" });
    if (a.usuario_id !== req.user.id && req.user.rol !== "admin") {
      return res.status(403).json({ error: "No tenés permiso" });
    }
    enviarArchivo(res, a.archivo, { descarga: a.archivo_nombre || a.archivo });
  } catch (err) {
    next(err);
  }
}

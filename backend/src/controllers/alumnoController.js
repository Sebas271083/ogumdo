import { listarRegistros, getRegistro } from "../services/registrosService.js";
import { enviarArchivo } from "../middleware/upload.js";

export async function perfil(req, res, next) {
  try {
    res.json({ user: req.user, registros: await listarRegistros(req.user.id) });
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

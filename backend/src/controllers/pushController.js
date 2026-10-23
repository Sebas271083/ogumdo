import {
  clavePublica,
  guardarSuscripcion,
  borrarSuscripcion,
  enviarAUsuarios,
  pushHabilitado,
  alumnosConNotificaciones,
} from "../services/pushService.js";
import { httpError } from "../utils/httpError.js";

export function clave(req, res) {
  res.json({ clave: clavePublica() });
}

export async function suscribir(req, res, next) {
  try {
    if (!pushHabilitado) throw httpError(503, "Las notificaciones no están configuradas en el servidor");
    const { endpoint, keys } = req.body ?? {};
    if (!String(endpoint ?? "").startsWith("https://") || endpoint.length > 500 || !keys?.p256dh || !keys?.auth) {
      throw httpError(400, "Suscripción inválida");
    }
    await guardarSuscripcion(req.user.id, { endpoint, keys });
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function desuscribir(req, res, next) {
  try {
    await borrarSuscripcion(req.user.id, String(req.body?.endpoint ?? ""));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function estado(req, res, next) {
  try {
    res.json({ habilitado: pushHabilitado, alumnos: await alumnosConNotificaciones() });
  } catch (err) {
    next(err);
  }
}

export async function probar(req, res, next) {
  try {
    const enviados = await enviarAUsuarios([req.user.id], {
      titulo: "¡Notificaciones activadas! 🥋",
      cuerpo: "Así te van a llegar los recordatorios de clase y los avisos del Sabonim.",
      url: req.user.rol === "admin" ? "/admin" : "/alumno",
      tag: "prueba",
    });
    res.json({ enviados });
  } catch (err) {
    next(err);
  }
}

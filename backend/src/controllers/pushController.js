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

// Solo los servicios push de los navegadores. Si se aceptara cualquier URL, un usuario podría
// hacer que el servidor mande pedidos a donde quiera (SSRF), incluso a la red interna.
const SERVICIOS_PUSH = [
  (h) => h === "fcm.googleapis.com" || h === "android.googleapis.com", // Chrome, Edge, Android
  (h) => h.endsWith(".push.services.mozilla.com"), // Firefox
  (h) => h === "web.push.apple.com" || h.endsWith(".push.apple.com"), // Safari / iPhone
  (h) => h.endsWith(".notify.windows.com"), // Edge en Windows
];

function endpointValido(endpoint) {
  try {
    const url = new URL(String(endpoint));
    return url.protocol === "https:" && !url.port && SERVICIOS_PUSH.some((ok) => ok(url.hostname));
  } catch {
    return false;
  }
}

const claveValida = (s, max) => typeof s === "string" && s.length <= max && /^[A-Za-z0-9_-]+=*$/.test(s);

export async function suscribir(req, res, next) {
  try {
    if (!pushHabilitado) throw httpError(503, "Las notificaciones no están configuradas en el servidor");
    const { endpoint, keys } = req.body ?? {};
    if (
      !endpointValido(endpoint) ||
      endpoint.length > 500 ||
      !claveValida(keys?.p256dh, 200) ||
      !claveValida(keys?.auth, 100)
    ) {
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

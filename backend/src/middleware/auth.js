import { usuarioDeSesion, DURACION_SESION_MS } from "../services/sesionesService.js";

export const COOKIE_SESION = "tkd_sesion";

export function leerToken(req) {
  for (const parte of (req.headers.cookie || "").split(";")) {
    const [clave, ...valor] = parte.trim().split("=");
    if (clave === COOKIE_SESION) return decodeURIComponent(valor.join("="));
  }
  return null;
}

export function setCookieSesion(res, token) {
  res.cookie(COOKIE_SESION, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: DURACION_SESION_MS,
  });
}

export async function cargarUsuario(req, res, next) {
  try {
    const token = leerToken(req);
    req.user = token ? await usuarioDeSesion(token) : null;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Tenés que iniciar sesión" });
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Tenés que iniciar sesión" });
  if (req.user.rol !== "admin") return res.status(403).json({ error: "No tenés permiso" });
  next();
}

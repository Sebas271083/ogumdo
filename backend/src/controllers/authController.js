import { verificarCredenciales, verificarPassword, cambiarPassword } from "../services/usuariosService.js";
import { crearSesion, borrarSesion } from "../services/sesionesService.js";
import { COOKIE_SESION, leerToken, setCookieSesion } from "../middleware/auth.js";

// Límite simple de intentos fallidos de login por IP
const intentos = new Map();
const VENTANA_MS = 15 * 60 * 1000;
const MAX_INTENTOS = 10;

function bloqueado(ip) {
  const r = intentos.get(ip);
  return Boolean(r && r.reset > Date.now() && r.count >= MAX_INTENTOS);
}

function registrarFallo(ip) {
  const r = intentos.get(ip);
  if (!r || r.reset < Date.now()) intentos.set(ip, { count: 1, reset: Date.now() + VENTANA_MS });
  else r.count++;
}

export async function login(req, res, next) {
  try {
    if (bloqueado(req.ip)) {
      return res.status(429).json({ error: "Demasiados intentos. Probá de nuevo en unos minutos." });
    }
    const email = String(req.body?.email ?? "").trim();
    const password = String(req.body?.password ?? "");
    const user = await verificarCredenciales(email, password);
    if (!user) {
      registrarFallo(req.ip);
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }
    intentos.delete(req.ip);
    setCookieSesion(res, await crearSesion(user.id));
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const token = leerToken(req);
    if (token) await borrarSesion(token);
    res.clearCookie(COOKIE_SESION);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export function me(req, res) {
  if (!req.user) return res.status(401).json({ error: "Sin sesión" });
  res.json({ user: req.user });
}

export async function password(req, res, next) {
  try {
    const actual = String(req.body?.actual ?? "");
    const nueva = String(req.body?.nueva ?? "");
    if (nueva.length < 8) return res.status(400).json({ error: "La nueva contraseña debe tener al menos 8 caracteres" });
    if (!(await verificarPassword(req.user.id, actual))) {
      return res.status(400).json({ error: "La contraseña actual no es correcta" });
    }
    await cambiarPassword(req.user.id, nueva);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

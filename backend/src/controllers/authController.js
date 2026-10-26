import { verificarCredenciales, verificarPassword, cambiarPassword } from "../services/usuariosService.js";
import { crearSesion, borrarSesion, borrarOtrasSesiones } from "../services/sesionesService.js";
import { COOKIE_SESION, leerToken, setCookieSesion } from "../middleware/auth.js";
import { crearLimitador } from "../utils/limitador.js";

// Intentos fallidos de login por IP: 10 cada 15 minutos
const fallosLogin = crearLimitador({ max: 10, ventanaMs: 15 * 60 * 1000 });

export async function login(req, res, next) {
  try {
    if (fallosLogin.bloqueado(req.ip)) {
      return res.status(429).json({ error: "Demasiados intentos. Probá de nuevo en unos minutos." });
    }
    const email = String(req.body?.email ?? "").trim().slice(0, 150);
    const password = String(req.body?.password ?? "").slice(0, 200);
    const user = await verificarCredenciales(email, password);
    if (!user) {
      fallosLogin.sumar(req.ip);
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }
    fallosLogin.limpiar(req.ip);
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

// Sin sesión responde { user: null } (no 401): es la pregunta normal de cada visitante y un
// 401 aparecería como error en la consola del navegador en todas las páginas
export function me(req, res) {
  res.json({ user: req.user ?? null });
}

export async function password(req, res, next) {
  try {
    const actual = String(req.body?.actual ?? "");
    const nueva = String(req.body?.nueva ?? "");
    if (nueva.length < 8) return res.status(400).json({ error: "La nueva contraseña debe tener al menos 8 caracteres" });
    // bcrypt solo usa los primeros 72 bytes: más largo daría una falsa sensación de seguridad
    if (Buffer.byteLength(nueva) > 72) return res.status(400).json({ error: "La nueva contraseña es demasiado larga" });
    if (!(await verificarPassword(req.user.id, actual))) {
      return res.status(400).json({ error: "La contraseña actual no es correcta" });
    }
    await cambiarPassword(req.user.id, nueva);
    // Si alguien más tenía la sesión abierta (otro celular, otra PC), queda afuera
    await borrarOtrasSesiones(req.user.id, leerToken(req));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

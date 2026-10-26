import { randomBytes, createHash } from "node:crypto";
import { pool } from "../config/db.js";

export const DURACION_SESION_MS = 1000 * 60 * 60 * 24 * 14; // 14 días

// En la base se guarda solo el hash: si alguien lee la tabla no puede usar los tokens
const sha256 = (s) => createHash("sha256").update(s).digest("hex");

export async function crearSesion(usuarioId) {
  const token = randomBytes(32).toString("hex");
  await pool.query(
    "INSERT INTO sesiones (token_hash, usuario_id, expira_ts) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND))",
    [sha256(token), usuarioId, DURACION_SESION_MS / 1000]
  );
  return token;
}

export async function usuarioDeSesion(token) {
  const [rows] = await pool.query(
    `SELECT u.id, u.email, u.nombre, u.rol, u.fecha_nacimiento, u.fecha_ingreso, u.cinturon_actual
     FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id
     WHERE s.token_hash = ? AND s.expira_ts > NOW()`,
    [sha256(token)]
  );
  return rows[0] ?? null;
}

export async function borrarSesion(token) {
  await pool.query("DELETE FROM sesiones WHERE token_hash = ?", [sha256(token)]);
}

// Cierra todas las sesiones del usuario menos la actual (al cambiar la contraseña)
export async function borrarOtrasSesiones(usuarioId, tokenActual) {
  await pool.query("DELETE FROM sesiones WHERE usuario_id = ? AND token_hash <> ?", [usuarioId, sha256(tokenActual ?? "")]);
}

export async function borrarSesionesDeUsuario(usuarioId) {
  await pool.query("DELETE FROM sesiones WHERE usuario_id = ?", [usuarioId]);
}

export async function limpiarSesionesVencidas() {
  await pool.query("DELETE FROM sesiones WHERE expira_ts < NOW()");
}

import { pool } from "../config/db.js";

export async function crearMensaje({ nombre, email, telefono, mensaje }) {
  await pool.query("INSERT INTO mensajes (nombre, email, telefono, mensaje) VALUES (?, ?, ?, ?)", [
    nombre,
    email,
    telefono || null,
    mensaje,
  ]);
}

export async function listarMensajes() {
  const [rows] = await pool.query("SELECT * FROM mensajes ORDER BY creado_ts DESC");
  return rows.map((m) => ({ ...m, leido: Boolean(m.leido) }));
}

export async function marcarLeido(id, leido) {
  await pool.query("UPDATE mensajes SET leido = ? WHERE id = ?", [Boolean(leido), id]);
}

export async function borrarMensaje(id) {
  await pool.query("DELETE FROM mensajes WHERE id = ?", [id]);
}

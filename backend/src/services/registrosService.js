import { pool } from "../config/db.js";

export const TIPOS_REGISTRO = ["graduacion", "titulo", "capacitacion", "logro"];

export async function listarRegistros(usuarioId) {
  const [rows] = await pool.query(
    `SELECT id, tipo, titulo, descripcion, fecha, cinturon, archivo_nombre, archivo IS NOT NULL AS tiene_archivo
     FROM registros WHERE usuario_id = ?
     ORDER BY fecha IS NULL, fecha DESC, id DESC`,
    [usuarioId]
  );
  return rows.map((r) => ({ ...r, tiene_archivo: Boolean(r.tiene_archivo) }));
}

export async function crearRegistro({ usuarioId, tipo, titulo, descripcion, fecha, cinturon, archivo, archivoNombre }) {
  const [res] = await pool.query(
    `INSERT INTO registros (usuario_id, tipo, titulo, descripcion, fecha, cinturon, archivo, archivo_nombre)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [usuarioId, tipo, titulo, descripcion || null, fecha || null, cinturon || null, archivo ?? null, archivoNombre ?? null]
  );
  return res.insertId;
}

export async function getRegistro(id) {
  const [rows] = await pool.query("SELECT * FROM registros WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function archivosDeUsuario(usuarioId) {
  const [rows] = await pool.query("SELECT archivo FROM registros WHERE usuario_id = ? AND archivo IS NOT NULL", [usuarioId]);
  return rows.map((r) => r.archivo);
}

export async function borrarRegistro(id) {
  await pool.query("DELETE FROM registros WHERE id = ?", [id]);
}

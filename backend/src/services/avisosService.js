import { pool } from "../config/db.js";

export async function listarAvisos({ limit = 10 } = {}) {
  const [rows] = await pool.query("SELECT * FROM avisos ORDER BY creado_ts DESC, id DESC LIMIT ?", [Math.min(Number(limit) || 10, 50)]);
  return rows;
}

export async function crearAviso(titulo, mensaje) {
  const [res] = await pool.query("INSERT INTO avisos (titulo, mensaje) VALUES (?, ?)", [titulo, mensaje]);
  return res.insertId;
}

export async function borrarAviso(id) {
  await pool.query("DELETE FROM avisos WHERE id = ?", [id]);
}

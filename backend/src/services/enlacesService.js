import { pool } from "../config/db.js";

const normalizar = (e) => ({ ...e, publico: Boolean(e.publico), enHistoria: Boolean(e.en_historia) });

export async function listarEnlaces({ soloPublicos = true } = {}) {
  const [rows] = await pool.query(
    `SELECT id, titulo, descripcion, url, categoria, publico, en_historia, creado_ts
     FROM enlaces ${soloPublicos ? "WHERE publico = TRUE" : ""}
     ORDER BY categoria, creado_ts DESC`
  );
  return rows.map(normalizar);
}

export async function getEnlace(id) {
  const [rows] = await pool.query("SELECT * FROM enlaces WHERE id = ?", [id]);
  return rows[0] ? normalizar(rows[0]) : null;
}

export async function crearEnlace({ titulo, descripcion, url, categoria, publico, enHistoria }) {
  const [res] = await pool.query(
    "INSERT INTO enlaces (titulo, descripcion, url, categoria, publico, en_historia) VALUES (?, ?, ?, ?, ?, ?)",
    [titulo, descripcion || null, url, categoria, publico, enHistoria]
  );
  return res.insertId;
}

export async function actualizarEnlace(id, { titulo, descripcion, url, categoria, publico, enHistoria }) {
  await pool.query(
    "UPDATE enlaces SET titulo = ?, descripcion = ?, url = ?, categoria = ?, publico = ?, en_historia = ? WHERE id = ?",
    [titulo, descripcion || null, url, categoria, publico, enHistoria, id]
  );
}

export async function borrarEnlace(id) {
  await pool.query("DELETE FROM enlaces WHERE id = ?", [id]);
}

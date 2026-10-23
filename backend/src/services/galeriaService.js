import { pool } from "../config/db.js";

const conUrl = (f) => ({ id: f.id, titulo: f.titulo, url: `/api/galeria/${f.id}/imagen` });

export async function listarFotos({ limit } = {}) {
  const limitSeguro = Math.min(Number(limit) || 500, 500);
  const [rows] = await pool.query("SELECT id, titulo FROM galeria ORDER BY creado_ts DESC, id DESC LIMIT ?", [limitSeguro]);
  return rows.map(conUrl);
}

export async function crearFotos(titulo, archivos) {
  for (const archivo of archivos) {
    await pool.query("INSERT INTO galeria (titulo, archivo) VALUES (?, ?)", [titulo || null, archivo]);
  }
}

export async function getFoto(id) {
  const [rows] = await pool.query("SELECT * FROM galeria WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function borrarFoto(id) {
  await pool.query("DELETE FROM galeria WHERE id = ?", [id]);
}

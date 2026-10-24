import { pool } from "../config/db.js";

export const CATEGORIAS_DESCARGA = ["historia", "reglamentos", "traducciones", "formas", "otros"];

const publicar = (d) => ({ ...d, publico: Boolean(d.publico), url: `/api/descargas/${d.id}/archivo` });

// soloPublicas: para visitantes sin sesión
export async function listarDescargas({ soloPublicas = true } = {}) {
  const [rows] = await pool.query(
    `SELECT id, titulo, descripcion, categoria, archivo_nombre, tamano, publico, creado_ts
     FROM descargas ${soloPublicas ? "WHERE publico = TRUE" : ""}
     ORDER BY categoria, titulo`
  );
  return rows.map(publicar);
}

export async function getDescarga(id) {
  const [rows] = await pool.query("SELECT * FROM descargas WHERE id = ?", [id]);
  return rows[0] ? publicar(rows[0]) : null;
}

export async function crearDescarga({ titulo, descripcion, categoria, archivo, archivoNombre, tamano, publico }) {
  const [res] = await pool.query(
    `INSERT INTO descargas (titulo, descripcion, categoria, archivo, archivo_nombre, tamano, publico)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [titulo, descripcion || null, categoria, archivo, archivoNombre, tamano, publico]
  );
  return res.insertId;
}

export async function actualizarDescarga(id, { titulo, descripcion, categoria, publico }) {
  await pool.query("UPDATE descargas SET titulo = ?, descripcion = ?, categoria = ?, publico = ? WHERE id = ?", [
    titulo,
    descripcion || null,
    categoria,
    publico,
    id,
  ]);
}

export async function borrarDescarga(id) {
  await pool.query("DELETE FROM descargas WHERE id = ?", [id]);
}

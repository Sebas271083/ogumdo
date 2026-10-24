import { pool } from "../config/db.js";

const conUrl = (f) => ({ id: f.id, titulo: f.titulo, albumId: f.album_id, url: `/api/galeria/${f.id}/imagen` });

export async function listarFotos({ limit, album } = {}) {
  const limitSeguro = Math.min(Number(limit) || 500, 500);
  const condiciones = [];
  const params = [];
  // album: id de un álbum, o "dojang" para las fotos generales (sin álbum)
  if (album === "dojang") condiciones.push("album_id IS NULL");
  else if (album) {
    condiciones.push("album_id = ?");
    params.push(Number(album));
  }
  params.push(limitSeguro);
  const [rows] = await pool.query(
    `SELECT id, titulo, album_id FROM galeria
     ${condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : ""}
     ORDER BY creado_ts DESC, id DESC LIMIT ?`,
    params
  );
  return rows.map(conUrl);
}

export async function crearFotos(titulo, archivos, albumId = null) {
  for (const archivo of archivos) {
    await pool.query("INSERT INTO galeria (titulo, archivo, album_id) VALUES (?, ?, ?)", [titulo || null, archivo, albumId]);
  }
}

export async function getFoto(id) {
  const [rows] = await pool.query("SELECT * FROM galeria WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function moverFoto(id, albumId) {
  await pool.query("UPDATE galeria SET album_id = ? WHERE id = ?", [albumId, id]);
}

export async function borrarFoto(id) {
  await pool.query("DELETE FROM galeria WHERE id = ?", [id]);
}

// ===== Álbumes =====

// Con cantidad de fotos y la más reciente como portada
export async function listarAlbumes() {
  const [rows] = await pool.query(
    `SELECT a.id, a.nombre, a.descripcion, a.fecha, COUNT(g.id) AS cantidad, MAX(g.id) AS portada_id
     FROM albumes a LEFT JOIN galeria g ON g.album_id = a.id
     GROUP BY a.id
     ORDER BY a.fecha IS NULL, a.fecha DESC, a.id DESC`
  );
  return rows.map(({ portada_id, ...a }) => ({
    ...a,
    portada: portada_id ? `/api/galeria/${portada_id}/imagen` : null,
  }));
}

export async function existeAlbum(id) {
  const [rows] = await pool.query("SELECT 1 FROM albumes WHERE id = ?", [id]);
  return rows.length > 0;
}

export async function crearAlbum({ nombre, descripcion, fecha }) {
  const [res] = await pool.query("INSERT INTO albumes (nombre, descripcion, fecha) VALUES (?, ?, ?)", [
    nombre,
    descripcion || null,
    fecha || null,
  ]);
  return res.insertId;
}

export async function actualizarAlbum(id, { nombre, descripcion, fecha }) {
  await pool.query("UPDATE albumes SET nombre = ?, descripcion = ?, fecha = ? WHERE id = ?", [
    nombre,
    descripcion || null,
    fecha || null,
    id,
  ]);
}

// Las fotos del álbum no se borran: pasan a las generales del dojang (ON DELETE SET NULL)
export async function borrarAlbum(id) {
  await pool.query("DELETE FROM albumes WHERE id = ?", [id]);
}

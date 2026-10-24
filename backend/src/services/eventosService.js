import { pool } from "../config/db.js";
import { ahoraEnEscuela, sumarDias } from "../utils/fechas.js";

export const TIPOS_EVENTO = ["examen", "torneo", "seminario", "sin-clase", "evento"];

const normalizar = (e) => ({ ...e, publico: Boolean(e.publico) });

// Eventos desde hace `diasAtras` días en adelante. Devuelve también "hoy" (hora argentina) para que
// el servidor y el navegador separen igual los próximos de los pasados.
export async function listarEventos({ soloPublicos = true, diasAtras = 180 } = {}) {
  const hoy = ahoraEnEscuela().fecha;
  const [rows] = await pool.query(
    `SELECT * FROM eventos
     WHERE COALESCE(fecha_fin, fecha) >= ? ${soloPublicos ? "AND publico = TRUE" : ""}
     ORDER BY fecha, hora`,
    [sumarDias(hoy, -diasAtras)]
  );
  return { hoy, eventos: rows.map(normalizar) };
}

export async function getEvento(id) {
  const [rows] = await pool.query("SELECT * FROM eventos WHERE id = ?", [id]);
  return rows[0] ? normalizar(rows[0]) : null;
}

export async function crearEvento(e) {
  const [res] = await pool.query(
    `INSERT INTO eventos (titulo, descripcion, tipo, fecha, fecha_fin, hora, lugar, publico)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [e.titulo, e.descripcion || null, e.tipo, e.fecha, e.fecha_fin || null, e.hora || null, e.lugar || null, e.publico]
  );
  return res.insertId;
}

export async function actualizarEvento(id, e) {
  await pool.query(
    `UPDATE eventos SET titulo = ?, descripcion = ?, tipo = ?, fecha = ?, fecha_fin = ?, hora = ?, lugar = ?, publico = ?
     WHERE id = ?`,
    [e.titulo, e.descripcion || null, e.tipo, e.fecha, e.fecha_fin || null, e.hora || null, e.lugar || null, e.publico, id]
  );
}

export async function borrarEvento(id) {
  await pool.query("DELETE FROM eventos WHERE id = ?", [id]);
}

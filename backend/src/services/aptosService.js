import { pool } from "../config/db.js";
import { ahoraEnEscuela, diasEntre } from "../utils/fechas.js";

// Con cuántos días de anticipación se marca "por vencer"
export const DIAS_AVISO_APTO = 30;

// "sin-apto" y "vencido" = el alumno adeuda el apto
export function estadoApto(fechaVencimiento, hoy = ahoraEnEscuela().fecha) {
  if (!fechaVencimiento) return { estado: "sin-apto", adeuda: true, dias: null };
  const dias = diasEntre(hoy, fechaVencimiento);
  if (dias < 0) return { estado: "vencido", adeuda: true, dias };
  if (dias <= DIAS_AVISO_APTO) return { estado: "por-vencer", adeuda: false, dias };
  return { estado: "vigente", adeuda: false, dias };
}

const publico = ({ archivo, ...a }) => ({ ...a, tiene_archivo: Boolean(archivo) });

// Estado actual + historial (el más nuevo primero) de un alumno
export async function aptoDeAlumno(usuarioId) {
  const [rows] = await pool.query(
    "SELECT * FROM aptos_fisicos WHERE usuario_id = ? ORDER BY fecha_vencimiento DESC, id DESC",
    [usuarioId]
  );
  const actual = rows[0] ?? null;
  return {
    ...estadoApto(actual?.fecha_vencimiento),
    actual: actual ? publico(actual) : null,
    historial: rows.map(publico),
  };
}

// Vencimiento más lejano de cada alumno, para la lista del panel
export async function vencimientosPorAlumno() {
  const [rows] = await pool.query(
    "SELECT usuario_id, MAX(fecha_vencimiento) AS vence FROM aptos_fisicos GROUP BY usuario_id"
  );
  return new Map(rows.map((r) => [r.usuario_id, r.vence]));
}

export async function crearApto({ usuarioId, fechaEmision, fechaVencimiento, observaciones, archivo, archivoNombre }) {
  const [res] = await pool.query(
    `INSERT INTO aptos_fisicos (usuario_id, fecha_emision, fecha_vencimiento, observaciones, archivo, archivo_nombre)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [usuarioId, fechaEmision, fechaVencimiento, observaciones || null, archivo ?? null, archivoNombre ?? null]
  );
  return res.insertId;
}

export async function getApto(id) {
  const [rows] = await pool.query("SELECT * FROM aptos_fisicos WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function borrarApto(id) {
  await pool.query("DELETE FROM aptos_fisicos WHERE id = ?", [id]);
}

export async function archivosDeAptos(usuarioId) {
  const [rows] = await pool.query(
    "SELECT archivo FROM aptos_fisicos WHERE usuario_id = ? AND archivo IS NOT NULL",
    [usuarioId]
  );
  return rows.map((r) => r.archivo);
}

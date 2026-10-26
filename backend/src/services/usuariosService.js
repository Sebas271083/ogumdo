import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";

const CAMPOS_PUBLICOS = "id, email, nombre, rol, fecha_nacimiento, fecha_ingreso, cinturon_actual, creado_ts";

// MySQL rechaza "" en columnas DATE: lo vacío se guarda como NULL
const nulo = (v) => (v === undefined || v === "" ? null : v);

export const hashPassword = (password) => bcrypt.hash(password, 10);

// Hash de relleno: si el email no existe igual se compara contra algo, así la respuesta tarda lo
// mismo y no se puede averiguar qué emails están registrados midiendo el tiempo.
const HASH_RELLENO = bcrypt.hashSync("relleno-que-nunca-coincide", 10);

export async function verificarCredenciales(email, password) {
  const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
  const u = rows[0];
  const coincide = await bcrypt.compare(password, u?.password_hash ?? HASH_RELLENO);
  if (!u || !coincide) return null;
  const { password_hash, ...publico } = u;
  return publico;
}

export async function verificarPassword(id, password) {
  const [rows] = await pool.query("SELECT password_hash FROM usuarios WHERE id = ?", [id]);
  return rows[0] ? bcrypt.compare(password, rows[0].password_hash) : false;
}

export async function cambiarPassword(id, password) {
  await pool.query("UPDATE usuarios SET password_hash = ? WHERE id = ?", [await hashPassword(password), id]);
}

export async function listarAlumnos() {
  const [rows] = await pool.query(
    `SELECT u.id, u.nombre, u.email, u.cinturon_actual, u.fecha_ingreso, COUNT(r.id) AS total_registros
     FROM usuarios u
     LEFT JOIN registros r ON r.usuario_id = u.id
     WHERE u.rol = 'alumno'
     GROUP BY u.id
     ORDER BY u.nombre`
  );
  return rows;
}

export async function getAlumno(id) {
  const [rows] = await pool.query(`SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = ? AND rol = 'alumno'`, [id]);
  return rows[0] ?? null;
}

export async function crearUsuario({ email, password, nombre, rol = "alumno", fecha_nacimiento, fecha_ingreso, cinturon_actual }) {
  const [res] = await pool.query(
    `INSERT INTO usuarios (email, password_hash, nombre, rol, fecha_nacimiento, fecha_ingreso, cinturon_actual)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [email, await hashPassword(password), nombre, rol, nulo(fecha_nacimiento), nulo(fecha_ingreso), nulo(cinturon_actual) ?? "blanco"]
  );
  return res.insertId;
}

export async function actualizarAlumno(id, { email, nombre, fecha_nacimiento, fecha_ingreso, cinturon_actual }) {
  const [res] = await pool.query(
    `UPDATE usuarios SET email = ?, nombre = ?, fecha_nacimiento = ?, fecha_ingreso = ?, cinturon_actual = ?
     WHERE id = ? AND rol = 'alumno'`,
    [email, nombre, nulo(fecha_nacimiento), nulo(fecha_ingreso), nulo(cinturon_actual) ?? "blanco", id]
  );
  return res.affectedRows > 0;
}

export async function actualizarCinturon(id, cinturon) {
  await pool.query("UPDATE usuarios SET cinturon_actual = ? WHERE id = ?", [cinturon, id]);
}

export async function borrarAlumno(id) {
  const [res] = await pool.query("DELETE FROM usuarios WHERE id = ? AND rol = 'alumno'", [id]);
  return res.affectedRows > 0;
}

export async function contarUsuarios() {
  const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM usuarios");
  return total;
}

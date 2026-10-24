// Crea la base (si no existe), las tablas de db/schema.sql y los usuarios iniciales.
// Se puede correr las veces que haga falta: no pisa datos existentes.
import "dotenv/config";
import fs from "node:fs/promises";
import mysql from "mysql2/promise";
import { SCHEMA_PATH } from "../config/paths.js";
import { pool } from "../config/db.js";
import { contarUsuarios, crearUsuario } from "../services/usuariosService.js";
import { crearRegistro } from "../services/registrosService.js";

const database = process.env.MYSQL_DATABASE;
if (!database) {
  console.error("Falta MYSQL_DATABASE en backend/.env (copiá .env.example)");
  process.exit(1);
}

const conexion = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  multipleStatements: true,
});
// En hostings como Coolify la base ya viene creada y el usuario no es root: sin permiso global,
// incluso "CREATE DATABASE IF NOT EXISTS" falla. Solo se crea si todavía no existe.
const [existentes] = await conexion.query("SHOW DATABASES LIKE ?", [database]);
if (!existentes.length) {
  await conexion.query(`CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
}
await conexion.query(`USE \`${database}\``);
await conexion.query(await fs.readFile(SCHEMA_PATH, "utf8"));

// ===== Migraciones: columnas nuevas en tablas que ya existían =====
// (CREATE TABLE IF NOT EXISTS no modifica tablas existentes, y MySQL no tiene ADD COLUMN IF NOT EXISTS)
async function asegurarColumna(tabla, columna, definicion) {
  const [existe] = await conexion.query(
    "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?",
    [database, tabla, columna]
  );
  if (existe.length) return;
  await conexion.query(`ALTER TABLE \`${tabla}\` ADD COLUMN ${definicion}`);
  console.log(`Migración: columna ${tabla}.${columna} agregada.`);
}

await asegurarColumna("galeria", "album_id", "album_id INT NULL");
const [fk] = await conexion.query(
  `SELECT 1 FROM information_schema.KEY_COLUMN_USAGE
   WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'galeria' AND COLUMN_NAME = 'album_id' AND REFERENCED_TABLE_NAME = 'albumes'`,
  [database]
);
if (!fk.length) {
  await conexion.query(
    "ALTER TABLE galeria ADD CONSTRAINT fk_galeria_album FOREIGN KEY (album_id) REFERENCES albumes(id) ON DELETE SET NULL"
  );
}

await conexion.end();
console.log(`Base "${database}" y tablas listas.`);

if ((await contarUsuarios()) === 0) {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@escuela.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "cambiar123";
  await crearUsuario({
    email: adminEmail,
    password: adminPassword,
    nombre: "Sabonim (administrador)",
    rol: "admin",
    cinturon_actual: "negro-5",
  });

  const alumnoId = await crearUsuario({
    email: "alumno@demo.com",
    password: "alumno123",
    nombre: "Alumno de Prueba",
    fecha_nacimiento: "2010-05-14",
    fecha_ingreso: "2021-03-01",
    cinturon_actual: "verde",
  });
  const demo = [
    ["graduacion", "Examen de 9° Gup", "Aprobado con distinción", "2021-07-10", "blanco-amarillo"],
    ["graduacion", "Examen de 8° Gup", null, "2021-12-04", "amarillo"],
    ["graduacion", "Examen de 7° Gup", null, "2022-07-09", "amarillo-verde"],
    ["graduacion", "Examen de 6° Gup", null, "2023-06-17", "verde"],
    ["logro", "Medalla de oro – Torneo Regional", "Categoría combate infantil -40 kg", "2023-09-23", null],
    ["logro", "Medalla de bronce – Open Nacional", "Categoría formas (poomsae)", "2024-05-11", null],
    ["capacitacion", "Seminario de poomsae", "Dictado por instructor internacional, 8 horas", "2024-03-16", null],
    ["titulo", "Certificado de árbitro juvenil", "Asociación regional de taekwondo", "2024-10-05", null],
  ];
  for (const [tipo, titulo, descripcion, fecha, cinturon] of demo) {
    await crearRegistro({ usuarioId: alumnoId, tipo, titulo, descripcion, fecha, cinturon });
  }

  console.log("\nUsuarios iniciales creados:");
  console.log(`  Admin:  ${adminEmail} / ${adminPassword}   <- cambiá esta contraseña`);
  console.log("  Alumno: alumno@demo.com / alumno123  (demo, lo podés borrar desde el panel)\n");
} else {
  console.log("Ya hay usuarios cargados: no se crearon usuarios iniciales.");
}

await pool.end();

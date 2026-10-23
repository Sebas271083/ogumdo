import { pool } from "../config/db.js";
import { leerContenido } from "./contenidoService.js";
import { ahoraEnEscuela, sumarDias, diaSemana, aMinutos } from "../utils/fechas.js";

export async function getHorarios() {
  const escuela = await leerContenido("escuela");
  return (escuela.horarios ?? []).filter((h) => h.id && Array.isArray(h.diasSemana) && h.inicio && h.fin);
}

// Clases de los próximos `dias` días calculadas a partir de los horarios (las de hoy, hasta que terminan)
export async function proximasClases({ dias = 7 } = {}) {
  const horarios = await getHorarios();
  const ahora = ahoraEnEscuela();
  const clases = [];

  for (let i = 0; i < dias; i++) {
    const fecha = sumarDias(ahora.fecha, i);
    const dia = diaSemana(fecha);
    for (const h of horarios) {
      if (!h.diasSemana.includes(dia)) continue;
      if (i === 0 && aMinutos(h.fin) <= ahora.minutos) continue;
      clases.push({
        claseId: h.id,
        nombre: h.clase,
        fecha,
        inicio: h.inicio,
        fin: h.fin,
        empezada: i === 0 && aMinutos(h.inicio) <= ahora.minutos,
      });
    }
  }
  return clases.sort((a, b) => (a.fecha + a.inicio).localeCompare(b.fecha + b.inicio));
}

export async function buscarProximaClase(claseId, fecha) {
  return (await proximasClases()).find((c) => c.claseId === claseId && c.fecha === fecha) ?? null;
}

// Agrega a cada clase quién va, cuántos no, si está cancelada y la respuesta del usuario
export async function conAsistencias(clases, usuarioId) {
  if (!clases.length) return [];
  const fechas = [...new Set(clases.map((c) => c.fecha))];
  const [respuestas] = await pool.query(
    `SELECT a.clase_id, a.fecha, a.asiste, a.usuario_id, u.nombre
     FROM asistencias a JOIN usuarios u ON u.id = a.usuario_id
     WHERE a.fecha IN (?) ORDER BY u.nombre`,
    [fechas]
  );
  const [canceladas] = await pool.query("SELECT clase_id, fecha, motivo FROM clases_canceladas WHERE fecha IN (?)", [fechas]);

  return clases.map((c) => {
    const deEsta = respuestas.filter((r) => r.clase_id === c.claseId && r.fecha === c.fecha);
    const mia = deEsta.find((r) => r.usuario_id === usuarioId);
    const cancelacion = canceladas.find((x) => x.clase_id === c.claseId && x.fecha === c.fecha);
    return {
      ...c,
      cancelada: Boolean(cancelacion),
      motivo: cancelacion?.motivo ?? null,
      van: deEsta.filter((r) => r.asiste).map((r) => ({ id: r.usuario_id, nombre: r.nombre })),
      noVan: deEsta.filter((r) => !r.asiste).length,
      miRespuesta: mia ? Boolean(mia.asiste) : null,
    };
  });
}

// asiste: true (voy), false (no voy) o null (borrar la respuesta)
export async function responderAsistencia(usuarioId, claseId, fecha, asiste) {
  if (asiste === null) {
    await pool.query("DELETE FROM asistencias WHERE usuario_id = ? AND clase_id = ? AND fecha = ?", [usuarioId, claseId, fecha]);
    return;
  }
  await pool.query(
    `INSERT INTO asistencias (usuario_id, clase_id, fecha, asiste) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE asiste = VALUES(asiste)`,
    [usuarioId, claseId, fecha, asiste]
  );
}

export async function estaCancelada(claseId, fecha) {
  const [rows] = await pool.query("SELECT 1 FROM clases_canceladas WHERE clase_id = ? AND fecha = ?", [claseId, fecha]);
  return rows.length > 0;
}

export async function cancelarClase(claseId, fecha, motivo) {
  await pool.query(
    `INSERT INTO clases_canceladas (clase_id, fecha, motivo) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE motivo = VALUES(motivo)`,
    [claseId, fecha, motivo || null]
  );
}

export async function reactivarClase(claseId, fecha) {
  await pool.query("DELETE FROM clases_canceladas WHERE clase_id = ? AND fecha = ?", [claseId, fecha]);
}

// ===== Clases asignadas a cada alumno =====

export async function clasesDeAlumno(usuarioId) {
  const [rows] = await pool.query("SELECT clase_id FROM alumno_clases WHERE usuario_id = ?", [usuarioId]);
  return rows.map((r) => r.clase_id);
}

export async function asignarClases(usuarioId, claseIds) {
  const validas = new Set((await getHorarios()).map((h) => h.id));
  const ids = [...new Set((claseIds ?? []).map(String))].filter((id) => validas.has(id));
  await pool.query("DELETE FROM alumno_clases WHERE usuario_id = ?", [usuarioId]);
  if (ids.length) {
    await pool.query("INSERT INTO alumno_clases (usuario_id, clase_id) VALUES ?", [ids.map((id) => [usuarioId, id])]);
  }
}

// Alumnos de una clase; si nadie la tiene asignada se avisa a todos los alumnos
export async function alumnosDeClase(claseId) {
  const [asignados] = await pool.query("SELECT usuario_id FROM alumno_clases WHERE clase_id = ?", [claseId]);
  if (asignados.length) return asignados.map((r) => r.usuario_id);
  const [todos] = await pool.query("SELECT id FROM usuarios WHERE rol = 'alumno'");
  return todos.map((r) => r.id);
}

export async function alumnosSinResponder(claseId, fecha) {
  const ids = await alumnosDeClase(claseId);
  if (!ids.length) return [];
  const [respondieron] = await pool.query(
    "SELECT usuario_id FROM asistencias WHERE clase_id = ? AND fecha = ? AND usuario_id IN (?)",
    [claseId, fecha, ids]
  );
  const ya = new Set(respondieron.map((r) => r.usuario_id));
  return ids.filter((id) => !ya.has(id));
}

// true solo la primera vez: así el recordatorio sale una vez aunque haya varias instancias
export async function marcarRecordatorioEnviado(claseId, fecha) {
  const [res] = await pool.query("INSERT IGNORE INTO recordatorios_enviados (clase_id, fecha) VALUES (?, ?)", [claseId, fecha]);
  return res.affectedRows === 1;
}

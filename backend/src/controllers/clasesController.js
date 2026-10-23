import {
  proximasClases,
  conAsistencias,
  buscarProximaClase,
  responderAsistencia,
  clasesDeAlumno,
  cancelarClase,
  reactivarClase,
  alumnosDeClase,
} from "../services/clasesService.js";
import { listarAvisos, crearAviso, borrarAviso } from "../services/avisosService.js";
import { enviarAUsuarios, enviarATodosLosAlumnos } from "../services/pushService.js";
import { esFechaIso } from "../utils/fechas.js";
import { httpError } from "../utils/httpError.js";

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const nombreDia = (fecha) => DIAS[new Date(`${fecha}T12:00:00Z`).getUTCDay()];

async function claseValida(claseId, fecha) {
  if (!esFechaIso(fecha)) throw httpError(400, "Fecha inválida");
  const clase = await buscarProximaClase(claseId, fecha);
  if (!clase) throw httpError(404, "Esa clase no está entre las próximas");
  return clase;
}

// Alumno: sus clases asignadas (o todas si no tiene). Sabonim: todas.
export async function proximas(req, res, next) {
  try {
    let clases = await proximasClases();
    let misClases = [];
    if (req.user.rol === "alumno") {
      misClases = await clasesDeAlumno(req.user.id);
      if (misClases.length) clases = clases.filter((c) => misClases.includes(c.claseId));
    }
    res.json({ clases: await conAsistencias(clases, req.user.id), misClases });
  } catch (err) {
    next(err);
  }
}

export async function responder(req, res, next) {
  try {
    if (req.user.rol !== "alumno") throw httpError(403, "Solo los alumnos marcan asistencia");
    const { claseId, fecha } = req.params;
    const clase = await claseValida(claseId, fecha);
    if (clase.empezada) throw httpError(400, "La clase ya empezó");
    const [actualizada] = await conAsistencias([clase], req.user.id);
    if (actualizada.cancelada) throw httpError(400, "La clase está cancelada");

    const asiste = req.body?.asiste;
    if (asiste !== true && asiste !== false && asiste !== null) throw httpError(400, "Respuesta inválida");
    await responderAsistencia(req.user.id, claseId, fecha, asiste);
    const [resultado] = await conAsistencias([clase], req.user.id);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

export async function avisos(req, res, next) {
  try {
    res.json(await listarAvisos());
  } catch (err) {
    next(err);
  }
}

// ===== Sabonim =====

export async function cancelar(req, res, next) {
  try {
    const { claseId, fecha } = req.params;
    const clase = await claseValida(claseId, fecha);
    const motivo = String(req.body?.motivo ?? "").trim().slice(0, 200);
    await cancelarClase(claseId, fecha, motivo);

    await enviarAUsuarios(await alumnosDeClase(claseId), {
      titulo: `Clase cancelada: ${clase.nombre}`,
      cuerpo: `El ${nombreDia(fecha)} a las ${clase.inicio} no hay clase.${motivo ? ` ${motivo}` : ""}`,
      url: "/alumno",
      tag: `clase-${claseId}-${fecha}`,
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function reactivar(req, res, next) {
  try {
    const { claseId, fecha } = req.params;
    const clase = await claseValida(claseId, fecha);
    await reactivarClase(claseId, fecha);

    await enviarAUsuarios(await alumnosDeClase(claseId), {
      titulo: `Vuelve la clase: ${clase.nombre}`,
      cuerpo: `El ${nombreDia(fecha)} a las ${clase.inicio} hay clase normalmente.`,
      url: "/alumno",
      tag: `clase-${claseId}-${fecha}`,
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function publicarAviso(req, res, next) {
  try {
    const titulo = String(req.body?.titulo ?? "").trim();
    const mensaje = String(req.body?.mensaje ?? "").trim();
    if (!titulo || titulo.length > 120) throw httpError(400, "El título es obligatorio (máx. 120 caracteres)");
    if (!mensaje || mensaje.length > 1000) throw httpError(400, "El mensaje es obligatorio (máx. 1000 caracteres)");

    const id = await crearAviso(titulo, mensaje);
    const enviados = await enviarATodosLosAlumnos({ titulo, cuerpo: mensaje, url: "/alumno", tag: `aviso-${id}` });
    res.status(201).json({ id, enviados });
  } catch (err) {
    next(err);
  }
}

export async function eliminarAviso(req, res, next) {
  try {
    await borrarAviso(Number(req.params.id));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

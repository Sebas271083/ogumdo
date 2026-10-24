import {
  TIPOS_EVENTO,
  listarEventos,
  getEvento,
  crearEvento,
  actualizarEvento,
  borrarEvento,
} from "../services/eventosService.js";
import { enviarATodosLosAlumnos } from "../services/pushService.js";
import { esFechaIso } from "../utils/fechas.js";
import { httpError } from "../utils/httpError.js";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fechaCorta = (iso) => `${Number(iso.slice(8, 10))} ${MESES[Number(iso.slice(5, 7)) - 1]}`;

function datosEvento(body) {
  const e = {
    titulo: String(body?.titulo ?? "").trim(),
    descripcion: String(body?.descripcion ?? "").trim().slice(0, 2000),
    tipo: TIPOS_EVENTO.includes(body?.tipo) ? body.tipo : "evento",
    fecha: String(body?.fecha ?? ""),
    fecha_fin: body?.fecha_fin ? String(body.fecha_fin) : null,
    hora: body?.hora ? String(body.hora) : null,
    lugar: String(body?.lugar ?? "").trim().slice(0, 150),
    publico: body?.publico === true,
  };
  if (!e.titulo || e.titulo.length > 150) throw httpError(400, "El título es obligatorio (máx. 150 caracteres)");
  if (!esFechaIso(e.fecha)) throw httpError(400, "La fecha es obligatoria");
  if (e.fecha_fin && (!esFechaIso(e.fecha_fin) || e.fecha_fin < e.fecha)) {
    throw httpError(400, "La fecha de fin tiene que ser posterior a la de inicio");
  }
  if (e.fecha_fin === e.fecha) e.fecha_fin = null;
  if (e.hora && !/^\d{2}:\d{2}$/.test(e.hora)) throw httpError(400, "Hora inválida");
  return e;
}

// Visitantes: solo los públicos. Con sesión: todos.
export async function listar(req, res, next) {
  try {
    res.json(await listarEventos({ soloPublicos: !req.user }));
  } catch (err) {
    next(err);
  }
}

export async function crear(req, res, next) {
  try {
    const e = datosEvento(req.body);
    const id = await crearEvento(e);
    let enviados = 0;
    if (req.body?.notificar === true) {
      enviados = await enviarATodosLosAlumnos({
        titulo: `📅 ${e.titulo}`,
        cuerpo: [`${fechaCorta(e.fecha)}${e.hora ? ` a las ${e.hora}` : ""}`, e.lugar].filter(Boolean).join(" · "),
        url: "/calendario",
        tag: `evento-${id}`,
      });
    }
    res.status(201).json({ id, enviados });
  } catch (err) {
    next(err);
  }
}

export async function editar(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!(await getEvento(id))) return res.status(404).json({ error: "Evento no encontrado" });
    await actualizarEvento(id, datosEvento(req.body));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    await borrarEvento(Number(req.params.id));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

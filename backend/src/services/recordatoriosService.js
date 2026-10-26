import { getHorarios, estaCancelada, marcarRecordatorioEnviado, alumnosSinResponder } from "./clasesService.js";
import { enviarAUsuarios, pushHabilitado } from "./pushService.js";
import { ahoraEnEscuela, diaSemana, aMinutos, sumarDias } from "../utils/fechas.js";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Notificación de recordatorio (la usan el automático y el botón del Sabonim).
// "asistencia" hace que la notificación traiga los botones Voy / No voy.
export function payloadRecordatorio({ claseId, nombre, inicio }, fecha) {
  const hoy = ahoraEnEscuela().fecha;
  const cuando =
    fecha === hoy
      ? "Hoy"
      : fecha === sumarDias(hoy, 1)
        ? "Mañana"
        : `${DIAS[diaSemana(fecha)]} ${Number(fecha.slice(8, 10))}/${Number(fecha.slice(5, 7))}`;
  return {
    titulo: `${cuando}: ${nombre} a las ${inicio}`,
    cuerpo: "¿Venís a entrenar? Respondé desde acá 👇",
    url: "/alumno",
    tag: `clase-${claseId}-${fecha}`,
    asistencia: { claseId, fecha },
  };
}

const HORAS_ANTES = Number(process.env.RECORDATORIO_HORAS_ANTES) || 3;
const CADA_MS = 5 * 60 * 1000;

// Unas horas antes de cada clase, a los alumnos que todavía no respondieron:
// "Hoy Adolescentes y adultos a las 19:30 — ¿Venís?" con los botones Voy / No voy
export async function revisarRecordatorios() {
  const ahora = ahoraEnEscuela();
  const dia = diaSemana(ahora.fecha);

  for (const h of await getHorarios()) {
    if (!h.diasSemana.includes(dia)) continue;
    const faltan = aMinutos(h.inicio) - ahora.minutos;
    if (faltan <= 0 || faltan > HORAS_ANTES * 60) continue;
    if (await estaCancelada(h.id, ahora.fecha)) continue;
    if (!(await marcarRecordatorioEnviado(h.id, ahora.fecha))) continue;

    const enviados = await enviarAUsuarios(
      await alumnosSinResponder(h.id, ahora.fecha),
      payloadRecordatorio({ claseId: h.id, nombre: h.clase, inicio: h.inicio }, ahora.fecha)
    );
    console.log(`Recordatorio ${h.id} ${ahora.fecha}: ${enviados} notificaciones`);
  }
}

export function iniciarRecordatorios() {
  if (!pushHabilitado) {
    console.log("Notificaciones push desactivadas (faltan VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY)");
    return;
  }
  const tick = () => revisarRecordatorios().catch((err) => console.error("Recordatorios:", err.message));
  setTimeout(tick, 15_000);
  setInterval(tick, CADA_MS);
}

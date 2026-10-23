import { getHorarios, estaCancelada, marcarRecordatorioEnviado, alumnosSinResponder } from "./clasesService.js";
import { enviarAUsuarios, pushHabilitado } from "./pushService.js";
import { ahoraEnEscuela, diaSemana, aMinutos } from "../utils/fechas.js";

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

    const enviados = await enviarAUsuarios(await alumnosSinResponder(h.id, ahora.fecha), {
      titulo: `Hoy: ${h.clase} a las ${h.inicio}`,
      cuerpo: "¿Venís a entrenar? Respondé desde acá 👇",
      url: "/alumno",
      tag: `clase-${h.id}-${ahora.fecha}`,
      asistencia: { claseId: h.id, fecha: ahora.fecha },
    });
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

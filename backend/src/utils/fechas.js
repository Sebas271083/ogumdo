// Las clases se dictan en hora argentina, pero el servidor (Coolify) suele estar en UTC:
// todo cálculo de "hoy" y "ahora" pasa por la zona horaria de la escuela.
const ZONA = process.env.ZONA_HORARIA || "America/Argentina/Buenos_Aires";

const formato = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// { fecha: "2026-10-23", minutos: 1170 } (minutos desde la medianoche)
export function ahoraEnEscuela(momento = new Date()) {
  const p = Object.fromEntries(formato.formatToParts(momento).map((x) => [x.type, x.value]));
  return { fecha: `${p.year}-${p.month}-${p.day}`, minutos: Number(p.hour) * 60 + Number(p.minute) };
}

const aUTC = (iso) => {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d));
};

export const sumarDias = (iso, dias) => {
  const f = aUTC(iso);
  f.setUTCDate(f.getUTCDate() + dias);
  return f.toISOString().slice(0, 10);
};

// 0 = domingo … 6 = sábado (igual que "diasSemana" en escuela.json)
export const diaSemana = (iso) => aUTC(iso).getUTCDay();

export const aMinutos = (hhmm) => {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
};

export const esFechaIso = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s));

// Días de "desde" a "hasta" (negativo si "hasta" ya pasó)
export const diasEntre = (desde, hasta) => Math.round((aUTC(hasta) - aUTC(desde)) / 86_400_000);

import webpush from "web-push";
import { pool } from "../config/db.js";

const PUBLICA = process.env.VAPID_PUBLIC_KEY;
const PRIVADA = process.env.VAPID_PRIVATE_KEY;

// Sin claves VAPID la web funciona igual, solo que sin notificaciones
export const pushHabilitado = Boolean(PUBLICA && PRIVADA);
if (pushHabilitado) {
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:contacto@ogumdo.com.ar", PUBLICA, PRIVADA);
}

export const clavePublica = () => (pushHabilitado ? PUBLICA : null);

export async function guardarSuscripcion(usuarioId, { endpoint, keys }) {
  await pool.query(
    `INSERT INTO push_suscripciones (usuario_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE usuario_id = VALUES(usuario_id), p256dh = VALUES(p256dh), auth = VALUES(auth)`,
    [usuarioId, endpoint, keys.p256dh, keys.auth]
  );
}

export async function borrarSuscripcion(usuarioId, endpoint) {
  await pool.query("DELETE FROM push_suscripciones WHERE usuario_id = ? AND endpoint = ?", [usuarioId, endpoint]);
}

// payload: { titulo, cuerpo, url, tag, asistencia?: { claseId, fecha } } (lo interpreta public/sw.js)
export async function enviarAUsuarios(usuarioIds, payload) {
  if (!pushHabilitado || !usuarioIds.length) return 0;
  const [subs] = await pool.query("SELECT * FROM push_suscripciones WHERE usuario_id IN (?)", [usuarioIds]);

  const resultados = await Promise.allSettled(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
          { TTL: 60 * 60 * 6 }
        );
      } catch (err) {
        // 404/410: el usuario desinstaló o revocó el permiso; la suscripción ya no sirve
        if (err.statusCode === 404 || err.statusCode === 410) {
          await pool.query("DELETE FROM push_suscripciones WHERE id = ?", [s.id]);
          console.log(`Push: suscripción vencida de usuario ${s.usuario_id} (${err.statusCode}), borrada`);
        } else {
          console.error(`Push a usuario ${s.usuario_id} falló:`, err.statusCode ?? "", err.body || err.message);
        }
        throw err;
      }
    })
  );
  return resultados.filter((r) => r.status === "fulfilled").length;
}

// Para el panel del Sabonim: cuántos alumnos van a recibir un aviso
export async function alumnosConNotificaciones() {
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(DISTINCT s.usuario_id) AS total
     FROM push_suscripciones s JOIN usuarios u ON u.id = s.usuario_id
     WHERE u.rol = 'alumno'`
  );
  return total;
}

export async function enviarATodosLosAlumnos(payload) {
  const [alumnos] = await pool.query("SELECT id FROM usuarios WHERE rol = 'alumno'");
  return enviarAUsuarios(
    alumnos.map((a) => a.id),
    payload
  );
}

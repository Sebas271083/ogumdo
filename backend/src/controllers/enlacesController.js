import { listarEnlaces, getEnlace, crearEnlace, actualizarEnlace, borrarEnlace } from "../services/enlacesService.js";
import { CATEGORIAS_DESCARGA, payloadMaterialNuevo } from "../services/descargasService.js";
import { enviarATodosLosAlumnos } from "../services/pushService.js";
import { httpError } from "../utils/httpError.js";

// Solo http/https: un "javascript:..." guardado como link sería un ataque a quien lo toque
function urlValida(texto) {
  try {
    const url = new URL(String(texto ?? "").trim());
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function datosEnlace(body) {
  const datos = {
    titulo: String(body?.titulo ?? "").trim(),
    descripcion: String(body?.descripcion ?? "").trim().slice(0, 300),
    url: urlValida(body?.url),
    categoria: CATEGORIAS_DESCARGA.includes(body?.categoria) ? body.categoria : "otros",
    publico: body?.publico === true,
    enHistoria: body?.enHistoria === true,
  };
  if (!datos.titulo || datos.titulo.length > 150) throw httpError(400, "El título es obligatorio (máx. 150 caracteres)");
  if (!datos.url || datos.url.length > 500) throw httpError(400, "Pegá un link válido que empiece con https://");
  // En Historia solo se muestran públicos: la página es para todos los visitantes
  if (datos.enHistoria && !datos.publico) throw httpError(400, "Para mostrarlo en Historia el enlace tiene que ser público");
  return datos;
}

// Visitantes: solo los públicos. Con sesión: todos.
export async function listar(req, res, next) {
  try {
    res.json(await listarEnlaces({ soloPublicos: !req.user }));
  } catch (err) {
    next(err);
  }
}

// Mismo criterio que el frontend (utils/youtube.js) para decidir si es un video
const esYoutube = (url) => /^https?:\/\/(www\.|m\.|music\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)\//i.test(url);

export async function crear(req, res, next) {
  try {
    const datos = datosEnlace(req.body);
    const id = await crearEnlace(datos);
    const enviados =
      req.body?.notificar === true
        ? await enviarATodosLosAlumnos(
            payloadMaterialNuevo({
              id,
              titulo: datos.titulo,
              categoria: datos.categoria,
              tipo: esYoutube(datos.url) ? "video" : "enlace",
            })
          )
        : 0;
    res.status(201).json({ id, enviados });
  } catch (err) {
    next(err);
  }
}

export async function editar(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!(await getEnlace(id))) return res.status(404).json({ error: "Enlace no encontrado" });
    await actualizarEnlace(id, datosEnlace(req.body));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    await borrarEnlace(Number(req.params.id));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

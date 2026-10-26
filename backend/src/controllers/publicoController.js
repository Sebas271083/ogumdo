import { leerContenido } from "../services/contenidoService.js";
import { listarFotos, listarAlbumes, getFoto, getFotosDestacadas } from "../services/galeriaService.js";
import { crearMensaje } from "../services/mensajesService.js";
import { enviarArchivo } from "../middleware/upload.js";
import { crearLimitador } from "../utils/limitador.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function escuela(req, res, next) {
  try {
    res.json(await leerContenido("escuela"));
  } catch (err) {
    next(err);
  }
}

export async function profesor(req, res, next) {
  try {
    res.json(await leerContenido("profesor"));
  } catch (err) {
    next(err);
  }
}

export async function galeria(req, res, next) {
  try {
    res.json(await listarFotos(req.query));
  } catch (err) {
    next(err);
  }
}

export async function destacadas(req, res, next) {
  try {
    res.json(await getFotosDestacadas());
  } catch (err) {
    next(err);
  }
}

export async function albumes(req, res, next) {
  try {
    res.json(await listarAlbumes());
  } catch (err) {
    next(err);
  }
}

export async function imagenGaleria(req, res, next) {
  try {
    const foto = await getFoto(Number(req.params.id));
    if (!foto) return res.status(404).json({ error: "Foto no encontrada" });
    enviarArchivo(res, foto.archivo, { cache: true });
  } catch (err) {
    next(err);
  }
}

// Para que un bot no llene la base de mensajes: 5 por hora por IP
const limiteContacto = crearLimitador({ max: 5, ventanaMs: 60 * 60 * 1000 });

export async function contacto(req, res, next) {
  try {
    const b = req.body ?? {};
    if (b.web) return res.json({ ok: true }); // honeypot: los bots completan el campo oculto
    if (limiteContacto.bloqueado(req.ip)) {
      return res.status(429).json({ error: "Ya enviaste varios mensajes. Si es urgente, escribinos por WhatsApp." });
    }

    const datos = {
      nombre: String(b.nombre ?? "").trim(),
      email: String(b.email ?? "").trim(),
      telefono: String(b.telefono ?? "").trim(),
      mensaje: String(b.mensaje ?? "").trim(),
    };
    const errores = [];
    if (!datos.nombre || datos.nombre.length > 100) errores.push("Ingresá tu nombre");
    if (!EMAIL_RE.test(datos.email) || datos.email.length > 150) errores.push("Ingresá un email válido");
    if (datos.telefono.length > 40) errores.push("El teléfono es demasiado largo");
    if (datos.mensaje.length < 5 || datos.mensaje.length > 2000) errores.push("El mensaje debe tener entre 5 y 2000 caracteres");
    if (errores.length) return res.status(400).json({ errores });

    await crearMensaje(datos);
    limiteContacto.sumar(req.ip);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
}

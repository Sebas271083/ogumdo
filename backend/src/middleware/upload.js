import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import multer from "multer";
import { STORAGE_DIR } from "../config/paths.js";

const IMAGENES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
const IMAGENES_Y_PDF = { ...IMAGENES, "application/pdf": ".pdf" };
const DOCUMENTOS = {
  ...IMAGENES_Y_PDF,
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
};

export const LIMITE_MB = 8;
export const LIMITE_DOCUMENTO_MB = 25;

function crearUpload(permitidos, mensajeRechazo, limiteMb = LIMITE_MB) {
  return multer({
    storage: multer.diskStorage({
      destination: STORAGE_DIR,
      filename: (req, file, cb) => cb(null, randomBytes(16).toString("hex") + permitidos[file.mimetype]),
    }),
    limits: { fileSize: limiteMb * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (permitidos[file.mimetype]) cb(null, true);
      // MulterError guarda el segundo argumento en .field: lo usamos como mensaje para el usuario
      else cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", mensajeRechazo));
    },
  });
}

export const uploadDiploma = crearUpload(IMAGENES_Y_PDF, "Solo se aceptan imágenes (JPG, PNG, WEBP, GIF) o PDF");
export const uploadFoto = crearUpload(IMAGENES, "Solo se aceptan imágenes (JPG, PNG, WEBP, GIF)");
export const uploadDocumento = crearUpload(
  DOCUMENTOS,
  "Solo se aceptan PDF, Word, PowerPoint o imágenes",
  LIMITE_DOCUMENTO_MB
);

export function borrarArchivo(nombre) {
  if (!nombre) return;
  fs.rm(path.join(STORAGE_DIR, path.basename(nombre)), { force: true }, () => {});
}

// descarga: nombre original del archivo. adjunto: true fuerza "Guardar como" en vez de abrirlo en el navegador.
export function enviarArchivo(res, nombre, { descarga, adjunto, cache } = {}) {
  const headers = {};
  if (descarga) {
    // filename* (RFC 5987) para que tildes y ñ del nombre original lleguen bien
    headers["Content-Disposition"] = `${adjunto ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(descarga)}`;
  }
  if (cache) headers["Cache-Control"] = "public, max-age=604800";
  res.sendFile(path.basename(nombre), { root: STORAGE_DIR, headers });
}

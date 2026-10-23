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

function crearUpload(permitidos, mensajeRechazo) {
  return multer({
    storage: multer.diskStorage({
      destination: STORAGE_DIR,
      filename: (req, file, cb) => cb(null, randomBytes(16).toString("hex") + permitidos[file.mimetype]),
    }),
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (permitidos[file.mimetype]) cb(null, true);
      // MulterError guarda el segundo argumento en .field: lo usamos como mensaje para el usuario
      else cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", mensajeRechazo));
    },
  });
}

export const uploadDiploma = crearUpload(IMAGENES_Y_PDF, "Solo se aceptan imágenes (JPG, PNG, WEBP, GIF) o PDF");
export const uploadFoto = crearUpload(IMAGENES, "Solo se aceptan imágenes (JPG, PNG, WEBP, GIF)");

export function borrarArchivo(nombre) {
  if (!nombre) return;
  fs.rm(path.join(STORAGE_DIR, path.basename(nombre)), { force: true }, () => {});
}

export function enviarArchivo(res, nombre, { descarga, cache } = {}) {
  const headers = {};
  if (descarga) headers["Content-Disposition"] = `inline; filename="${encodeURIComponent(descarga)}"`;
  if (cache) headers["Cache-Control"] = "public, max-age=604800";
  res.sendFile(path.basename(nombre), { root: STORAGE_DIR, headers });
}

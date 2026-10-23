import multer from "multer";
import { borrarArchivo } from "./upload.js";

export function errorHandler(err, req, res, next) {
  // Si el pedido falló después de que multer guardó el archivo, no dejarlo huérfano
  if (req.file) borrarArchivo(req.file.filename);
  req.files?.forEach((f) => borrarArchivo(f.filename));

  if (err instanceof multer.MulterError) {
    const mensaje = err.code === "LIMIT_FILE_SIZE" ? "El archivo supera los 8 MB" : err.field || err.message;
    return res.status(400).json({ error: mensaje });
  }
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "Ya existe un usuario con ese email" });
  }
  if (!err.status || err.status >= 500) console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : "Error interno" });
}

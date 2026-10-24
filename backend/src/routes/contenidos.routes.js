import { Router } from "express";
import * as descargas from "../controllers/descargasController.js";
import * as eventos from "../controllers/eventosController.js";
import { requireAdmin } from "../middleware/auth.js";
import { uploadDocumento } from "../middleware/upload.js";

// Descargas y calendario: lectura pública (lo privado solo con sesión) y edición del Sabonim
export const contenidosRouter = Router();

contenidosRouter.get("/descargas", descargas.listar);
contenidosRouter.get("/descargas/:id/archivo", descargas.archivo);
contenidosRouter.post("/admin/descargas", requireAdmin, uploadDocumento.single("archivo"), descargas.subir);
contenidosRouter.put("/admin/descargas/:id", requireAdmin, descargas.editar);
contenidosRouter.delete("/admin/descargas/:id", requireAdmin, descargas.eliminar);

contenidosRouter.get("/eventos", eventos.listar);
contenidosRouter.post("/admin/eventos", requireAdmin, eventos.crear);
contenidosRouter.put("/admin/eventos/:id", requireAdmin, eventos.editar);
contenidosRouter.delete("/admin/eventos/:id", requireAdmin, eventos.eliminar);

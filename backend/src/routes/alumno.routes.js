import { Router } from "express";
import { perfil, archivoRegistro } from "../controllers/alumnoController.js";
import { requireAuth } from "../middleware/auth.js";

export const alumnoRouter = Router();
alumnoRouter.get("/alumno/perfil", requireAuth, perfil);
alumnoRouter.get("/registros/:id/archivo", requireAuth, archivoRegistro);

import { Router } from "express";
import {
  proximas,
  responder,
  avisos,
  cancelar,
  reactivar,
  publicarAviso,
  eliminarAviso,
} from "../controllers/clasesController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

export const clasesRouter = Router();
clasesRouter.get("/clases/proximas", requireAuth, proximas);
clasesRouter.put("/clases/:claseId/:fecha/asistencia", requireAuth, responder);
clasesRouter.get("/avisos", requireAuth, avisos);

clasesRouter.post("/admin/clases/:claseId/:fecha/cancelacion", requireAdmin, cancelar);
clasesRouter.delete("/admin/clases/:claseId/:fecha/cancelacion", requireAdmin, reactivar);
clasesRouter.post("/admin/avisos", requireAdmin, publicarAviso);
clasesRouter.delete("/admin/avisos/:id", requireAdmin, eliminarAviso);

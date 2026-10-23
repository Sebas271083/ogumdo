import { Router } from "express";
import { clave, suscribir, desuscribir, probar, estado } from "../controllers/pushController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

export const pushRouter = Router();
pushRouter.get("/push/clave", clave);
pushRouter.post("/push/suscripcion", requireAuth, suscribir);
pushRouter.delete("/push/suscripcion", requireAuth, desuscribir);
pushRouter.post("/push/prueba", requireAuth, probar);
pushRouter.get("/admin/push/estado", requireAdmin, estado);

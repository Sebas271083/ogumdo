import { Router } from "express";
import { clave, suscribir, desuscribir, probar } from "../controllers/pushController.js";
import { requireAuth } from "../middleware/auth.js";

export const pushRouter = Router();
pushRouter.get("/push/clave", clave);
pushRouter.post("/push/suscripcion", requireAuth, suscribir);
pushRouter.delete("/push/suscripcion", requireAuth, desuscribir);
pushRouter.post("/push/prueba", requireAuth, probar);

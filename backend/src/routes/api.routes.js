import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { publicoRouter } from "./publico.routes.js";
import { alumnoRouter } from "./alumno.routes.js";
import { adminRouter } from "./admin.routes.js";

export const apiRouter = Router();
apiRouter.use(authRouter);
apiRouter.use(publicoRouter);
apiRouter.use(alumnoRouter);
apiRouter.use(adminRouter);
apiRouter.use((req, res) => res.status(404).json({ error: "No encontrado" }));

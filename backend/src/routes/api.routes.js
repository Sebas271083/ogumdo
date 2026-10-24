import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { publicoRouter } from "./publico.routes.js";
import { alumnoRouter } from "./alumno.routes.js";
import { adminRouter } from "./admin.routes.js";
import { clasesRouter } from "./clases.routes.js";
import { pushRouter } from "./push.routes.js";
import { contenidosRouter } from "./contenidos.routes.js";

export const apiRouter = Router();
apiRouter.use(authRouter);
apiRouter.use(publicoRouter);
apiRouter.use(alumnoRouter);
apiRouter.use(clasesRouter);
apiRouter.use(pushRouter);
apiRouter.use(contenidosRouter);
apiRouter.use(adminRouter);
apiRouter.use((req, res) => res.status(404).json({ error: "No encontrado" }));

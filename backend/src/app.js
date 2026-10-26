import fs from "node:fs";
import path from "node:path";
import express from "express";
import cors from "cors";
import { apiRouter } from "./routes/api.routes.js";
import { cargarUsuario } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { cabecerasSeguridad } from "./middleware/seguridad.js";
import { FRONTEND_DIST, FRONTEND_SSR } from "./config/paths.js";
import { pagina, robots, sitemap } from "./controllers/ssrController.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(cabecerasSeguridad);

  // CORS solo en desarrollo, por si se accede a la API desde otro puerto. En producción web y
  // API están en el mismo dominio: habilitarlo con credentials permitiría que otra web (por
  // ejemplo algo corriendo en localhost del visitante) lea la API con su sesión.
  if (process.env.NODE_ENV !== "production") {
    const origenes = (process.env.FRONTEND_ORIGIN ?? "http://localhost:5173")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);
    app.use(cors({ origin: origenes, credentials: true }));
  }
  app.use(express.json({ limit: "100kb" }));

  app.use("/api", cargarUsuario, apiRouter);

  // En producción el mismo servidor sirve el build de React (npm run build en frontend/)
  if (fs.existsSync(FRONTEND_DIST)) {
    // Los archivos de /assets llevan hash en el nombre: se pueden cachear por un año
    app.use("/assets", express.static(path.join(FRONTEND_DIST, "assets"), { immutable: true, maxAge: "1y" }));
    // index: false para que "/" pase por el render del servidor y no sirva el index.html crudo
    app.use(express.static(FRONTEND_DIST, { index: false }));

    if (fs.existsSync(FRONTEND_SSR)) {
      app.get("/robots.txt", robots);
      app.get("/sitemap.xml", sitemap);
      app.get("/{*ruta}", pagina);
    } else {
      app.get("/{*ruta}", (req, res) => res.sendFile(path.join(FRONTEND_DIST, "index.html")));
    }
  }

  app.use(errorHandler);

  return app;
}

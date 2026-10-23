import "dotenv/config";
import { createApp } from "./app.js";
import { limpiarSesionesVencidas } from "./services/sesionesService.js";
import { iniciarRecordatorios } from "./services/recordatoriosService.js";

const port = process.env.PORT || 4000;

const app = createApp();

app.listen(port, () => {
  console.log(`Backend escuchando en http://localhost:${port}`);
});

iniciarRecordatorios();

limpiarSesionesVencidas().catch((err) =>
  console.error(`No se pudo conectar a MySQL (${err.code ?? err.message}). ¿Corriste "npm run init-db"?`)
);

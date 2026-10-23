import fs from "node:fs/promises";
import path from "node:path";
import { CONTENIDO_DIR } from "../config/paths.js";

// Se lee en cada pedido para que los cambios en /contenido se vean sin reiniciar el servidor
export async function leerContenido(nombre) {
  return JSON.parse(await fs.readFile(path.join(CONTENIDO_DIR, `${nombre}.json`), "utf8"));
}

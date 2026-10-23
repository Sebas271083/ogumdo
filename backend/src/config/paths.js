import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const BACKEND_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const STORAGE_DIR = path.join(BACKEND_DIR, "storage");
export const CONTENIDO_DIR = path.join(BACKEND_DIR, "contenido");
export const SCHEMA_PATH = path.join(BACKEND_DIR, "..", "db", "schema.sql");
export const FRONTEND_DIST = path.join(BACKEND_DIR, "..", "frontend", "dist");
export const FRONTEND_SSR = path.join(BACKEND_DIR, "..", "frontend", "dist-server", "entry-server.js");

fs.mkdirSync(STORAGE_DIR, { recursive: true });

import { Router } from "express";
import { escuela, profesor, galeria, albumes, destacadas, imagenGaleria, contacto } from "../controllers/publicoController.js";

export const publicoRouter = Router();
publicoRouter.get("/contenido/escuela", escuela);
publicoRouter.get("/contenido/profesor", profesor);
publicoRouter.get("/galeria", galeria);
publicoRouter.get("/albumes", albumes);
publicoRouter.get("/galeria/destacadas", destacadas);
publicoRouter.get("/galeria/:id/imagen", imagenGaleria);
publicoRouter.post("/contacto", contacto);

import { Router } from "express";
import {
  alumnos,
  alumno,
  crearAlumno,
  editarAlumno,
  eliminarAlumno,
  agregarRegistro,
  eliminarRegistro,
  subirFotos,
  eliminarFoto,
  mensajes,
  editarMensaje,
  eliminarMensaje,
} from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/auth.js";
import { uploadDiploma, uploadFoto } from "../middleware/upload.js";

export const adminRouter = Router();
adminRouter.use("/admin", requireAdmin);

adminRouter.get("/admin/alumnos", alumnos);
adminRouter.post("/admin/alumnos", crearAlumno);
adminRouter.get("/admin/alumnos/:id", alumno);
adminRouter.put("/admin/alumnos/:id", editarAlumno);
adminRouter.delete("/admin/alumnos/:id", eliminarAlumno);

adminRouter.post("/admin/alumnos/:id/registros", uploadDiploma.single("archivo"), agregarRegistro);
adminRouter.delete("/admin/registros/:id", eliminarRegistro);

adminRouter.post("/admin/galeria", uploadFoto.array("fotos", 30), subirFotos);
adminRouter.delete("/admin/galeria/:id", eliminarFoto);

adminRouter.get("/admin/mensajes", mensajes);
adminRouter.patch("/admin/mensajes/:id", editarMensaje);
adminRouter.delete("/admin/mensajes/:id", eliminarMensaje);

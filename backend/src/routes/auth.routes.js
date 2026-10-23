import { Router } from "express";
import { login, logout, me, password } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();
authRouter.post("/auth/login", login);
authRouter.post("/auth/logout", logout);
authRouter.get("/auth/me", me);
authRouter.post("/auth/password", requireAuth, password);

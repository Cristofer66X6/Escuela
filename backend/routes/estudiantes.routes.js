import { Router } from "express";
import { registerEstudiante, loginEstudiante } from "../controllers/estudiantes.controller.js";

const router = Router();

router.post("/register", registerEstudiante);
router.post("/login", loginEstudiante);

export default router;

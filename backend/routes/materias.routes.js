import { Router } from "express";
import { getMaterias, createMateria } from "../controllers/materias.controller.js";

const router = Router();

router.get("/", getMaterias);
router.post("/", createMateria);

export default router;

import express from "express";
import cors from "cors";
import pool from "./db.js";
import path from "path";

const app = express();
app.use(express.static("public"));
app.use(cors());
app.use(express.json());

/* ===================== AUTENTICACIÓN ===================== */
// Registro
app.post("/register", async (req, res) => {
  const { nombre, carrera, numero_control, periodo_inicio, semestre, contrasena } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO estudiantes (nombre, carrera, numero_control, periodo_inicio, semestre, contrasena)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre, numero_control`,
      [nombre, carrera, numero_control, periodo_inicio, semestre, contrasena]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al registrar usuario:", err);
    res.status(400).json({ error: "No se pudo registrar el usuario" });
  }
});
// Login
app.post("/login", async (req, res) => {
  const { numero_control, contrasena } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM estudiantes WHERE numero_control=$1 AND contrasena=$2",
      [numero_control, contrasena]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    res.json({ message: "Login exitoso", user: result.rows[0] });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});
// Actualizar usuario por numero_control
app.put("/usuario/:numero_control", async (req, res) => {
  const { numero_control } = req.params;
  const { nombre, carrera, contrasena } = req.body;

  try {
    const result = await pool.query(
      `UPDATE estudiantes
       SET nombre=$1, carrera=$2, contrasena=$3
       WHERE numero_control=$4
       RETURNING *`,
      [nombre, carrera, contrasena, numero_control]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(400).json({ error: "No se pudo actualizar el usuario" });
  }
});
app.get("/estudiante/:numero_control", async (req, res) => {
  const { numero_control } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM estudiantes_detalles WHERE numero_control = $1",
      [numero_control]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No se encontraron datos académicos" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener datos del estudiante" });
  }
});
// Crear o registrar datos académicos del estudiante
app.post("/estudiantes", async (req, res) => {
  const { numero_control, nombre, carrera, semestre, periodo_inicio, materias_cursadas, especialidad, creditos } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO estudiantes_detalles 
       (numero_control, nombre, carrera, semestre, periodo_inicio, materias_cursadas, especialidad, creditos) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [numero_control, nombre, carrera, semestre, periodo_inicio, materias_cursadas, especialidad, creditos]
    );

    res.json({ message: "Datos del estudiante registrados", estudiante: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar datos académicos" });
  }
});
// Actualizar datos académicos de un estudiante por numero_control
app.put("/estudiantes/:numero_control", async (req, res) => {
  const { numero_control } = req.params;
  const { nombre, carrera, semestre, periodo_inicio, materias_cursadas, especialidad, creditos } = req.body;

  try {
    const result = await pool.query(
      `UPDATE estudiantes_detalles 
       SET nombre=$1, carrera=$2, semestre=$3, periodo_inicio=$4, materias_cursadas=$5, especialidad=$6, creditos=$7
       WHERE numero_control=$8 RETURNING *`,
      [nombre, carrera, semestre, periodo_inicio, materias_cursadas, especialidad, creditos, numero_control]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }

    res.json({ message: "Datos actualizados", estudiante: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar datos" });
  }
});


// Eliminar usuario por numero_control
app.delete("/usuario/:numero_control", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM estudiantes WHERE numero_control=$1 RETURNING *",
      [req.params.numero_control]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado" });
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    res.status(400).json({ error: "No se pudo eliminar el usuario" });
  }
});

// Listar estudiantes
app.get("/estudiantes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM estudiantes");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener estudiantes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
/* ===================== MATERIAS ===================== */
// Crear materia
app.post("/materias", async (req, res) => {
  const { nombre, creditos } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO materias (nombre, creditos) VALUES ($1, $2) RETURNING *",
      [nombre, creditos]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al crear materia:", err);
    res.status(400).json({ error: "No se pudo crear la materia" });
  }
});
// Ver todas las materias
app.get("/materias", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM materias");
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener materias:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
/* ===================== AVANCE (Estudiantes ↔ Materias) ===================== */
// Inscribir estudiante en una materia
app.post("/avance", async (req, res) => {
  const { id_estudiante, id_materia } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO avance (id_estudiante, id_materia) VALUES ($1, $2) RETURNING *",
      [id_estudiante, id_materia]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al inscribir materia:", err);
    res.status(400).json({ error: "Error al inscribir materia" });
  }
});
// Ver avance de un estudiante
app.get("/avance/:id_estudiante", async (req, res) => {
  const { id_estudiante } = req.params;
  try {
    const result = await pool.query(
      `SELECT a.id, m.nombre, m.creditos, a.estado
       FROM avance a
       JOIN materias m ON a.id_materia = m.id
       WHERE a.id_estudiante = $1`,
      [id_estudiante]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener avance:", err);
    res.status(400).json({ error: "Error al obtener avance" });
  }
});
// Actualizar estado de una materia en el avance (Aprobada / Reprobada / En curso)
app.put("/avance/:id", async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    const result = await pool.query(
      "UPDATE avance SET estado=$1 WHERE id=$2 RETURNING *",
      [estado, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al actualizar avance:", err);
    res.status(400).json({ error: "Error al actualizar avance" });
  }
});
/* ===================== INICIO SERVIDOR ===================== */
app.listen(3000, () => {
  console.log("✅ Servidor corriendo en http://localhost:3000");
});

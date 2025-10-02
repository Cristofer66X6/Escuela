import express from "express";
import cors from "cors";
import path from "path";
import { saludar, obtenerFecha } from "./modulos/ejemplo.js";
import dotenv from "dotenv";
dotenv.config();
import pool from "./db.js";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import fs from "fs";




const app = express();
app.use(express.static("public"));
app.use(cors());
app.use(express.json());
const SECRET = process.env.JWT_SECRET;

// Limiter global para una ruta específica
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 5, // máximo 5 solicitudes por IP
  message: { error: "Has excedido el límite de peticiones. Intenta de nuevo más tarde." },
  standardHeaders: true, // Devuelve info de límite en headers
  legacyHeaders: false
});
// Función para registrar intentos fallidos
const logIntentoFallido = (numero_control, ruta) => {
  const fecha = new Date().toISOString();
  const log = `${fecha} - Usuario: ${numero_control || "desconocido"} - Ruta: ${ruta}\n`;

  const logPath = path.join(process.cwd(), "logs.txt"); // ✅ Solo Node.js

  fs.appendFile(logPath, log, (err) => {
    if (err) console.error("Error escribiendo en log:", err);
  });
};
//Middlewae para Token
const tokenMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // Esperamos que venga como "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token requerido" });
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: "Token inválido o expirado" });

    req.user = user; // guardamos info del token
    next();
  });
};
// Middleware para cabecera personalizada
app.use((req, res, next) => {
  res.setHeader("X-App-Author", "Cristofer Hizo esto");
  next();
});
// Middleware para registrar todas las respuestas (Práctica 5)
app.use((req, res, next) => {
  // Guardamos hora inicial
  const start = new Date().toISOString();

  // Escuchamos cuando la respuesta termine
  res.on("finish", () => {
    const metodo = req.method;
    const ruta = req.originalUrl;
    const status = res.statusCode;

    const log = `${start} - ${metodo} ${ruta} - ${status}\n`;
    const logPath = path.join(process.cwd(), "logs_respuestas.txt");

    fs.appendFile(logPath, log, (err) => {
      if (err) console.error("Error escribiendo log de respuestas:", err);
    });
  });

  next();
});

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
    res.status(200).json(result.rows[0]);
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

    const user = result.rows[0];

    // Generar token válido por 1 hora
    const token = jwt.sign(
      { numero_control: user.numero_control, nombre: user.nombre },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login exitoso", token });
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
      "SELECT * FROM estudiantes WHERE numero_control = $1",
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
  const { nombre, carrera, semestre, periodo_inicio, contrasena } = req.body;

  try {
    const result = await pool.query(
      `UPDATE estudiantes 
       SET nombre=$1, carrera=$2, semestre=$3, periodo_inicio=$4, contrasena=$5
       WHERE numero_control=$6 RETURNING *`,
      [nombre, carrera, semestre, periodo_inicio, contrasena, numero_control] // ✅ CORRECTO
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

//Middleware para manejar rutas no encontradas de practica 4
const authMiddleware = async (req, res, next) => {
  const { numero_control, contrasena } = req.headers;

  if (!numero_control || !contrasena) {
    logIntentoFallido(numero_control, req.originalUrl); // log aquí
    return res.status(401).json({ error: "Credenciales requeridas" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM estudiantes WHERE numero_control=$1 AND contrasena=$2",
      [numero_control, contrasena]
    );
    if (result.rows.length === 0) {
      logIntentoFallido(numero_control, req.originalUrl); // log aquí también
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error("Error en authMiddleware:", err);
    res.status(500).json({ error: "Error interno en autenticación" });
  }
};


//----------------------------------RUTAS DE PRACTICA DE LA UNIDAD 4 AGREGADAS-----------------------------------
app.get("/saludo/:nombre", (req, res) => { 
  const { nombre } = req.params; 
  res.json({ mensaje: saludar(nombre), fecha: obtenerFecha() }); 
});
// Buscar materias con filtros opcionales
app.get("/buscar-estudiantes", async (req, res) => {
  const { nombre, carrera } = req.query; // aquí se reciben los parámetros de búsqueda

  try {
    let query = "SELECT * FROM estudiantes WHERE 1=1";
    const values = [];
    let counter = 1;

    if (nombre) {
      query += ` AND nombre ILIKE $${counter++}`;
      values.push(`%${nombre}%`);
    }
    if (carrera) {
      query += ` AND carrera = $${counter++}`;
      values.push(carrera);
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Error en búsqueda:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});
// Ruta básica de saludo
app.get("/saludo", (req, res) => {
  res.send("Hola Mundo");
});
// Ruta nueva
app.get("/nueva", (req, res) => {
  res.send("Bienvenido a la ruta nueva 🚀");
});
// Ruta antigua que redirige a la nueva
app.get("/antigua", (req, res) => {
  res.redirect("/nueva");
});
// Ruta pública (sin restricciones)
app.get("/publica", limiter, (req, res) => {
  res.json({ mensaje: "Ruta pública con limitación de peticiones ✅" });
});

// Ruta privada (requiere autenticación)
app.get("/privada", authMiddleware, (req, res) => {
  res.json({ 
    mensaje: "Ruta privada: acceso permitido ✅", 
    usuario: req.user 
  });
});

// Ruta pública
app.get("/publica", (req, res) => {
  res.send("Ruta pública ✅");
});
app.get("/solo-admin", authMiddleware, (req, res) => {
  if (req.user.carrera !== "Admin") {
    return res.status(403).json({ error: "Acceso prohibido: solo administradores" });
  }
  res.json({ mensaje: "Bienvenido administrador ✅" });
});


/*
// Ruta privada que requiere token
app.get("/privada", tokenMiddleware, (req, res) => {
  res.json({
    mensaje: "Acceso permitido con token ✅",
    usuario: req.user
  });
});
*/



/* ===================== INICIO SERVIDOR ===================== */
const PORT = process.env.PORT || 3000; // usa el del .env o 3000 por defecto
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

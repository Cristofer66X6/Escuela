import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import cookieParser from "cookie-parser";
import { saludar, obtenerFecha } from "./modulos/ejemplo.js";

// Detectar el ambiente que quieremos usar
const envArg = process.argv[2];
const envName = envArg || process.env.NODE_ENV || "sandbox";
const allowedOrigins = [
  "http://localhost:5500",   
  "http://127.0.0.1:5500"    
];

// 🔐 Funciones para generar tokens
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, numero_control: user.numero_control, role: user.rol || "user" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES }
  );
};
const refreshTokens = [];

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, numero_control: user.numero_control, role: user.rol || "user" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES }
  );
};
// Mostrar en consola para verificar qué se cargó
console.log("🌎 Ambiente cargado: producción (usando .env real)");
console.log("📁 Archivo .env usado: .env");
console.log("⚙️  PAGO_AMBIENTE =", process.env.PAGO_AMBIENTE);
console.log(
  "🗄️  DATABASE_URL =",
  process.env.DATABASE_URL ? process.env.DATABASE_URL.split("@")[1] : "No definida"
);

import pool from "./db.js";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

import fs from "fs";

const app = express();
app.use(express.static("public"));
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true,  // permite cookies/tokens si los usas
}));
app.use(express.json());
const SECRET = process.env.JWT_SECRET;

// Limiter global para una ruta específica
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 5, 
  message: { error: "Has excedido el límite de peticiones. Intenta de nuevo más tarde." },
  standardHeaders: true, 
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
app.use(cookieParser());
// Middleware para registrar todas las respuestas (Práctica 5)
app.use((req, res, next) => {
  // Guardamos hora inicial
  const start = new Date().toISOString();

// Middleware: verificar JWT
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token requerido" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido o expirado" });
    req.user = user;
    next();
  });
};

// Middleware: verificar roles
const verifyRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Acceso denegado: no tienes permisos suficientes" });
    }
    next();
  };
};


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
// Middleware para verificar JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) return res.status(401).json({ error: "Token requerido" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido o expirado" });
    req.user = user;
    next();
  });
};
// Middleware para verificar roles
const verifyRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: "Acceso denegado: no tienes permisos suficientes" });
    }
    next();
  };
};

/* ===================== AUTENTICACIÓN ===================== */
// Registro
app.post("/register", async (req, res) => {
  const { nombre, carrera, numero_control, periodo_inicio, semestre, contrasena, rol } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO estudiantes (nombre, carrera, numero_control, periodo_inicio, semestre, contrasena, rol)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, nombre, numero_control, rol`,
      [nombre, carrera, numero_control, periodo_inicio, semestre, contrasena, rol || "user"]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error al registrar usuario:", err);
    res.status(400).json({ error: "No se pudo registrar el usuario" });
  }
});
app.get("/verify", verifyToken, (req, res) => {
  res.json({ user: req.user });
});
// Login
/*app.post("/login", async (req, res) => {
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

   const token = jwt.sign(
  { numero_control: user.numero_control, contrasena: user.contrasena },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
);


    res.json({ message: "Login exitoso", token });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});
*/
// Actualizar usuario por numero_control
app.put("/usuario/:numero_control", verifyToken, verifyRole(["admin"]), async (req, res) => {
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
app.post("/estudiantes", verifyToken, verifyRole(["admin"]),async (req, res) => {
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
app.put("/estudiantes/:numero_control",verifyToken, verifyRole(["admin"]), async (req, res) => {
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
app.delete("/usuario/:numero_control", verifyToken, verifyRole(["admin"]), async (req, res) => {
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
app.get("/estudiantes",verifyToken, verifyRole(["admin"]), async (req, res) => {
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
// POST /avance
app.post("/avance", async (req, res) => {
  const { numero_control, id_materia } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO avance (numero_control, id_materia)
       VALUES ($1, $2)
       ON CONFLICT (numero_control, id_materia) DO NOTHING
       RETURNING *`,
      [numero_control, id_materia]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Ya inscrito en esta materia" });
    }

    res.json({ message: "Materia inscrita", data: result.rows[0] });

  } catch (err) {
    res.status(500).json({ error: "Error al inscribir materia" });
  }
});
// ADMIN: Actualizar estado de materia inscrita
app.put("/admin/actualizar-estado", async (req, res) => {
  const { numeroControl, idMateria, nuevoEstado } = req.body;

  try {
    const result = await pool.query(
      `UPDATE avance
       SET estado = $3
       WHERE numero_control = $1 AND id_materia = $2
       RETURNING *`,
      [numeroControl, idMateria, nuevoEstado]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ mensaje: "No se encontró inscripción para actualizar" });
    }

    res.json({ mensaje: "Estado actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});


// GET /avance/:numero_control
app.get("/avance/:numero_control", async (req, res) => {
  const { numero_control } = req.params;

  try {
    const result = await pool.query(
      `SELECT m.nombre, m.creditos, a.estado
       FROM avance a
       INNER JOIN materias m ON m.id = a.id_materia
       WHERE a.numero_control = $1`,
      [numero_control]
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ error: "Error al obtener avance" });
  }
});

/*
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
});*/
// Actualizar estado de una materia en el avance (Aprobada / Reprobada / En curso)
// PUT /avance/:id
app.put("/avance/:id", async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const result = await pool.query(
      "UPDATE avance SET estado=$1 WHERE id=$2 RETURNING *",
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Registro de avance no encontrado" });
    }

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
/* ===================== PAGOS DE MATERIAS E INSCRIPCIONES ===================== */
app.post("/pago", async (req, res) => {
  const { numero_control, tipo_pago, descripcion, monto } = req.body;
  const ambiente = process.env.PAGO_AMBIENTE;

  try {
    // 1️⃣ Validar los datos
    if (!numero_control || !tipo_pago || !monto) {
      return res.status(400).json({ error: "Faltan datos: numero_control, tipo_pago o monto."});
    }

    // 2️⃣ Según el ambiente, se ejecuta una lógica distinta
    let resultado;

    switch (ambiente) {
      case "productivo":
        // Registrar pago real en la base de datos
        const result = await pool.query(
          `INSERT INTO pagos (numero_control, tipo_pago, descripcion, monto, ambiente)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [numero_control, tipo_pago, descripcion, monto, ambiente]
        );

        // Registrar evidencia en un archivo
        const logPago = `💳 [PRODUCTIVO] ${new Date().toISOString()} | Usuario: ${numero_control} | Tipo: ${tipo_pago} | Monto: $${monto} | Desc: ${descripcion}\n`;
        fs.appendFileSync(path.join(process.cwd(), "pagos_productivo.log"), logPago);

        resultado = {
          mensaje: "Pago realizado correctamente ✅",
          ambiente,
          pago: result.rows[0]
        };
        break;

      case "ambiental":
        // No guarda nada, solo simula
        resultado = {
          mensaje: "Pago ambiental simulado (no se registró en la base de datos) 🌿",
          ambiente,
          detalles: { numero_control, tipo_pago, monto, descripcion }
        };
        break;

      case "sandbox":
        // Genera datos falsos para pruebas
        resultado = {
          mensaje: "Pago de prueba (sandbox) 🧪",
          ambiente,
          datos_ejemplo: {
            id_pago: Math.floor(Math.random() * 10000),
            numero_control,
            tipo_pago,
            descripcion,
            monto,
            fecha: new Date().toISOString()
          }
        };
        break;

      default:
        return res.status(400).json({ error: "Ambiente de pago no configurado correctamente" });
    }

    res.status(200).json(resultado);

  } catch (err) {
    console.error("Error al procesar pago:", err);
    res.status(500).json({ error: "Error interno al procesar pago" });
  }
});
app.post("/crear-pago", async (req, res) => {
  const { numero_control, tipo, monto } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "mxn",
          product_data: {
            name: tipo === "inscripcion" ? "Pago de inscripción" : "Pago de materias",
          },
          unit_amount: monto * 100, 
        },
        quantity: 1,
      }],
      success_url: "http://localhost:5500/success.html",
      cancel_url: "http://localhost:5500/cancel.html",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creando el pago" });
  }
});
// ===================== RATE LIMIT PARA LOGIN =====================
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 5, 
  message: {
    error: "Has excedido el número máximo de intentos. Intenta de nuevo en 1 minuto.",
  },
  standardHeaders: true, 
  legacyHeaders: false,  
});
// Ruta de login completa
app.post("/login", loginLimiter, async (req, res) => {
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

    // Generar tokens
    const accessToken = jwt.sign(
      {
        id: user.id,
        numero_control: user.numero_control,
        nombre: user.nombre,
        rol: user.rol || "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1m" } 
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
    );

    // Guardar refresh token en BD
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)",
      [user.id, refreshToken]
    );

    // Enviar el refresh token en una cookie segura
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // en HTTPS
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });
    res.json({
      message: "✅ Login exitoso",
      accessToken,
      user: {
        id: user.id,
        numero_control: user.numero_control,
        nombre: user.nombre,
        rol: user.rol || "user",
      },
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});
// Ruta para renovar el access token
app.post("/token", async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ error: "No se encontró el refresh token" });
  }

  try {
    // Verificar si el token existe en la BD
    const result = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1",
      [refreshToken]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: "Refresh token inválido o revocado" });
    }

    // Verificar firma
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ error: "Token expirado o inválido" });

      // Crear un nuevo access token
      const newAccessToken = jwt.sign(
        { id: decoded.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1m" }
      );

      res.json({ accessToken: newAccessToken });
    });
  } catch (err) {
    console.error("Error al refrescar token:", err);
    res.status(500).json({ error: "Error interno al renovar token" });
  }
});
app.post("/logout", async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.sendStatus(204); // sin contenido

  try {
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [refreshToken]);
    res.clearCookie("refreshToken");
    res.json({ message: "✅ Sesión cerrada correctamente" });
  } catch (err) {
    console.error("Error al cerrar sesión:", err);
    res.status(500).json({ error: "Error al cerrar sesión" });
  }
});
// Ruta para verificar un access token
app.get("/verify", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Espera formato: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "Token requerido" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido o expirado" });
    }

    res.json({
      valid: true,
      message: "Token válido ✅",
      user
    });
  });
});
// Obtener talleres
// ===================== EXTRAESCOLARES =====================

// Obtener talleres disponibles (alumno + admin)
app.get("/extraescolares/talleres", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM talleres");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Alumno se inscribe a un taller
app.post("/extraescolares/inscribir", async (req, res) => {
  const { numero_control, taller } = req.body;

  try {
    await pool.query(
      "INSERT INTO extraescolares (numero_control, taller, estado) VALUES ($1, $2, 'Cursando')",
      [numero_control, taller]
    );
    res.json({ message: "Alumno inscrito al taller" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Admin agrega nuevo taller al catálogo
app.post("/extraescolares/agregar", async (req, res) => {
  const { taller, tipo } = req.body;

  try {
    await pool.query(
      "INSERT INTO talleres (taller, tipo) VALUES ($1, $2)",
      [taller, tipo]
    );
    res.json({ message: "Taller agregado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Admin cambia estado de un alumno (Cursando / Sin cursar / Reprobada)
app.put("/extraescolares/estado", async (req, res) => {
  const { numeroControl, estado } = req.body;

  try {
    await pool.query(
      "UPDATE extraescolares SET estado = $1 WHERE numero_control = $2",
      [estado, numeroControl]
    );
    res.json({ message: "Estado actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Alumno ve sus talleres inscritos y su estado
app.get("/extraescolares/alumno/:nc", async (req, res) => {
  const { nc } = req.params;

  try {
    const result = await pool.query(
      "SELECT taller, estado FROM extraescolares WHERE numero_control = $1",
      [nc]
  );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/extraescolares/registrar-alumno", async (req, res) => {
  const { numero_control, tallerID } = req.body;

  try {
    await pool.query(
      `INSERT INTO extraescolares (taller, numero_control, estado)
       SELECT t.taller, $1, 'Cursando'
       FROM talleres t
       WHERE t.id = $2`,
      [numero_control, tallerID]
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





/* ===================== INICIO SERVIDOR ===================== */
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
  

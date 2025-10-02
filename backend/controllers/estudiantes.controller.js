import pool from "../db.js";

// Registro
export const registerEstudiante = async (req, res) => {
  const { nombre, carrera, numero_control, periodo_inicio, semestre, contrasena } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO estudiantes (nombre, carrera, numero_control, periodo_inicio, semestre, contrasena)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre, numero_control`,
      [nombre, carrera, numero_control, periodo_inicio, semestre, contrasena]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: "No se pudo registrar el usuario" });
  }
};

// Login
export const loginEstudiante = async (req, res) => {
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
    res.status(500).json({ error: "Error en el servidor" });
  }
};

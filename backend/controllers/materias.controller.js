import pool from "../db.js";

export const getMaterias = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM materias");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener materias" });
  }
};

export const createMateria = async (req, res) => {
  const { nombre, creditos } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO materias (nombre, creditos) VALUES ($1, $2) RETURNING *",
      [nombre, creditos]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: "No se pudo crear la materia" });
  }
};

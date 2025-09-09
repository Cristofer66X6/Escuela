import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/estudiantes', (req, res) => {
  pool.query('SELECT * FROM estudiantes', (error, results) => {
    if (error) {
      console.error('Error al obtener estudiantes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.json(results.rows);
    }
  });
});

app.post('/estudiantes', async (req,  res) => {
    const { nombre, carrera, numero_control, periodo_inicio, semestre } = req.body;
    const result = await pool.query(
    `INSERT INTO estudiantes (nombre, carrera, numero_control, periodo_inicio, semestre) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [nombre, carrera, numero_control, periodo_inicio, semestre]
  );
  res.json(result.rows[0]);
});

app.get('/materias', async (req, res) => {
    const result = await pool.query('SELECT * FROM materias');
    res.json(result.rows);
});

app.post("/materias", async (req, res) => {
  const { nombre, carrera, especialidad, es_recurse } = req.body;
  const result = await pool.query(
    `INSERT INTO materias (nombre, carrera, especialidad, es_recurse) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [nombre, carrera, especialidad, es_recurse]
  );
  res.json(result.rows[0]);
});


app.get("/avance", async (req, res) => {
  const result = await pool.query(
    `SELECT a.id, e.nombre AS estudiante, m.nombre AS materia, a.estado, a.calificacion
     FROM avance a
     JOIN estudiantes e ON e.id = a.estudiante_id
     JOIN materias m ON m.id = a.materia_id`
  );
  res.json(result.rows);
});

app.post("/avance", async (req, res) => {
  const { estudiante_id, materia_id, estado, calificacion } = req.body;
  const result = await pool.query(
    `INSERT INTO avance (estudiante_id, materia_id, estado, calificacion) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [estudiante_id, materia_id, estado, calificacion]
  );
  res.json(result.rows[0]);
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
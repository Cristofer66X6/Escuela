# Escuela
Proyecto backend sobre mi escuela 


 Tabla: estudiantes
 Insertar estudiante
INSERT INTO estudiantes (nombre, carrera, numero_control, periodo_inicio, semestre, contrasena)
VALUES ('Juan Pérez', 'Ingeniería en Sistemas', '2025001', '2025-1', 1, '1234');


Respuesta esperada:

INSERT 0 1

 Ver todos los estudiantes
SELECT * FROM estudiantes;


Ejemplo de salida:

 id |   nombre    |        carrera        | numero_control | periodo_inicio | semestre | contrasena
----+-------------+-----------------------+----------------+----------------+----------+------------
  1 | Juan Pérez  | Ingeniería en Sistemas| 2025001        | 2025-1         |        1 | 1234

 Actualizar estudiante
UPDATE estudiantes
SET nombre = 'Juan P. Ramírez', semestre = 2, contrasena = 'abcd'
WHERE id = 1;


Respuesta esperada:

UPDATE 1

 Eliminar estudiante
DELETE FROM estudiantes WHERE id = 1;


Respuesta esperada:

DELETE 1

 Tabla: materias
 Insertar materia
INSERT INTO materias (nombre, creditos)
VALUES ('Programación I', 6);


Respuesta esperada:

INSERT 0 1

 Ver materias
SELECT * FROM materias;


Ejemplo de salida:

 id |     nombre      | creditos
----+-----------------+----------
  1 | Programación I  |        6

 Actualizar materia
UPDATE materias
SET nombre = 'Programación Básica', creditos = 5
WHERE id = 1;


Respuesta esperada:

UPDATE 1

 Eliminar materia
DELETE FROM materias WHERE id = 1;


Respuesta esperada:

DELETE 1

 Tabla: avance (relación estudiante ↔ materia)
 Inscribir estudiante en materia
INSERT INTO avance (id_estudiante, id_materia, estado)
VALUES (1, 1, 'cursando');


Respuesta esperada:

INSERT 0 1

 Ver avance de un estudiante
SELECT a.id, e.nombre AS estudiante, m.nombre AS materia, a.estado
FROM avance a
JOIN estudiantes e ON a.id_estudiante = e.id
JOIN materias m ON a.id_materia = m.id
WHERE e.id = 1;


Ejemplo de salida:

 id | estudiante  |    materia     |  estado
----+-------------+----------------+----------
  1 | Juan Pérez  | Programación I | cursando

 Actualizar estado del avance
UPDATE avance
SET estado = 'aprobada'
WHERE id = 1;


Respuesta esperada:

UPDATE 1

 Eliminar avance
DELETE FROM avance WHERE id = 1;


Respuesta esperada:

DELETE 1

# Proyecto Express + PostgreSQL

Este proyecto es una API REST desarrollada con Express.js y conectada a una base de datos PostgreSQL. Su función principal es administrar estudiantes, materias y el avance académico (relación entre estudiante y materia).

# Base de datos

PostgreSQL: es el sistema de gestión de bases de datos usado. Se encarga de almacenar la información de estudiantes, materias y sus relaciones.

pg: es el cliente oficial de PostgreSQL para Node.js. Permite que la aplicación en Express pueda comunicarse con la base de datos.

Pool: es un conjunto de conexiones a la base de datos que se mantienen abiertas para mejorar el rendimiento. Gracias a esto, no es necesario abrir y cerrar una conexión cada vez que se hace una consulta.

# Servidor Express

El servidor está desarrollado con Express.js. Aquí se definen todas las rutas de la API, que reciben las solicitudes, procesan los datos y devuelven una respuesta en formato JSON.

# Rutas de la API
# Estudiantes

Registrar estudiante: Permite agregar un nuevo estudiante a la base de datos.

Iniciar sesión: Verifica el número de control y contraseña de un estudiante.

Actualizar estudiante: Permite modificar los datos de un estudiante usando su número de control.

Eliminar estudiante: Borra un estudiante de la base de datos a partir de su número de control.

Listar estudiantes: Devuelve todos los estudiantes registrados.

# Materias

Crear materia: Agrega una nueva materia con su nombre y número de créditos.

Listar materias: Devuelve todas las materias disponibles.

Avance (Relación Estudiante ↔ Materia)

Inscribir estudiante en materia: Relaciona un estudiante con una materia.

Ver avance de un estudiante: Muestra todas las materias inscritas por un estudiante y su estado.

Actualizar estado de avance: Permite cambiar el estado de una materia en el avance (ejemplo: aprobada, reprobada o en curso).

# Tecnologías usadas

Node.js + Express.js → para el servidor y la lógica de negocio.

PostgreSQL → para la base de datos.

pg (node-postgres) → para conectar Node.js con PostgreSQL.

CORS → para permitir solicitudes desde diferentes orígenes.

# Uso de la API

Se ejecuta el servidor con Express.

El servidor procesa los datos y consulta la base de datos mediante pool.query().

La respuesta se devuelve en formato JSON.
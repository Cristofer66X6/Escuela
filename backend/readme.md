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

# ¿Qué es un módulo en Node.js?

Un módulo es un archivo de código que contiene funciones, clases, constantes o variables que se pueden reutilizar en diferentes partes de tu aplicación.
En Node.js, cada archivo es un módulo por sí mismo.
Se pueden exportar elementos (funciones, variables, clases).
Y luego importarlos en otro archivo donde los necesites.

# ¿Para qué se usó el módulo de ejemplo?

En la práctica, se creó el archivo modulos/ejemplo.js con funciones simples.
Ese módulo se usó para demostrar la mecánica básica de creación e importación de un módulo en Node.js
Demostrar que ese archivo puede ser llamado desde el programa principal cuando lo necesitemos.
En lugar de meter todas las funciones en un solo archivo grande, separamos algunas en un módulo.
Ese módulo contenía dos tareas básicas:
Generar un saludo para un usuario.
Obtener la fecha y hora actual.

# ¿Como corremos nuestro servidor backend?

Es simple primero tenemos que ubicarnos en la carpeta /backend con el comando "cd backend"
Ahora que estamos en la carpeta donde tenemos index.js ejecutamos "node index.js" y este nos correra automaticamente en el puerto 3000 que es el que configuramos nosotros 

# Carpetas explicadas

-Modulos: es para organizar los modulos reutilizables en node.js
-imagenes: Nuestras imagenes de readme principal
-db.js: Conexion a la base de datos en nuestro caso es postgress
-index.js: Archivo principal que contiene nuestras rutas 
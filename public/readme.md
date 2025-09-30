# Frontend - Gestión Escolar

Este es el frontend del sistema de gestión escolar. Está desarrollado con HTML, CSS y JavaScript puro, y se comunica con la API construida en Express + PostgreSQL.

# Node
Node.js es un entorno de ejecución de JavaScript del lado del servidor.
Permite usar JavaScript no solo en el navegador, sino también para crear aplicaciones backend, servidores web y herramientas de línea de comandos.

El frontend permite a los usuarios interactuar de forma sencilla con la base de datos a través de formularios y vistas dinámicas.
Archivos principales

# index.html

Página de inicio que centraliza todas las funciones principales.
Incluye formularios para:
Iniciar sesión (login)
Registrar un nuevo estudiante.
Actualizar datos de un estudiante.
Eliminar un estudiante.
Tiene un menú de enlaces que permite alternar entre los distintos formularios.
Se conecta con app.js para manejar las solicitudes al backend.

# app.js

Contiene la lógica en JavaScript para manejar los formularios de index.html.
Define la URL base de la API (http://localhost:3000).
Funciones principales:
Login: valida credenciales y redirige al panel si son correctas.
Registro: envía los datos del estudiante al backend y confirma el alta.
Actualizar: permite modificar nombre, carrera o contraseña de un estudiante.
Eliminar: borra un estudiante de la base de datos a partir de su número de control o ID.

# avance.html

Permite consultar el avance académico de un estudiante.
El usuario ingresa el ID del estudiante y la página muestra las materias inscritas, sus créditos y el estado (aprobada, reprobada o en curso).
Usa una tabla para organizar la información.

# estudiantes.html

Lista todos los estudiantes registrados en la base de datos.
Por cada estudiante muestra:
ID.
Nombre.
Número de control.
Se actualiza automáticamente con la información recibida desde el backend.

# materias.html

Página para la gestión de materias.
Funcionalidades:
Agregar una nueva materia indicando su nombre y número de créditos.
Listar todas las materias registradas en la base de datos.

# Flujo de uso

El usuario abre index.html para iniciar sesión o registrarse.
Si el login es exitoso, se redirige a otras páginas como avance.html, materias.html o estudiantes.html.
Cada página hace peticiones HTTP a la API usando fetch(), que devuelve los resultados en formato JSON.
El frontend muestra los datos en formularios, listas o tablas según corresponda.

# Tecnologías usadas

HTML5 → estructura de las páginas.
CSS3 → estilos y diseño responsivo.
JavaScript (fetch API) → comunicación con el backend y manejo dinámico de la interfaz.
Backend en Express + PostgreSQL (necesario para que el frontend funcione).

# Como corro mi servidor Frontend?

Primero nos ubicamos en la carpeta /public con el comando "cd public" en nuestra terminal 
cuando estemos en esa carpeta ahora si ejecutamos "npx serve ."
¿Qué hace npx serve .?

npx → es una herramienta de Node.js que te permite ejecutar paquetes de npm sin instalarlos globalmente.

# Carpetas y archivos explicados

-app.js: Logica del cliente, esta es la que hace las peticiones al backend
-avance.html: donde los usuarios veran su avance reticular
-directivo.html: es para subir datos de estudiantes o actualizar
-estudiantes.html: pagina para estudiantes
-index.html: login de nuestra pagina web
-estilos.css: estilos de login
-styles.css: estilos de pagina logeada

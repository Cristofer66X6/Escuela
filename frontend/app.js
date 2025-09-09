// Cambia esto a tu backend en Render cuando lo subas
const API_URL = "http://localhost:3000/estudiantes";

// Cargar estudiantes de la BD
async function cargarEstudiantes() {
  const res = await fetch(API_URL);
  const data = await res.json();

  const lista = document.getElementById("lista-estudiantes");
  lista.innerHTML = "";

  data.forEach(e => {
    const li = document.createElement("li");
    li.textContent = `${e.nombre} (${e.numero_control}) - ${e.carrera}, Semestre: ${e.semestre}`;
    lista.appendChild(li);
  });
}

// Enviar estudiante nuevo al backend
document.getElementById("form-estudiante").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const carrera = document.getElementById("carrera").value;
  const numero_control = document.getElementById("numero_control").value;
  const periodo_inicio = document.getElementById("periodo_inicio").value;
  const semestre = document.getElementById("semestre").value;

  await fetch(API_URL, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ nombre, carrera, numero_control, periodo_inicio, semestre })
  });

  cargarEstudiantes(); // refresca la lista
  e.target.reset(); // limpia el formulario
});

// Inicial: carga estudiantes al abrir la página
cargarEstudiantes();

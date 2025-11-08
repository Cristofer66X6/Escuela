const numero_control = localStorage.getItem("numero_control");

// Cargar talleres ya inscritos por el alumno
async function cargarTalleresAlumno() {
  const res = await fetch(`http://localhost:3000/extraescolares/alumno/${numero_control}`);
  const data = await res.json();

  const tabla = document.getElementById("lista-talleres");
  tabla.innerHTML = "";

  data.forEach(t => {
    tabla.innerHTML += `
      <tr>
        <td>${t.taller}</td>
        <td>${t.estado}</td>
      </tr>
    `;
  });
}

// Cargar catálogo de talleres disponibles
async function cargarCatalogo() {
  const res = await fetch(`http://localhost:3000/extraescolares/talleres`);
  const lista = await res.json();

  const select = document.getElementById("select-taller");
  select.innerHTML = lista.map(t => `<option value="${t.id}">${t.taller}</option>`).join("");
}

// Registrar alumno en un taller
document.getElementById("form-taller").addEventListener("submit", async (e) => {
  e.preventDefault();
  const tallerID = document.getElementById("select-taller").value;

  await fetch(`http://localhost:3000/extraescolares/registrar-alumno`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ numero_control, tallerID })
  });

  cargarTalleresAlumno();
});

cargarCatalogo();
cargarTalleresAlumno();

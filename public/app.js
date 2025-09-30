const API = "http://localhost:3000";
// LOGIN
document.getElementById("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  const numero_control = document.getElementById("login-numero").value;
  const contrasena = document.getElementById("login-pass").value;

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ numero_control, contrasena })
  });

  const data = await res.json();
  alert(data.message || data.error);

  if (data.user) {
    // Redirigir al panel de estudiantes
    window.location.href = "estudiantes.html";
  }
});
// REGISTRO
document.getElementById("form-register").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("reg-nombre").value;
  const carrera = document.getElementById("reg-carrera").value;
  const numero_control = document.getElementById("reg-numero").value;
  const periodo_inicio = document.getElementById("reg-periodo").value;
  const semestre = document.getElementById("reg-semestre").value;
  const contrasena = document.getElementById("reg-pass").value;

  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ nombre, carrera, numero_control, periodo_inicio, semestre, contrasena })
  });

  const data = await res.json();
  alert("Usuario registrado: " + JSON.stringify(data));
});
// ACTUALIZAR
document.getElementById("form-update").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("upd-id").value;
  const nombre = document.getElementById("upd-nombre").value;
  const carrera = document.getElementById("upd-carrera").value;
  const contrasena = document.getElementById("upd-pass").value;

  const res = await fetch(`${API}/usuario/${id}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ nombre, carrera, contrasena })
  });

  const data = await res.json();
  alert("Usuario actualizado: " + JSON.stringify(data));
});
// ELIMINAR
document.getElementById("form-delete").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("del-id").value;

  const res = await fetch(`${API}/usuario/${id}`, { method: "DELETE" });
  const data = await res.json();
  alert(data.message);
});

const API = "http://localhost:3000";

// -------------------- MOSTRAR FORMULARIOS --------------------
function mostrarForm(id) {
  document.querySelectorAll("form").forEach(f => f.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// -------------------- LOGIN --------------------
document.getElementById("form-login")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const numero_control = document.getElementById("login-numero").value;
  const contrasena = document.getElementById("login-pass").value;

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero_control, contrasena })
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("numero_control", numero_control);
      alert("✅ Login exitoso");

      // Redirigir
      window.location.href = "estudiantes.html";
    } else {
      alert("❌ " + (data.error || "Error en el login"));
    }
  } catch (err) {
    console.error(err);
    alert("❌ Error conectando con el servidor");
  }
});

// -------------------- REGISTRO --------------------
document.getElementById("form-register")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("reg-nombre").value;
  const carrera = document.getElementById("reg-carrera").value;
  const numero_control = document.getElementById("reg-numero").value;
  const periodo_inicio = document.getElementById("reg-periodo").value;
  const semestre = document.getElementById("reg-semestre").value;
  const contrasena = document.getElementById("reg-pass").value;

  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, carrera, numero_control, periodo_inicio, semestre, contrasena })
    });
    const data = await res.json();

    if (res.ok) {
      alert("✅ Usuario registrado correctamente");
      document.getElementById("form-register").reset();
      window.location.href = "index.html";
    } else {
      alert("❌ " + (data.error || "Error al registrar usuario"));
    }
  } catch (err) {
    console.error(err);
    alert("❌ Error conectando con el servidor");
  }
});

// -------------------- CARGAR DATOS --------------------
async function cargarDatosEstudiante() {
  const numero_control = localStorage.getItem("numero_control");
  if (!numero_control) {
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch(`${API}/estudiante/${numero_control}`);
    const data = await res.json();
    if (data.error) {
      alert("❌ " + data.error);
      window.location.href = "index.html";
      return;
    }

    document.getElementById("nombre").textContent = data.nombre;
    document.getElementById("carrera").textContent = data.carrera;
    document.getElementById("semestre").textContent = data.semestre;
    document.getElementById("periodo").textContent = data.periodo_inicio;
  } catch (err) {
    console.error(err);
    alert("❌ Error cargando datos del estudiante");
  }
}

if (document.getElementById("nombre")) cargarDatosEstudiante();

// -------------------- ACTUALIZAR --------------------
document.getElementById("form-update")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const numero_control = localStorage.getItem("numero_control");
  const nombre = document.getElementById("upd-nombre").value;
  const carrera = document.getElementById("upd-carrera").value;
  const contrasena = document.getElementById("upd-pass").value;

  try {
    const res = await fetch(`${API}/usuario/${numero_control}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, carrera, contrasena })
    });
    const data = await res.json();

    if (res.ok) {
      alert("✅ Usuario actualizado correctamente");
      document.getElementById("form-update").reset();
      cargarDatosEstudiante();
    } else {
      alert("❌ " + (data.error || "Error al actualizar usuario"));
    }
  } catch (err) {
    console.error(err);
    alert("❌ Error conectando con el servidor");
  }
});

// -------------------- ELIMINAR --------------------
document.getElementById("form-delete")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const numero_control = localStorage.getItem("numero_control");

  if (!confirm("¿Estás seguro de eliminar tu usuario?")) return;

  try {
    const res = await fetch(`${API}/usuario/${numero_control}`, { method: "DELETE" });
    const data = await res.json();

    if (res.ok) {
      alert("✅ " + data.message);
      localStorage.clear();
      window.location.href = "index.html";
    } else {
      alert("❌ " + (data.error || "Error al eliminar usuario"));
    }
  } catch (err) {
    console.error(err);
    alert("❌ Error conectando con el servidor");
  }
});

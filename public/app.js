const API = "http://localhost:3000";

// ===================== MOSTRAR FORMULARIOS (versión para admin.html) =====================
function mostrarForm(id) {
  document.querySelectorAll(".form-card").forEach(f => f.classList.add("oculto"));
  document.getElementById(id).classList.remove("oculto");
  document.getElementById(id).scrollIntoView({ behavior: "smooth", block: "center" });
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
      body: JSON.stringify({ numero_control, contrasena }),
      credentials: "include"
    });

    const data = await res.json();

    if (res.ok) {
      sessionStorage.clear();
      sessionStorage.setItem("token", data.accessToken);
      sessionStorage.setItem("numero_control", data.user.numero_control);
      sessionStorage.setItem("rol", data.user.rol);
      sessionStorage.setItem("nombre", data.user.nombre);

      alert("Login exitoso");

      if (data.user.rol === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "estudiantes.html";
      }

    } else {
      alert("❌ " + (data.error || "Error en el login"));
    }
  } catch (err) {
    console.error(err);
    alert("❌ Error conectando con el servidor");
  }
});

// ======================
// AGREGAR USUARIO
// ======================
document.getElementById("form-agregar")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("add-nombre").value;
  const carrera = document.getElementById("add-carrera").value;
  const numero = document.getElementById("add-numero").value;
  const password = document.getElementById("add-pass").value;
  const rol = document.getElementById("add-rol").value;
  const token = sessionStorage.getItem("token");

  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ nombre, carrera, numero_control: numero, contrasena: password, rol })

    });

    const data = await res.json();
    if (res.ok) {
      alert("Usuario agregado correctamente");
      e.target.reset();
    } else {
      alert("❌ Error: " + data.message);
    }
  } catch (err) {
    console.error(err);
  }
});

// ======================
// ACTUALIZAR USUARIO
// ======================
document.getElementById("form-actualizar")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const numero = document.getElementById("upd-numero").value;
  const nombre = document.getElementById("upd-nombre").value;
  const carrera = document.getElementById("upd-carrera").value;
  const contrasena = document.getElementById("upd-pass").value;
  const token = sessionStorage.getItem("token");

  try {
    const res = await fetch(`${API}/usuario/${numero}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ nombre, carrera, contrasena })
    });

    const data = await res.json();
    if (res.ok) {
      alert("Usuario actualizado correctamente");
      e.target.reset();
    } else {
      alert("❌ Error: " + (data.message || data.error));
    }
  } catch (err) {
    console.error(err);
  }
});

// ======================
// ELIMINAR USUARIO
// ======================
document.getElementById("form-eliminar")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const numero = document.getElementById("del-numero").value;
  const token = sessionStorage.getItem("token");

  if (!confirm(`¿Seguro que deseas eliminar al usuario con número ${numero}?`)) return;

  try {
    const res = await fetch(`${API}/usuario/${numero}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();
    if (res.ok) {
      alert("🗑️ Usuario eliminado correctamente");
      e.target.reset();
    } else {
      alert("❌ Error: " + data.message);
    }
  } catch (err) {
    console.error(err);
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
  const rol = document.getElementById("reg-rol") ? document.getElementById("reg-rol").value : "user";

  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, carrera, numero_control, periodo_inicio, semestre, contrasena, rol })
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

// ===================== VERIFICAR SESIÓN (JWT) =====================
async function verificarSesion(rolRequerido) {
  const token = sessionStorage.getItem("token");
  if (!token) {
    alert("⚠️ Debes iniciar sesión primero");
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch(`${API}/verify`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();

    if (!res.ok || !data.user || (rolRequerido && data.user.rol !== rolRequerido)) {
      alert("❌ No tienes permiso para acceder a esta página");
      sessionStorage.clear();
      window.location.href = "index.html";
      return;
    }

    return data.user;

  } catch (err) {
    console.error("Error verificando sesión:", err);
    alert("❌ Error verificando sesión");
    sessionStorage.clear();
    window.location.href = "index.html";
  }
}

// ===================== CARGAR DATOS DEL ADMIN =====================
if (window.location.pathname.includes("admin.html")) {
  document.addEventListener("DOMContentLoaded", async () => {
    const user = await verificarSesion("admin");
    if (!user) return;

    document.getElementById("admin-nombre").textContent = user.nombre || "Administrador";
    document.getElementById("ultimo-acceso").textContent = new Date().toLocaleString();
  });
}

// -------------------- CARGAR DATOS ESTUDIANTE --------------------
async function cargarDatosEstudiante() {
  const numero_control = sessionStorage.getItem("numero_control");
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

async function cargarMateriasParaInscribir() {
  try {
    const res = await fetch(`${API}/materias`);
    const materias = await res.json();
    const select = document.getElementById("ins-materia");
    if (!select) return;

    select.innerHTML = "";
    materias.forEach(m => {
      const option = document.createElement("option");
      option.value = m.id;
      option.textContent = `${m.nombre} (${m.creditos} créditos)`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Error cargando materias:", err);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  cargarMateriasParaInscribir();
  cargarMateriasInscritas();
});

if (document.getElementById("nombre")) cargarDatosEstudiante();

// ==========================
//  MATERIAS: AGREGAR Y LISTAR
// ==========================
document.getElementById("materia-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("materia-nombre").value;
  const creditos = document.getElementById("materia-creditos").value;
  const token = sessionStorage.getItem("token");

  try {
    const res = await fetch(`${API}/materias`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ nombre, creditos })
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Materia agregada correctamente");
      document.getElementById("materia-form").reset();
      obtenerMaterias();
    } else {
      alert("❌ Error al agregar materia: " + (data.error || "Desconocido"));
    }
  } catch (err) {
    console.error(err);
    alert("⚠️ Error al conectar con el servidor");
  }
});

async function obtenerMaterias() {
  try {
    const res = await fetch(`${API}/materias`);
    const materias = await res.json();
    const lista = document.getElementById("lista-materias");
    if (!lista) return;

    lista.innerHTML = "";
    materias.forEach(m => {
      const li = document.createElement("li");
      li.textContent = `${m.nombre} (${m.creditos} créditos)`;
      lista.appendChild(li);
    });
  } catch (err) {
    console.error("Error al obtener materias:", err);
  }
}

async function cargarMateriasInscritas() {
  const numero_control = sessionStorage.getItem("numero_control");
  if (!numero_control) return;

  try {
    const res = await fetch(`${API}/avance/${numero_control}`);
    const data = await res.json();
    const tabla = document.getElementById("contenido-avance");

    tabla.innerHTML = "";

    data.forEach(m => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${m.nombre}</td>
        <td>${m.creditos}</td>
        <td>${m.estado}</td>
      `;
      tabla.appendChild(fila);
    });

  } catch (err) {
    console.error("Error cargando materias del avance", err);
  }
}

async function cargarSelectMaterias() {
  const res = await fetch(`${API}/materias`);
  const materias = await res.json();
  const select = document.getElementById("ins-materia");
  select.innerHTML = materias.map(m => `<option value="${m.id}">${m.nombre}</option>`).join("");
}

document.getElementById("form-inscribir")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const numero_control = sessionStorage.getItem("numero_control");
  const id_materia = document.getElementById("ins-materia").value;

  const res = await fetch(`${API}/avance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ numero_control, id_materia })
  });

  const data = await res.json();
  alert(data.message || data.error);
  cargarMateriasInscritas();
});

async function cargarMateriasAdmin() {
  const res = await fetch(`${API}/materias`);
  const materias = await res.json();
  const lista = document.getElementById("lista-materias-admin");
  if (!lista) return;
  lista.innerHTML = materias.map(m => `
    <tr>
      <td>${m.id}</td>
      <td>${m.nombre}</td>
      <td>${m.creditos}</td>
    </tr>
  `).join("");
}

if (document.getElementById("form-materia-admin")) {
  document.getElementById("form-materia-admin").addEventListener("submit", async e => {
    e.preventDefault();
    const nombre = document.getElementById("materia-nombre").value;
    const creditos = document.getElementById("materia-creditos").value;

    await fetch(`${API}/materias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, creditos })
    });

    cargarMateriasAdmin();
  });

  cargarMateriasAdmin();
}

if (document.getElementById("nombre")) {
  cargarDatosEstudiante();
  cargarMateriasInscritas();
  cargarSelectMaterias();
}

// ===================== LOGOUT =====================
document.getElementById("btn-logout")?.addEventListener("click", async () => {
  try {
    await fetch(`${API}/logout`, {
      method: "POST",
      credentials: "include"
    });

    sessionStorage.clear();
    window.location.href = "index.html";
  } catch (err) {
    console.error(err);
  }
});

// ===================== ACTUALIZAR ESTADO MATERIA =====================
document.getElementById("form-actualizar-estado")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const numeroControl = document.getElementById("est-control").value;
  const idMateria = document.getElementById("est-materia").value;
  const nuevoEstado = document.getElementById("est-estado").value;

  const res = await fetch(`${API}/admin/actualizar-estado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ numeroControl, idMateria, nuevoEstado })
  });

  const data = await res.json();
  alert(data.mensaje);
});

// Ejecutar cuando cargue
window.addEventListener("DOMContentLoaded", obtenerMaterias);

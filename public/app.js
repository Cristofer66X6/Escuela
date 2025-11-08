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
      credentials: "include" // ✅ necesario para recibir la cookie del refresh token
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.clear();
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("numero_control", data.user.numero_control);
      localStorage.setItem("rol", data.user.rol);
      localStorage.setItem("nombre", data.user.nombre); // ✅ aquí

      alert("✅ Login exitoso");

      // Redirige según el rol
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
  const token = localStorage.getItem("token");

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
      alert("✅ Usuario agregado correctamente");
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
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API}/usuario/${numero}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      // 🔹 Cambiado 'password' → 'contrasena'
      body: JSON.stringify({ nombre, carrera, contrasena })
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ Usuario actualizado correctamente");
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
  const token = localStorage.getItem("token");
  if (!confirm(`¿Seguro que deseas eliminar al usuario con número ${numero}?`)) return;

  try {
    const res = await fetch(`${API}/usuario/${numero}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
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
  const token = localStorage.getItem("token");
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

    // Token inválido o rol no autorizado
    if (!res.ok || !data.user || (rolRequerido && data.user.rol !== rolRequerido)) {
      alert("❌ No tienes permiso para acceder a esta página");
      localStorage.clear();
      window.location.href = "index.html";
      return;
    }

    // Si pasa la verificación, devolvemos el usuario
    return data.user;

  } catch (err) {
    console.error("Error verificando sesión:", err);
    alert("❌ Error verificando sesión");
    localStorage.clear();
    window.location.href = "index.html";
  }
}
// ===================== CARGAR DATOS DEL ADMIN =====================
if (window.location.pathname.includes("admin.html")) {
  document.addEventListener("DOMContentLoaded", async () => {
    const user = await verificarSesion("admin");
    if (!user) return;

    // Mostrar nombre del admin
    document.getElementById("admin-nombre").textContent = user.nombre || "Administrador";
    document.getElementById("ultimo-acceso").textContent = new Date().toLocaleString();
  });
}
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
/*
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
// -------------------- PAGO --------------------
document.getElementById("form-pago")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const numero_control = localStorage.getItem("numero_control");
  const tipo = document.getElementById("tipo").value;
  const monto = document.getElementById("monto").value;

  try {
    const res = await fetch(`${API}/crear-pago`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero_control, tipo, monto })
    });

    const data = await res.json();

    if (res.ok) {
      // Redirigir al checkout de Stripe
      window.location.href = data.url;
    } else {
      alert("❌ " + (data.error || "Error al crear el pago"));
    }
  } catch (err) {
    console.error(err);
    alert("❌ Error conectando con el servidor");
  }
});

*/

// ==========================
//  MATERIAS: AGREGAR Y LISTAR
// ==========================

document.getElementById("materia-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("materia-nombre").value;
  const creditos = document.getElementById("materia-creditos").value;
  const token = localStorage.getItem("token");

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
      obtenerMaterias(); // refresca la lista
    } else {
      alert("❌ Error al agregar materia: " + (data.error || "Desconocido"));
    }
  } catch (err) {
    console.error(err);
    alert("⚠️ Error al conectar con el servidor");
  }
});

// Función para listar materias
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

// Ejecutar cuando se cargue la página
window.addEventListener("DOMContentLoaded", obtenerMaterias);

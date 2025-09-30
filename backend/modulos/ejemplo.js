export function saludar(nombre) {
  return `Hola ${nombre}, bienvenido al sistema escolar 👋`;
}

export function obtenerFecha() {
  const fecha = new Date();
  return fecha.toLocaleString("es-MX");
}

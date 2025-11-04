import pkg from "pg";
import dotenv from "dotenv";
// import path from "path";  

// 🔸 Desactivar carga por ambiente, usar .env principal
// const envArg = process.argv[2];
// const envName = envArg || process.env.NODE_ENV || "sandbox";
// dotenv.config({ path: path.resolve(process.cwd(), `.env.${envName}`) });

dotenv.config(); // ✅ carga el archivo .env principal automáticamente

const { Pool } = pkg;

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD, typeof process.env.DB_PASSWORD);
console.log("DB_PORT:", process.env.DB_PORT, typeof process.env.DB_PORT);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD), // 👈 aseguramos que sea string
  port: parseInt(process.env.DB_PORT),
});

export default pool;

import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();



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
  password: process.env.DB_PASSWORD, // ✅ siempre string
  port: process.env.DB_PORT,
});

dotenv.config();
export default pool;

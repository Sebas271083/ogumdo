import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  // Las fechas viajan como "YYYY-MM-DD": si mysql2 las convierte a Date, el huso horario
  // corre los cumpleaños y exámenes un día para atrás.
  dateStrings: true,
});

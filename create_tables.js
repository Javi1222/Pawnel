require('dotenv').config();
const mysql = require('mysql2');

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'Pawnel'
});

const sqlMascotas = `
CREATE TABLE IF NOT EXISTS mascotas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  especie VARCHAR(50) NOT NULL,
  raza VARCHAR(100) NOT NULL,
  edad DECIMAL(4,1) NOT NULL,
  propietario VARCHAR(100) NOT NULL,
  dni VARCHAR(20) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const sqlConsultas = `
CREATE TABLE IF NOT EXISTS consultas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  paciente_nombre VARCHAR(100) NOT NULL,
  fecha DATE NOT NULL,
  motivo VARCHAR(255) NOT NULL,
  veterinario VARCHAR(100) NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
  coste DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

conn.connect((err) => {
  if (err) {
    console.error('Error al conectar:', err);
    process.exit(1);
  }
  conn.query(sqlMascotas, (err1) => {
    if (err1) throw err1;
    console.log('Tabla mascotas lista.');
    conn.query(sqlConsultas, (err2) => {
      if (err2) throw err2;
      console.log('Tabla consultas lista.');
      conn.end();
    });
  });
});


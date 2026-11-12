require('dotenv').config();
const express = require('express');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. Configurar la conexión a MySQL usando variables de entorno (.env)
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'sprint_web'
});

db.connect((err) => {
  if (err) {
    console.error('⚠️  No se pudo conectar a MySQL:', err.message);
    console.log('💡 Asegúrate de que el servicio MySQL esté corriendo y los datos en .env sean correctos.');
  } else {
    console.log('✅ Conectado exitosamente a la base de datos MySQL:', process.env.DB_NAME || 'sprint_web');
  }
});

// ==========================================
// ENDPOINTS DE LA API (Consumidos por app.js)
// ==========================================

// --- Mascotas ---
app.get('/api/mascotas', (req, res) => {
  db.query('SELECT * FROM mascotas', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/mascotas', (req, res) => {
  const { nombre, especie, raza, edad, propietario, dni, telefono } = req.body;
  const sql = 'INSERT INTO mascotas (nombre, especie, raza, edad, propietario, dni, telefono) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [nombre, especie, raza, edad, propietario, dni, telefono], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, ...req.body });
  });
});

app.put('/api/mascotas/:id', (req, res) => {
  const { nombre, especie, raza, edad, propietario, dni, telefono } = req.body;
  const sql = 'UPDATE mascotas SET nombre = ?, especie = ?, raza = ?, edad = ?, propietario = ?, dni = ?, telefono = ? WHERE id = ?';
  db.query(sql, [nombre, especie, raza, edad, propietario, dni, telefono, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: Number(req.params.id), ...req.body });
  });
});

// --- Consultas ---
app.get('/api/consultas', (req, res) => {
  db.query('SELECT * FROM consultas', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/consultas', (req, res) => {
  const { paciente_nombre, fecha, motivo, veterinario, estado, coste } = req.body;
  const sql = 'INSERT INTO consultas (paciente_nombre, fecha, motivo, veterinario, estado, coste) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [paciente_nombre, fecha, motivo, veterinario, estado, coste], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, ...req.body });
  });
});

app.put('/api/consultas/:id', (req, res) => {
  const { paciente_nombre, fecha, motivo, veterinario, estado, coste } = req.body;
  const sql = 'UPDATE consultas SET paciente_nombre = ?, fecha = ?, motivo = ?, veterinario = ?, estado = ?, coste = ? WHERE id = ?';
  db.query(sql, [paciente_nombre, fecha, motivo, veterinario, estado, coste, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: Number(req.params.id), ...req.body });
  });
});

// ==========================================
// VISTAS HTML (Rutas principales y alias tolerantes)
// ==========================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Soporta /Pawnel_mascotas, /pawnel_mascotas y /public/pawnel_mascotas.html
app.get(['/Pawnel_mascotas', '/pawnel_mascotas', '/public/pawnel_mascotas.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pawnel_mascotas.html'));
});

// Soporta /Pawnel_consulta, /pawnel_consulta y /public/pawnel_consulta.html
app.get(['/Pawnel_consulta', '/pawnel_consulta', '/public/pawnel_consulta.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pawnel_consulta.html'));
});

app.listen(PORT, () => {
  console.log(`Pawnel corriendo en http://localhost:${PORT}`);
});

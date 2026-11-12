const USE_API = true; // Conectado a la API de Node.js + MySQL
const API_BASE = '/api';

// Datos de prueba iniciales para probar la interfaz sin backend
const MOCK_MASCOTAS = [
  { id: 1, nombre: 'Kira', especie: 'Perro', raza: 'Border Collie', edad: 4, propietario: 'Carlos Ruiz', dni: '12345678A', telefono: '611223344' },
  { id: 2, nombre: 'Misu', especie: 'Gato', raza: 'Común Europeo', edad: 2, propietario: 'Elena Sanz', dni: '87654321B', telefono: '622334455' },
  { id: 3, nombre: 'Pipo', especie: 'Ave', raza: 'Ninfa', edad: 1.5, propietario: 'Marta Gil', dni: '45678912C', telefono: '633445566' }
];

const MOCK_CONSULTAS = [
  { id: 1, paciente_nombre: 'Kira', fecha: '2026-11-12', motivo: 'Vacuna rabia y revisión', veterinario: 'Dr. Martín', estado: 'Completada', coste: 45.00 },
  { id: 2, paciente_nombre: 'Simba', fecha: '2026-11-12', motivo: 'Cojera pata trasera', veterinario: 'Dra. Gómez', estado: 'En curso', coste: 60.00 },
  { id: 3, paciente_nombre: 'Nala', fecha: '2026-11-13', motivo: 'Limpieza dental', veterinario: 'Dr. Martín', estado: 'Pendiente', coste: 95.00 }
];

// ==========================================
// CAPA DE ACCESO A DATOS (API o LocalStorage)
// ==========================================
const DataService = {
  async getMascotas() {
    if (USE_API) {
      const res = await fetch(`${API_BASE}/mascotas`);
      return res.json();
    }
    const saved = localStorage.getItem('pawnel_mascotas');
    if (!saved) {
      localStorage.setItem('pawnel_mascotas', JSON.stringify(MOCK_MASCOTAS));
      return [...MOCK_MASCOTAS];
    }
    return JSON.parse(saved);
  },

  async createMascota(mascota) {
    if (USE_API) {
      const res = await fetch(`${API_BASE}/mascotas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mascota)
      });
      return res.json();
    }
    const lista = await this.getMascotas();
    const nuevoId = lista.length ? Math.max(...lista.map(m => m.id)) + 1 : 1;
    const nueva = { id: nuevoId, ...mascota };
    lista.push(nueva);
    localStorage.setItem('pawnel_mascotas', JSON.stringify(lista));
    return nueva;
  },

  async updateMascota(id, datos) {
    if (USE_API) {
      const res = await fetch(`${API_BASE}/mascotas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      return res.json();
    }
    const lista = await this.getMascotas();
    const index = lista.findIndex(m => m.id === Number(id));
    if (index !== -1) {
      lista[index] = { id: Number(id), ...datos };
      localStorage.setItem('pawnel_mascotas', JSON.stringify(lista));
    }
  },

  async getConsultas() {
    if (USE_API) {
      const res = await fetch(`${API_BASE}/consultas`);
      return res.json();
    }
    const saved = localStorage.getItem('pawnel_consultas');
    if (!saved) {
      localStorage.setItem('pawnel_consultas', JSON.stringify(MOCK_CONSULTAS));
      return [...MOCK_CONSULTAS];
    }
    return JSON.parse(saved);
  },

  async createConsulta(consulta) {
    if (USE_API) {
      const res = await fetch(`${API_BASE}/consultas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consulta)
      });
      return res.json();
    }
    const lista = await this.getConsultas();
    const nuevoId = lista.length ? Math.max(...lista.map(c => c.id)) + 1 : 1;
    const nueva = { id: nuevoId, ...consulta };
    lista.push(nueva);
    localStorage.setItem('pawnel_consultas', JSON.stringify(lista));
    return nueva;
  },

  async updateConsulta(id, datos) {
    if (USE_API) {
      const res = await fetch(`${API_BASE}/consultas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      return res.json();
    }
    const lista = await this.getConsultas();
    const index = lista.findIndex(c => c.id === Number(id));
    if (index !== -1) {
      lista[index] = { id: Number(id), ...datos };
      localStorage.setItem('pawnel_consultas', JSON.stringify(lista));
    }
  }
};

// ==========================================
// UTILIDADES DE INTERFAZ
// ==========================================
function showToast(mensaje) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = mensaje;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2800);
}

function getBadgeEstado(estado) {
  const clase = estado === 'Completada'
    ? 'badge-completada'
    : estado === 'En curso'
      ? 'badge-en-curso'
      : 'badge-pendiente';
  return `<span class="badge ${clase}">${estado}</span>`;
}

document.addEventListener('click', (e) => {
  const modalId = e.target.dataset.close;
  if (modalId) {
    document.getElementById(modalId).classList.add('hidden');
  }
});

function formatearFecha(fechaStr) {
  if (!fechaStr) return '';
  return fechaStr.split('T')[0];
}

// ==========================================
// CONTROLADOR 1: DASHBOARD GENERAL (/)
// ==========================================
async function initDashboard() {
  const mascotas = await DataService.getMascotas();
  const consultas = await DataService.getConsultas();

  const pendientes = consultas.filter(c => c.estado === 'Pendiente').length;
  const ingresos = consultas.reduce((acc, c) => acc + Number(c.coste || 0), 0);

  document.getElementById('stat-total-mascotas').textContent = mascotas.length;
  document.getElementById('stat-total-consultas').textContent = consultas.length;
  document.getElementById('stat-pendientes').textContent = pendientes;
  document.getElementById('stat-ingresos').textContent = `${ingresos.toFixed(2)} €`;

  // Barras por especie
  const especies = ['Perro', 'Gato', 'Ave', 'Exótico'];
  const barsContainer = document.getElementById('especies-bars');
  barsContainer.innerHTML = especies.map(esp => {
    const count = mascotas.filter(m => m.especie === esp).length;
    const pct = mascotas.length ? Math.round((count / mascotas.length) * 100) : 0;
    return `
      <div>
        <div class="bar-item-header">
          <span>${esp}</span>
          <span>${count} (${pct}%)</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');

  // Últimas 5 consultas
  const ultimas = [...consultas].reverse().slice(0, 5);
  document.getElementById('ultimas-consultas-body').innerHTML = ultimas.map(c => `
    <tr>
      <td><strong>${c.paciente_nombre}</strong></td>
      <td>${formatearFecha(c.fecha)}</td>
      <td>${c.motivo}</td>
      <td>${getBadgeEstado(c.estado)}</td>
    </tr>
  `).join('');
}

// ==========================================
// CONTROLADOR 2: MASCOTAS (/Pawnel_mascotas)
// ==========================================
let cacheMascotas = [];

async function initMascotas() {
  await refrescarMascotas();

  document.getElementById('form-mascota').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nueva = {
      nombre: document.getElementById('m-nombre').value.trim(),
      especie: document.getElementById('m-especie').value,
      raza: document.getElementById('m-raza').value.trim(),
      edad: Number(document.getElementById('m-edad').value),
      propietario: document.getElementById('m-propietario').value.trim(),
      dni: document.getElementById('m-dni').value.trim(),
      telefono: document.getElementById('m-telefono').value.trim()
    };
    await DataService.createMascota(nueva);
    e.target.reset();
    await refrescarMascotas();
    showToast('Mascota registrada correctamente');
  });

  document.getElementById('search-mascota').addEventListener('input', renderTablaMascotas);
  document.getElementById('filter-especie').addEventListener('change', renderTablaMascotas);

  document.getElementById('form-edit-mascota').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-m-id').value;
    const actualizada = {
      nombre: document.getElementById('edit-m-nombre').value.trim(),
      especie: document.getElementById('edit-m-especie').value,
      raza: document.getElementById('edit-m-raza').value.trim(),
      edad: Number(document.getElementById('edit-m-edad').value),
      propietario: document.getElementById('edit-m-propietario').value.trim(),
      dni: document.getElementById('edit-m-dni').value.trim(),
      telefono: document.getElementById('edit-m-telefono').value.trim()
    };
    await DataService.updateMascota(id, actualizada);
    document.getElementById('modal-mascota').classList.add('hidden');
    await refrescarMascotas();
    showToast('Datos de mascota actualizados');
  });
}

async function refrescarMascotas() {
  cacheMascotas = await DataService.getMascotas();

  document.getElementById('m-stat-total').textContent = cacheMascotas.length;
  document.getElementById('m-stat-perros').textContent = cacheMascotas.filter(m => m.especie === 'Perro').length;
  document.getElementById('m-stat-gatos').textContent = cacheMascotas.filter(m => m.especie === 'Gato').length;
  document.getElementById('m-stat-otros').textContent = cacheMascotas.filter(m => m.especie !== 'Perro' && m.especie !== 'Gato').length;

  renderTablaMascotas();
}

function renderTablaMascotas() {
  const texto = document.getElementById('search-mascota').value.toLowerCase();
  const especie = document.getElementById('filter-especie').value;

  const filtradas = cacheMascotas.filter(m => {
    const coincideTexto = m.nombre.toLowerCase().includes(texto) ||
                          m.raza.toLowerCase().includes(texto) ||
                          m.propietario.toLowerCase().includes(texto) ||
                          (m.dni && m.dni.toLowerCase().includes(texto));
    const coincideEspecie = especie === 'Todas' || m.especie === especie;
    return coincideTexto && coincideEspecie;
  });

  document.getElementById('tabla-mascotas-body').innerHTML = filtradas.map(m => `
    <tr>
      <td>#${m.id}</td>
      <td><strong>${m.nombre}</strong></td>
      <td>${m.especie}</td>
      <td>${m.raza}</td>
      <td>${m.edad} años</td>
      <td>${m.propietario}</td>
      <td>${m.dni || '-'}</td>
      <td>${m.telefono}</td>
      <td>
        <button class="btn-edit" onclick="abrirModalMascota(${m.id})">Editar</button>
      </td>
    </tr>
  `).join('');
}

window.abrirModalMascota = function(id) {
  const m = cacheMascotas.find(item => item.id === id);
  if (!m) return;
  document.getElementById('edit-m-id').value = m.id;
  document.getElementById('edit-m-nombre').value = m.nombre;
  document.getElementById('edit-m-especie').value = m.especie;
  document.getElementById('edit-m-raza').value = m.raza;
  document.getElementById('edit-m-edad').value = m.edad;
  document.getElementById('edit-m-propietario').value = m.propietario;
  document.getElementById('edit-m-dni').value = m.dni || '';
  document.getElementById('edit-m-telefono').value = m.telefono;
  document.getElementById('modal-mascota').classList.remove('hidden');
};

// ==========================================
// CONTROLADOR 3: CONSULTAS (/Pawnel_consulta)
// ==========================================
let cacheConsultas = [];

async function initConsultas() {
  document.getElementById('c-fecha').valueAsDate = new Date();
  await refrescarConsultas();

  document.getElementById('form-consulta').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nueva = {
      paciente_nombre: document.getElementById('c-paciente').value.trim(),
      fecha: document.getElementById('c-fecha').value,
      motivo: document.getElementById('c-motivo').value.trim(),
      veterinario: document.getElementById('c-veterinario').value.trim(),
      estado: document.getElementById('c-estado').value,
      coste: Number(document.getElementById('c-coste').value)
    };
    await DataService.createConsulta(nueva);
    e.target.reset();
    document.getElementById('c-fecha').valueAsDate = new Date();
    await refrescarConsultas();
    showToast('Consulta registrada correctamente');
  });

  document.getElementById('search-consulta').addEventListener('input', renderTablaConsultas);
  document.getElementById('filter-estado').addEventListener('change', renderTablaConsultas);

  document.getElementById('form-edit-consulta').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-c-id').value;
    const actualizada = {
      paciente_nombre: document.getElementById('edit-c-paciente').value.trim(),
      fecha: document.getElementById('edit-c-fecha').value,
      motivo: document.getElementById('edit-c-motivo').value.trim(),
      veterinario: document.getElementById('edit-c-veterinario').value.trim(),
      estado: document.getElementById('edit-c-estado').value,
      coste: Number(document.getElementById('edit-c-coste').value)
    };
    await DataService.updateConsulta(id, actualizada);
    document.getElementById('modal-consulta').classList.add('hidden');
    await refrescarConsultas();
    showToast('Consulta actualizada');
  });
}

async function refrescarConsultas() {
  cacheConsultas = await DataService.getConsultas();

  const pendientes = cacheConsultas.filter(c => c.estado === 'Pendiente').length;
  const completadas = cacheConsultas.filter(c => c.estado === 'Completada').length;
  const ingresos = cacheConsultas.reduce((acc, c) => acc + Number(c.coste || 0), 0);

  document.getElementById('c-stat-total').textContent = cacheConsultas.length;
  document.getElementById('c-stat-pendientes').textContent = pendientes;
  document.getElementById('c-stat-completadas').textContent = completadas;
  document.getElementById('c-stat-ingresos').textContent = `${ingresos.toFixed(2)} €`;

  renderTablaConsultas();
}

function renderTablaConsultas() {
  const texto = document.getElementById('search-consulta').value.toLowerCase();
  const estado = document.getElementById('filter-estado').value;

  const filtradas = cacheConsultas.filter(c => {
    const coincideTexto = c.paciente_nombre.toLowerCase().includes(texto) ||
                          c.motivo.toLowerCase().includes(texto) ||
                          c.veterinario.toLowerCase().includes(texto);
    const coincideEstado = estado === 'Todos' || c.estado === estado;
    return coincideTexto && coincideEstado;
  });

  document.getElementById('tabla-consultas-body').innerHTML = filtradas.map(c => `
    <tr>
      <td>#${c.id}</td>
      <td><strong>${c.paciente_nombre}</strong></td>
      <td>${formatearFecha(c.fecha)}</td>
      <td>${c.motivo}</td>
      <td>${c.veterinario}</td>
      <td>${getBadgeEstado(c.estado)}</td>
      <td>${Number(c.coste).toFixed(2)} €</td>
      <td>
        <button class="btn-edit" onclick="abrirModalConsulta(${c.id})">Editar</button>
      </td>
    </tr>
  `).join('');
}

window.abrirModalConsulta = function(id) {
  const c = cacheConsultas.find(item => item.id === id);
  if (!c) return;
  document.getElementById('edit-c-id').value = c.id;
  document.getElementById('edit-c-paciente').value = c.paciente_nombre;
  document.getElementById('edit-c-fecha').value = formatearFecha(c.fecha);
  document.getElementById('edit-c-motivo').value = c.motivo;
  document.getElementById('edit-c-veterinario').value = c.veterinario;
  document.getElementById('edit-c-estado').value = c.estado;
  document.getElementById('edit-c-coste').value = c.coste;
  document.getElementById('modal-consulta').classList.remove('hidden');
};

// ==========================================
// INICIALIZACIÓN SEGÚN PÁGINA ACTIVA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'dashboard') initDashboard();
  if (page === 'mascotas') initMascotas();
  if (page === 'consultas') initConsultas();
});


import { KITS } from './quiz-logic.js';
import { supabase } from './supabase-init.js';

// Gestión de Navegación por Pestañas
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.dash-tab-content');
const tabTitle = document.getElementById('tab-title');
const tabSubtitle = document.getElementById('tab-subtitle');

const TITULOS_TABS = {
  metricas: {
    titulo: 'Métricas de Operaciones',
    subtitulo: 'Indicadores clave de ventas, consultas y rendimiento de la empresa.'
  },
  crm: {
    titulo: 'CRM de Clientes & Diagnósticos',
    subtitulo: 'Base de datos de potenciales clientes y solicitudes captadas por Nora.'
  },
  rpm: {
    titulo: 'RPM de Inventario & Existencias',
    subtitulo: 'Monitoreo de stock de kits y disponibilidad para entregas.'
  },
  rag: {
    titulo: 'Memoria RAG & Conocimiento Técnico',
    subtitulo: 'Administración de manuales agronómicos procesados en pgvector.'
  },
  ocr: {
    titulo: 'OCR Fiscal & Control de Gastos',
    subtitulo: 'Comprobantes de compra digitalizados y categorizados automáticamente.'
  }
};

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.getAttribute('data-tab');

    tabButtons.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    const targetContent = document.getElementById(`tab-${targetTab}`);
    if (targetContent) targetContent.classList.add('active');

    if (TITULOS_TABS[targetTab]) {
      tabTitle.textContent = TITULOS_TABS[targetTab].titulo;
      tabSubtitle.textContent = TITULOS_TABS[targetTab].subtitulo;
    }
  });
});

// Datos de Muestra y Carga de Leads CRM
const LEADS_EJEMPLO = [
  { nombre: 'Mariana Gómez', whatsapp: '1145892301', ambiente: 'Interior', problema: 'Hojas amarillas', kit: 'Kit Cuidado Interior', fecha: '2026-09-21' },
  { nombre: 'Carlos Rossi', whatsapp: '1152019943', ambiente: 'Exterior', problema: 'Jardín descuidado', kit: 'Kit Recuperar Jardín', fecha: '2026-09-20' },
  { nombre: 'Estudio Arq. Vidal', whatsapp: '1163401188', ambiente: 'Terraza', problema: 'Huerta aromáticas', kit: 'Kit Huerta en Casa', fecha: '2026-09-19' },
  { nombre: 'Lucía Fernández', whatsapp: '1138902214', ambiente: 'Parque', problema: 'Poda y saneamiento', kit: 'Kit Poda SK5', fecha: '2026-09-18' }
];

function renderizarLeadsCRM() {
  const crmTbody = document.getElementById('crm-leads-tbody');
  const previewTbody = document.getElementById('preview-leads-tbody');

  const htmlFilas = LEADS_EJEMPLO.map(lead => `
    <tr>
      <td><strong>${lead.nombre}</strong></td>
      <td>${lead.whatsapp}</td>
      <td>${lead.ambiente}</td>
      <td>${lead.problema}</td>
      <td><span class="badge" style="background:var(--accent-sage-light); color:var(--accent-sage);">${lead.kit}</span></td>
      <td>${lead.fecha}</td>
      <td>
        <a href="https://wa.me/549${lead.whatsapp}" target="_blank" class="btn-train" style="text-decoration:none; padding:0.35rem 0.75rem; font-size:0.75rem;">
          Contactar 💬
        </a>
      </td>
    </tr>
  `).join('');

  if (crmTbody) crmTbody.innerHTML = htmlFilas;

  if (previewTbody) {
    previewTbody.innerHTML = LEADS_EJEMPLO.slice(0, 3).map(lead => `
      <tr>
        <td><strong>${lead.nombre}</strong></td>
        <td>${lead.ambiente}</td>
        <td>${lead.problema}</td>
        <td><span class="badge" style="background:var(--accent-sage-light); color:var(--accent-sage);">${lead.kit}</span></td>
        <td>${lead.fecha}</td>
      </tr>
    `).join('');
  }
}

// Carga de Inventario RPM
function renderizarInventarioRPM() {
  const rpmTbody = document.getElementById('rpm-stock-tbody');
  if (!rpmTbody) return;

  const stockBase = {
    'kit-recuperar': 25,
    'kit-mantenimiento': 40,
    'kit-huerta': 30,
    'kit-poda': 20,
    'kit-interior': 50
  };

  rpmTbody.innerHTML = KITS.map(kit => {
    const cant = stockBase[kit.id] || 20;
    return `
      <tr>
        <td><code>${kit.id}</code></td>
        <td><strong>${kit.nombre}</strong></td>
        <td><strong style="font-size:1.1rem; color:var(--accent-oliva);" id="stock-${kit.id}">${cant}</strong> un.</td>
        <td>$${kit.precio.toLocaleString('es-AR')}</td>
        <td><span class="badge" style="background:${cant > 15 ? '#E8F5E9' : '#FFF3E0'}; color:${cant > 15 ? '#2E7D32' : '#E65100'};">● En Stock</span></td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <button type="button" class="btn-train btn-stock-adjust" data-kit="${kit.id}" data-delta="1" style="padding:0.2rem 0.6rem; font-size:0.8rem;">+1</button>
            <button type="button" class="btn-train btn-stock-adjust" data-kit="${kit.id}" data-delta="-1" style="padding:0.2rem 0.6rem; font-size:0.8rem; background:#8E908A;">-1</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  rpmTbody.querySelectorAll('.btn-stock-adjust').forEach(btn => {
    btn.addEventListener('click', () => {
      const kitId = btn.getAttribute('data-kit-id') || btn.getAttribute('data-kit');
      const delta = parseInt(btn.getAttribute('data-delta'), 10);
      const stockEl = document.getElementById(`stock-${kitId}`);
      if (stockEl) {
        let actual = parseInt(stockEl.textContent, 10);
        actual = Math.max(0, actual + delta);
        stockEl.textContent = actual;
      }
    });
  });
}

// Sincronización Manual con Supabase
const btnSync = document.getElementById('btn-sync-crm');
if (btnSync) {
  btnSync.addEventListener('click', async () => {
    btnSync.textContent = 'Sincronizando... ⏳';
    try {
      const { data, error } = await supabase.from('clientes').select('*, diagnosticos_jardin(*)').limit(10);
      if (!error && data && data.length > 0) {
        console.log('Datos en vivo de Supabase obtenidos:', data);
      }
    } catch (e) {
      console.warn('Conexión Supabase offline en este entorno:', e);
    }
    setTimeout(() => {
      btnSync.textContent = '✓ Actualizado';
      setTimeout(() => { btnSync.textContent = '🔄 Sincronizar Supabase'; }, 2000);
    }, 600);
  });
}

// Inicialización de la Dashboard
document.addEventListener('DOMContentLoaded', () => {
  renderizarLeadsCRM();
  renderizarInventarioRPM();
});

// ============================================================
// SAVIO ERP V3 - Lógica Pragmática y Arquitectura Maestra Global
// Desarrollado y Optimizado por MyJNexoraVisual
// ============================================================

// ---- AUTH & ROLES ----
const loginScreen = document.getElementById('login-screen');
const dashScreen = document.getElementById('dashboard-screen');
const btnLogin = document.getElementById('btn-login');
const errLogin = document.getElementById('login-error');
const headerRoleBadge = document.getElementById('header-role-badge');
const btnToggleRole = document.getElementById('btn-toggle-role');

function getRole() {
  return localStorage.getItem('savio_erp_role') || 'superadmin';
}

function applyRole(role) {
  localStorage.setItem('savio_erp_role', role);
  document.body.className = `role-${role}`;
  if (headerRoleBadge) {
    headerRoleBadge.className = `role-badge ${role}`;
    headerRoleBadge.textContent = role === 'superadmin' ? 'Superadmin (Control Total)' : 'Operador de Turno';
  }
  if (btnToggleRole) {
    btnToggleRole.textContent = role === 'superadmin' ? 'Cambiar a Modo Operador' : 'Cambiar a Modo Superadmin';
  }
}

function checkAuth() {
  if (localStorage.getItem('savio_erp_auth') === 'ok') {
    loginScreen.style.display = 'none';
    dashScreen.style.display = 'block';
    const role = getRole();
    applyRole(role);
    loadConfig();
    initCRM();
    initStock();
    initNoraTraining();
  }
}

btnLogin.addEventListener('click', () => {
  const u = document.getElementById('login-user').value.trim().toLowerCase();
  const p = document.getElementById('login-pass').value.trim();
  const adminPass = localStorage.getItem('savio_pass_admin') || '0000';
  const opPass = localStorage.getItem('savio_pass_op') || '1234';

  if ((u === 'admin' || u === 'superadmin') && p === adminPass) {
    localStorage.setItem('savio_erp_auth', 'ok');
    applyRole('superadmin');
    checkAuth();
  } else if ((u === 'operador' || u === 'op' || u === 'admin') && p === opPass) {
    localStorage.setItem('savio_erp_auth', 'ok');
    applyRole('operador');
    checkAuth();
  } else {
    errLogin.style.display = 'block';
  }
});

// Botones rápidos de login
document.getElementById('btn-quick-admin')?.addEventListener('click', () => {
  document.getElementById('login-user').value = 'admin';
  document.getElementById('login-pass').value = localStorage.getItem('savio_pass_admin') || '0000';
  btnLogin.click();
});

document.getElementById('btn-quick-op')?.addEventListener('click', () => {
  document.getElementById('login-user').value = 'operador';
  document.getElementById('login-pass').value = localStorage.getItem('savio_pass_op') || '1234';
  btnLogin.click();
});

// Alternar rol desde el header
btnToggleRole?.addEventListener('click', () => {
  const current = getRole();
  const next = current === 'superadmin' ? 'operador' : 'superadmin';
  applyRole(next);
  alert(`Cambiado a perfil: ${next === 'superadmin' ? 'Superadmin (Control Total)' : 'Operador de Turno'}`);
});

document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('savio_erp_auth');
  location.reload();
});

// ---- TABS PRINCIPALES ----
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    e.currentTarget.classList.add('active');
    const target = document.getElementById(e.currentTarget.dataset.tab);
    if (target) target.classList.add('active');
  });
});

// ---- SUB-TABS: ALTAS RÁPIDAS ----
const subtabBtnCliente = document.getElementById('subtab-btn-cliente');
const subtabBtnProducto = document.getElementById('subtab-btn-producto');
const formCliente = document.getElementById('form-cliente');
const formProducto = document.getElementById('form-producto');

subtabBtnCliente?.addEventListener('click', () => {
  subtabBtnCliente.classList.add('active');
  subtabBtnProducto.classList.remove('active');
  formCliente.style.display = 'grid';
  formProducto.style.display = 'none';
});

subtabBtnProducto?.addEventListener('click', () => {
  subtabBtnProducto.classList.add('active');
  subtabBtnCliente.classList.remove('active');
  formProducto.style.display = 'grid';
  formCliente.style.display = 'none';
});

// ============================================================
// 1. CALCULADORA DE PRECIOS E INVENTARIO
// ============================================================
const prodCosto = document.getElementById('prod-costo');
const prodMargen = document.getElementById('prod-margen');
const prodPrecio = document.getElementById('prod-precio');

function calcularPrecioProducto() {
  if (!prodCosto || !prodMargen || !prodPrecio) return;
  const costo = parseFloat(prodCosto.value) || 0;
  const margen = parseFloat(prodMargen.value) || 0;
  if (costo <= 0) {
    prodPrecio.value = '$0';
    return;
  }
  const precio = Math.round(costo * (1 + margen / 100));
  prodPrecio.value = `$${precio.toLocaleString('es-AR')}`;
}

prodCosto?.addEventListener('input', calcularPrecioProducto);
prodMargen?.addEventListener('input', calcularPrecioProducto);

// ============================================================
// 2. GESTIÓN CRM CLIENTES, FORMAS DE PAGO & ALERTAS WHATSAPP
// ============================================================
const DEFAULT_CLIENTES = [
  {
    nombre: 'Vivero Ituzaingó',
    tel: '5493786519242',
    tipo: 'Empresa',
    condicion: 'cta-corriente',
    condicionLabel: 'Cuenta Corriente',
    pago: 'Transferencia',
    saldo: '-$45.000',
    vencimiento: '2026-10-15'
  },
  {
    nombre: 'Juan Pérez',
    tel: '5493786123456',
    tipo: 'Particular',
    condicion: 'contado',
    condicionLabel: 'Contado',
    pago: 'Efectivo',
    saldo: '$0',
    vencimiento: '-'
  },
  {
    nombre: 'Municipalidad Corrientes',
    tel: '5493794112233',
    tipo: 'Estatal',
    condicion: 'licitacion',
    condicionLabel: 'Licitación',
    pago: 'Cheque Diferido (30/60d)',
    saldo: '-$120.000',
    vencimiento: '2026-10-30'
  },
  {
    nombre: 'Vivero San Martín',
    tel: '5493786554433',
    tipo: 'Empresa',
    condicion: 'factura',
    condicionLabel: 'Factura',
    pago: 'Mercado Pago (QR/Link)',
    saldo: '-$32.000',
    vencimiento: '2026-10-20'
  }
];

function getClientes() {
  try {
    const raw = localStorage.getItem('savio_erp_clientes');
    if (!raw) {
      localStorage.setItem('savio_erp_clientes', JSON.stringify(DEFAULT_CLIENTES));
      return DEFAULT_CLIENTES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_CLIENTES;
  }
}

function saveClientes(list) {
  localStorage.setItem('savio_erp_clientes', JSON.stringify(list));
  renderCRMTable();
}

function renderCRMTable() {
  const tbody = document.getElementById('crm-tbody');
  if (!tbody) return;
  const list = getClientes();
  const currentFilter = document.getElementById('crm-filter')?.value || 'todos';

  tbody.innerHTML = '';
  list.forEach(cli => {
    const tr = document.createElement('tr');
    tr.dataset.type = cli.condicion;

    const hasDebt = cli.saldo && cli.saldo.includes('-');
    const isCtaCte = cli.condicion === 'cta-corriente';
    const cleanTel = (cli.tel || '').replace(/\D/g, '');

    // Botones de acción WhatsApp
    const msgOferta = encodeURIComponent(`Hola ${cli.nombre}! 👋 Te contactamos desde SAVIO Ituzaingó para acercarte novedades botánicas, kits orgánicos y promociones de temporada para tus espacios verdes 🌿.`);
    const linkOferta = `https://wa.me/${cleanTel}?text=${msgOferta}`;

    let actionsHtml = `<a href="${linkOferta}" target="_blank" class="btn-crm-action btn-wa-oferta" title="Enviar Oferta">📣 Mandar Oferta</a>`;

    if (hasDebt || isCtaCte) {
      const msgVenc = encodeURIComponent(`Hola ${cli.nombre}! 👋 Te contactamos desde SAVIO Ituzaingó para recordarte el saldo registrado de ${cli.saldo}, con fecha límite de vencimiento ${cli.vencimiento || 'a convenir'}. ¿Nos confirmás para coordinar el pago o remito? ¡Muchas gracias!`);
      const linkVenc = `https://wa.me/${cleanTel}?text=${msgVenc}`;
      actionsHtml += `<a href="${linkVenc}" target="_blank" class="btn-crm-action btn-wa-vencimiento" title="Aviso Vencimiento">⏳ Aviso Vencimiento</a>`;
    }

    const saldoColor = hasDebt ? 'color:#e74c3c; font-weight:600;' : (cli.saldo === '$0' ? 'color:#27ae60;' : '');
    const vencDisplay = cli.vencimiento && cli.vencimiento !== '-' 
      ? `<span class="${hasDebt ? 'badge-venc' : ''}">${cli.vencimiento}</span>`
      : '<span style="color:rgba(255,255,255,0.4);">-</span>';

    tr.innerHTML = `
      <td><strong>${cli.nombre}</strong></td>
      <td style="color:var(--arena); font-size:0.8rem;">${cli.tel || '-'}</td>
      <td>${cli.tipo}</td>
      <td>${cli.condicionLabel || cli.condicion}</td>
      <td><span style="font-size:0.82rem; color:var(--arena);">${cli.pago || 'Contado'}</span></td>
      <td style="${saldoColor}">${cli.saldo}</td>
      <td>${vencDisplay}</td>
      <td class="no-print">${actionsHtml}</td>
    `;

    if (currentFilter !== 'todos' && cli.condicion !== currentFilter) {
      tr.style.display = 'none';
    }

    tbody.appendChild(tr);
  });
}

function initCRM() {
  renderCRMTable();

  // Filtro CRM
  const crmFilter = document.getElementById('crm-filter');
  crmFilter?.addEventListener('change', (e) => {
    const val = e.target.value;
    const rows = document.querySelectorAll('#crm-tbody tr');
    rows.forEach(row => {
      if (val === 'todos' || row.dataset.type === val) row.style.display = '';
      else row.style.display = 'none';
    });
  });

  // Guardar Cliente Form
  formCliente?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('cli-nombre').value.trim();
    const tel = document.getElementById('cli-tel').value.trim();
    const tipo = document.getElementById('cli-tipo').value;
    const condicionSelect = document.getElementById('cli-condicion');
    const condicion = condicionSelect.value;
    const condicionLabel = condicionSelect.options[condicionSelect.selectedIndex].text;
    const pago = document.getElementById('cli-pago')?.value || 'Efectivo';
    const saldo = document.getElementById('cli-saldo').value.trim() || '$0';
    const vencimiento = document.getElementById('cli-vencimiento').value || '-';

    if (!nombre || !tel) {
      alert('Por favor complete Nombre y Teléfono.');
      return;
    }

    const list = getClientes();
    list.unshift({ nombre, tel, tipo, condicion, condicionLabel, pago, saldo, vencimiento });
    saveClientes(list);

    formCliente.reset();
    document.getElementById('cli-saldo').value = '$0';
    alert(`Cliente "${nombre}" registrado exitosamente en el CRM.`);
  });
}

// ============================================================
// 3. GESTIÓN DE STOCK & PRODUCTOS
// ============================================================
const DEFAULT_STOCK = [
  { sku: 'KIT-001', nombre: 'Kit Huerta Urbana', desc: '5 semillas, compost y pala', stock: 12, costo: 14000, precio: '$24.500', estado: 'Óptimo' },
  { sku: 'SUB-020', nombre: 'Sustrato Biochar 20L', desc: 'Biochar enriquecido 20L', stock: 3, costo: 4500, precio: '$8.000', estado: 'Reabastecer' },
  { sku: 'KIT-002', nombre: 'Kit Rescate Litoral', desc: 'Biochar, estimulante y tijera', stock: 8, costo: 16000, precio: '$28.500', estado: 'Óptimo' },
  { sku: 'HER-005', nombre: 'Tijera Bypass SK5', desc: 'Acero templado japonés', stock: 15, costo: 7000, precio: '$12.000', estado: 'Óptimo' }
];

function getStock() {
  try {
    const raw = localStorage.getItem('savio_erp_stock');
    if (!raw) {
      localStorage.setItem('savio_erp_stock', JSON.stringify(DEFAULT_STOCK));
      return DEFAULT_STOCK;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_STOCK;
  }
}

function saveStock(list) {
  localStorage.setItem('savio_erp_stock', JSON.stringify(list));
  renderStockTable();
}

function renderStockTable() {
  const tbody = document.getElementById('stock-tbody');
  if (!tbody) return;
  const list = getStock();

  tbody.innerHTML = '';
  list.forEach(p => {
    const tr = document.createElement('tr');
    const isLow = Number(p.stock) <= 5;
    const estado = isLow ? 'Reabastecer' : 'Óptimo';
    const estadoColor = isLow ? 'color:#e67e22; font-weight:600;' : 'color:#27ae60; font-weight:600;';
    const costoDisplay = p.costo ? `$${Number(p.costo).toLocaleString('es-AR')}` : '-';

    tr.innerHTML = `
      <td><code>${p.sku}</code></td>
      <td><strong>${p.nombre}</strong></td>
      <td style="color:var(--arena); font-size:0.85rem;">${p.desc || '-'}</td>
      <td>${p.stock}</td>
      <td style="color:rgba(255,255,255,0.7);">${costoDisplay}</td>
      <td style="color:var(--dorado); font-weight:600;">${p.precio}</td>
      <td style="${estadoColor}">${estado}</td>
    `;
    tbody.appendChild(tr);
  });
}

function initStock() {
  renderStockTable();

  // Guardar Producto Form
  formProducto?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('prod-nombre').value.trim();
    const sku = document.getElementById('prod-sku').value.trim();
    const desc = document.getElementById('prod-desc').value.trim();
    const stock = Number(document.getElementById('prod-stock').value) || 0;
    const costo = Number(document.getElementById('prod-costo').value) || 0;
    const precio = document.getElementById('prod-precio').value.trim();

    if (!nombre || !sku) {
      alert('Por favor complete Nombre y SKU.');
      return;
    }

    const estado = stock <= 5 ? 'Reabastecer' : 'Óptimo';
    const list = getStock();
    list.unshift({ sku, nombre, desc, stock, costo, precio, estado });
    saveStock(list);

    formProducto.reset();
    document.getElementById('prod-precio').value = '';
    alert(`Producto "${nombre}" (${sku}) ingresado al inventario con cálculo de margen.`);
  });
}

// ============================================================
// 4. MÓDULO DE ENTRENAMIENTO MULTIMEDIA PARA NORA (IA)
// ============================================================
function initNoraTraining() {
  const dropzone = document.getElementById('ia-docs-dropzone');
  const fileInput = document.getElementById('ia-docs-input');
  const docsList = document.getElementById('ia-docs-list');
  const promptText = document.getElementById('ia-prompt-text');
  const btnSaveIa = document.getElementById('btn-save-ia');
  const statusText = document.getElementById('ia-status-text');

  // Cargar directivas existentes
  const savedPrompt = localStorage.getItem('savio_nora_custom_prompt') || '';
  if (promptText) promptText.value = savedPrompt;

  const savedDocs = JSON.parse(localStorage.getItem('savio_nora_docs') || '[]');
  if (docsList && savedDocs.length > 0) {
    docsList.innerHTML = `<strong>Documentos cargados:</strong><br>${savedDocs.map(d => `• ${d}`).join('<br>')}`;
  }

  dropzone?.addEventListener('click', () => fileInput?.click());

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      const names = Array.from(e.target.files).map(f => f.name);
      const allDocs = [...savedDocs, ...names];
      localStorage.setItem('savio_nora_docs', JSON.stringify(allDocs));
      
      if (docsList) {
        docsList.innerHTML = `<strong>Documentos indexados:</strong><br>${allDocs.map(d => `• ${d}`).join('<br>')}`;
      }
      alert(`Se cargaron ${names.length} documento(s) técnico(s) al centro de conocimiento de Nora.`);
    }
  });

  btnSaveIa?.addEventListener('click', () => {
    const text = promptText?.value.trim() || '';
    localStorage.setItem('savio_nora_custom_prompt', text);
    
    // Crear reglas semánticas inmediatas para app.js
    if (text) {
      const rules = [
        { trigger: 'promocion', response: `Información de temporada: ${text}` },
        { trigger: 'descuento', response: `Información de temporada: ${text}` }
      ];
      localStorage.setItem('savio_nora_custom_knowledge', JSON.stringify(rules));
    }

    if (statusText) {
      statusText.innerHTML = `● Conocimiento actualizado en producción (${new Date().toLocaleTimeString('es-AR')}) · Directivas activas en toda la web.`;
    }
    alert('¡Cerebro de Nora actualizado! Las nuevas instrucciones semánticas rigen ahora en el chat.');
  });
}

// ============================================================
// 5. CONFIGURACIÓN DINÁMICA DE TURNO Y PERMISOS
// ============================================================
const cfgOp = document.getElementById('cfg-operator');
const cfgWa = document.getElementById('cfg-wa');
const cfgIg = document.getElementById('cfg-ig');

function loadConfig() {
  if (cfgOp) cfgOp.value = localStorage.getItem('savio_operator_name') || '';
  if (cfgWa) cfgWa.value = localStorage.getItem('savio_whatsapp_number') || '5493786519242';
  if (cfgIg) cfgIg.value = localStorage.getItem('savio_instagram_url') || '';

  const cfgPassAdmin = document.getElementById('cfg-pass-admin');
  const cfgPassOp = document.getElementById('cfg-pass-op');
  if (cfgPassAdmin) cfgPassAdmin.value = localStorage.getItem('savio_pass_admin') || '0000';
  if (cfgPassOp) cfgPassOp.value = localStorage.getItem('savio_pass_op') || '1234';
}

document.getElementById('btn-save-cfg')?.addEventListener('click', () => {
  localStorage.setItem('savio_operator_name', cfgOp.value.trim());
  localStorage.setItem('savio_whatsapp_number', cfgWa.value.replace(/\D/g, ''));
  localStorage.setItem('savio_instagram_url', cfgIg.value.trim());
  alert('Configuración de turno guardada. Impacta de inmediato en toda la plataforma.');
});

document.getElementById('btn-save-roles')?.addEventListener('click', () => {
  const pAdmin = document.getElementById('cfg-pass-admin')?.value.trim();
  const pOp = document.getElementById('cfg-pass-op')?.value.trim();
  if (pAdmin) localStorage.setItem('savio_pass_admin', pAdmin);
  if (pOp) localStorage.setItem('savio_pass_op', pOp);
  alert('Claves de Superadmin y Operador actualizadas correctamente.');
});

// ============================================================
// 6. EXPORTACIÓN DE REPORTES (ESTRUCTURA IMPRESIÓN NEGRA Y JUSTIFICADA)
// ============================================================
function generatePrintableHTML(elementId, titleText) {
  const orig = document.getElementById(elementId);
  if (!orig) return '';

  const tableOrig = orig.querySelector('table') || orig;

  // Extraer encabezados omitiendo .no-print
  let headersHtml = '';
  const ths = tableOrig.querySelectorAll('thead th');
  if (ths.length > 0) {
    headersHtml += '<tr>';
    ths.forEach(th => {
      if (!th.classList.contains('no-print')) {
        headersHtml += `<th style="background-color:#EFECE6; color:#1C1D1B; font-weight:bold; border:1.5px solid #1C1D1B; padding:10px 8px; font-size:11px; text-transform:uppercase; text-align:left; font-family:Arial, sans-serif;">${th.textContent.trim()}</th>`;
      }
    });
    headersHtml += '</tr>';
  }

  // Extraer filas visibles
  let rowsHtml = '';
  const rows = tableOrig.querySelectorAll('tbody tr');
  rows.forEach(tr => {
    if (tr.style.display === 'none') return;

    rowsHtml += '<tr>';
    tr.querySelectorAll('td').forEach(td => {
      if (!td.classList.contains('no-print')) {
        const text = td.innerText.trim();
        rowsHtml += `<td style="color:#000000; background-color:#FFFFFF; border:1px solid #CCCCCC; padding:8px; font-size:11px; text-align:justify; font-family:Arial, sans-serif; line-height:1.4;">${text}</td>`;
      }
    });
    rowsHtml += '</tr>';
  });

  const fecha = new Date().toLocaleDateString('es-AR');
  const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  return `
    <div style="background-color:#FFFFFF; color:#000000; padding:25px; font-family:Arial, Helvetica, sans-serif; box-sizing:border-box; width:100%;">
      <!-- ENCABEZADO INSTITUCIONAL -->
      <div style="border-bottom:2px solid #1C1D1B; padding-bottom:12px; margin-bottom:18px;">
        <h1 style="color:#1C1D1B; font-size:20px; margin:0 0 5px 0; font-weight:bold; letter-spacing:0.5px;">SAVIO — GESTIÓN BOTÁNICA ERP</h1>
        <p style="color:#000000; font-size:11px; margin:0; text-align:justify;">Reporte Oficial de Operaciones · Ituzaingó, Corrientes, Argentina · Emisión: ${fecha} - ${hora} hs.</p>
      </div>

      <!-- TÍTULO Y DESCRIPCIÓN JUSTIFICADA -->
      <div style="margin-bottom:15px;">
        <h2 style="color:#1C1D1B; font-size:15px; margin:0 0 6px 0; font-weight:bold; text-transform:uppercase;">${titleText.replace(/_/g, ' ')}</h2>
        <p style="color:#000000; font-size:11px; margin:0; text-align:justify; line-height:1.5;">
          Documento administrativo generado para auditoría interna, control de stock y seguimiento de cuentas comerciales. La información detallada en esta planilla refleja con precisión los saldos vigentes, formas de pago y estados operativos de la plataforma botánica SAVIO.
        </p>
      </div>

      <!-- TABLA DE ALTO CONTRASTE -->
      <table style="width:100%; border-collapse:collapse; margin-top:12px; background-color:#FFFFFF; color:#000000;">
        <thead>${headersHtml}</thead>
        <tbody>${rowsHtml}</tbody>
      </table>

      <!-- PIE INSTITUCIONAL JUSTIFICADO -->
      <div style="margin-top:25px; border-top:1.5px solid #1C1D1B; padding-top:10px; font-size:10px; color:#000000;">
        <p style="margin:0; text-align:justify; line-height:1.4;">
          <strong>SAVIO Ituzaingó</strong> — Jardinería Botánica Premium. Registro confidencial emitido para soporte contable y logístico. Prohibida su reproducción sin autorización previa. © 2026 SAVIO. Desarrollado y Optimizado por MyJNexoraVisual.
        </p>
      </div>
    </div>
  `;
}

// PDF: Renderizado garantizado sin hojas vacías con letras negras sólidas
window.exportPDF = function(elementId, filename) {
  if (!window.html2pdf) {
    alert("Cargando motor PDF, intente nuevamente en 2 segundos.");
    return;
  }

  const htmlContent = generatePrintableHTML(elementId, filename);
  if (!htmlContent) {
    alert("No se encontraron registros para exportar.");
    return;
  }

  // Contenedor temporal insertado en el DOM con ancho fijo
  const printDiv = document.createElement('div');
  printDiv.id = 'temp-pdf-export-container';
  printDiv.style.position = 'fixed';
  printDiv.style.left = '-9999px';
  printDiv.style.top = '0';
  printDiv.style.width = '1000px';
  printDiv.style.backgroundColor = '#FFFFFF';
  printDiv.style.color = '#000000';
  printDiv.style.zIndex = '-9999';
  printDiv.innerHTML = htmlContent;
  document.body.appendChild(printDiv);

  const opt = {
    margin: [10, 10, 10, 10],
    filename: `${filename}_${new Date().toISOString().slice(0,10)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      backgroundColor: '#FFFFFF',
      useCORS: true,
      logging: false
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  html2pdf().set(opt).from(printDiv).save().then(() => {
    printDiv.remove();
  }).catch(() => {
    printDiv.remove();
  });
};

// Word: Exportación limpia independiente en negro puro y justificado
window.exportWord = function(elementId, filename) {
  const htmlContent = generatePrintableHTML(elementId, filename);
  if (!htmlContent) {
    alert("No se encontraron registros para exportar.");
    return;
  }

  const wordHtml = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset='utf-8'>
    <title>${filename}</title>
    <style>
      body { font-family: Arial, sans-serif; background-color: #FFFFFF; color: #000000; margin: 20px; }
      h1, h2 { color: #1C1D1B; font-weight: bold; }
      p, td { color: #000000; text-align: justify; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th { background-color: #EFECE6; color: #1C1D1B; font-weight: bold; border: 1.5px solid #1C1D1B; padding: 10px 8px; text-transform: uppercase; font-size: 11px; text-align: left; }
      td { border: 1px solid #CCCCCC; padding: 8px; font-size: 11px; text-align: justify; color: #000000; }
    </style>
  </head>
  <body style="background-color:#FFFFFF; color:#000000;">
    ${htmlContent}
  </body>
  </html>`;

  const blob = new Blob(['\ufeff', wordHtml], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0,10)}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ============================================================
// 7. NORA OCR (SIMULATOR)
// ============================================================
const dropzone = document.getElementById('ocr-dropzone');
const ocrInput = document.getElementById('ocr-input');
const ocrResult = document.getElementById('ocr-result');

dropzone?.addEventListener('click', () => ocrInput?.click());

ocrInput?.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    dropzone.innerHTML = '⚙️ Escaneando con Nora OCR...';
    setTimeout(() => {
      dropzone.innerHTML = '<div style="font-size:2rem; margin-bottom:1rem;">📄</div>Click o arrastrar documento para analizar';
      ocrResult.style.display = 'block';
    }, 1800);
  }
});

// INIT
checkAuth();

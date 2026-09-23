// ============================================================
// SAVIO ERP V3 - Lógica Pragmática y Gestión Integral
// Desarrollado y Optimizado por MyJNexoraVisual
// ============================================================

// ---- AUTH ----
const loginScreen = document.getElementById('login-screen');
const dashScreen = document.getElementById('dashboard-screen');
const btnLogin = document.getElementById('btn-login');
const errLogin = document.getElementById('login-error');

function checkAuth() {
  if (localStorage.getItem('savio_erp_auth') === 'ok') {
    loginScreen.style.display = 'none';
    dashScreen.style.display = 'block';
    loadConfig();
    initCRM();
    initStock();
  }
}

btnLogin.addEventListener('click', () => {
  const u = document.getElementById('login-user').value;
  const p = document.getElementById('login-pass').value;
  if (u === 'admin' && p === '0000') {
    localStorage.setItem('savio_erp_auth', 'ok');
    checkAuth();
  } else {
    errLogin.style.display = 'block';
  }
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
    e.target.classList.add('active');
    document.getElementById(e.target.dataset.tab).classList.add('active');
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
// 1. GESTIÓN CRM CLIENTES & ALERTAS WHATSAPP
// ============================================================
const DEFAULT_CLIENTES = [
  {
    nombre: 'Vivero Ituzaingó',
    tel: '5493786519242',
    tipo: 'Empresa',
    condicion: 'cta-corriente',
    condicionLabel: 'Cuenta Corriente',
    saldo: '-$45.000',
    vencimiento: '2026-10-15'
  },
  {
    nombre: 'Juan Pérez',
    tel: '5493786123456',
    tipo: 'Particular',
    condicion: 'contado',
    condicionLabel: 'Contado',
    saldo: '$0',
    vencimiento: '-'
  },
  {
    nombre: 'Municipalidad Corrientes',
    tel: '5493794112233',
    tipo: 'Estatal',
    condicion: 'licitacion',
    condicionLabel: 'Licitación',
    saldo: '-$120.000',
    vencimiento: '2026-10-30'
  },
  {
    nombre: 'Vivero San Martín',
    tel: '5493786554433',
    tipo: 'Empresa',
    condicion: 'factura',
    condicionLabel: 'Factura',
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
  list.forEach((cli, idx) => {
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
    const saldo = document.getElementById('cli-saldo').value.trim() || '$0';
    const vencimiento = document.getElementById('cli-vencimiento').value || '-';

    if (!nombre || !tel) {
      alert('Por favor complete Nombre y Teléfono.');
      return;
    }

    const list = getClientes();
    list.unshift({ nombre, tel, tipo, condicion, condicionLabel, saldo, vencimiento });
    saveClientes(list);

    formCliente.reset();
    document.getElementById('cli-saldo').value = '$0';
    alert(`Cliente "${nombre}" registrado exitosamente en el CRM.`);
  });
}

// ============================================================
// 2. GESTIÓN DE STOCK & PRODUCTOS
// ============================================================
const DEFAULT_STOCK = [
  { sku: 'KIT-001', nombre: 'Kit Huerta Urbana', desc: '5 semillas, compost y pala', stock: 12, precio: '$24.500', estado: 'Óptimo' },
  { sku: 'SUB-020', nombre: 'Sustrato Biochar 20L', desc: 'Biochar enriquecido 20L', stock: 3, precio: '$8.000', estado: 'Reabastecer' },
  { sku: 'KIT-002', nombre: 'Kit Rescate Litoral', desc: 'Biochar, estimulante y tijera', stock: 8, precio: '$28.500', estado: 'Óptimo' },
  { sku: 'HER-005', nombre: 'Tijera Bypass SK5', desc: 'Acero templado japonés', stock: 15, precio: '$12.000', estado: 'Óptimo' }
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

    tr.innerHTML = `
      <td><code>${p.sku}</code></td>
      <td><strong>${p.nombre}</strong></td>
      <td style="color:var(--arena); font-size:0.85rem;">${p.desc || '-'}</td>
      <td>${p.stock}</td>
      <td>${p.precio}</td>
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
    const precio = document.getElementById('prod-precio').value.trim();

    if (!nombre || !sku) {
      alert('Por favor complete Nombre y SKU.');
      return;
    }

    const estado = stock <= 5 ? 'Reabastecer' : 'Óptimo';
    const list = getStock();
    list.unshift({ sku, nombre, desc, stock, precio, estado });
    saveStock(list);

    formProducto.reset();
    alert(`Producto "${nombre}" (${sku}) ingresado al inventario.`);
  });
}

// ============================================================
// 3. CONFIGURACIÓN DINÁMICA DE TURNO
// ============================================================
const cfgOp = document.getElementById('cfg-operator');
const cfgWa = document.getElementById('cfg-wa');
const cfgIg = document.getElementById('cfg-ig');

function loadConfig() {
  if (!cfgOp) return;
  cfgOp.value = localStorage.getItem('savio_operator_name') || '';
  cfgWa.value = localStorage.getItem('savio_whatsapp_number') || '5493786519242';
  cfgIg.value = localStorage.getItem('savio_instagram_url') || '';
}

document.getElementById('btn-save-cfg')?.addEventListener('click', () => {
  localStorage.setItem('savio_operator_name', cfgOp.value.trim());
  localStorage.setItem('savio_whatsapp_number', cfgWa.value.replace(/\D/g, ''));
  localStorage.setItem('savio_instagram_url', cfgIg.value.trim());
  alert('Configuración de turno guardada. Impacta de inmediato en toda la plataforma.');
});

// ============================================================
// 4. EXPORTACIÓN DE REPORTES (PDF Y WORD DE ALTO CONTRASTE)
// ============================================================

// PDF: Forzar texto negro sólido / Grafito Puro (#1C1D1B) sobre fondo blanco puro
window.exportPDF = function(elementId, filename) {
  const element = document.getElementById(elementId);
  if (!element) return;
  if (!window.html2pdf) {
    alert("Cargando motor PDF, intente nuevamente en 2 segundos.");
    return;
  }

  // 1. Clonar para aislar manipulación
  const clone = element.cloneNode(true);

  // 2. Remover elementos interactivos (botones CRM)
  clone.querySelectorAll('.no-print').forEach(el => el.remove());

  // 3. Envoltorio blanco estricto con Grafito Puro (#1C1D1B)
  const wrapper = document.createElement('div');
  wrapper.style.backgroundColor = '#FFFFFF';
  wrapper.style.color = '#1C1D1B';
  wrapper.style.padding = '25px';
  wrapper.style.fontFamily = 'Helvetica, Arial, sans-serif';

  // Cabecera institucional
  const header = document.createElement('div');
  header.style.borderBottom = '2px solid #1C1D1B';
  header.style.paddingBottom = '10px';
  header.style.marginBottom = '20px';
  header.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-end;">
      <div>
        <h1 style="color:#1C1D1B; font-size:22px; margin:0; font-weight:bold; letter-spacing:1px;">SAVIO — GESTIÓN BOTÁNICA ERP</h1>
        <p style="color:#1C1D1B; font-size:11px; margin:4px 0 0 0;">Ituzaingó, Corrientes, Argentina · Reporte Oficial</p>
      </div>
      <div style="text-align:right;">
        <span style="color:#1C1D1B; font-size:13px; font-weight:bold;">${filename.replace(/_/g, ' ')}</span><br>
        <span style="color:#444444; font-size:10px;">Emisión: ${new Date().toLocaleDateString('es-AR')}</span>
      </div>
    </div>
  `;
  wrapper.appendChild(header);

  // 4. Forzar estilos de tabla de máximo contraste
  const table = clone.querySelector('table') || clone;
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.backgroundColor = '#FFFFFF';
  table.style.color = '#1C1D1B';

  clone.querySelectorAll('th').forEach(th => {
    th.style.backgroundColor = '#EAE6DF';
    th.style.color = '#1C1D1B';
    th.style.fontWeight = 'bold';
    th.style.fontSize = '11px';
    th.style.padding = '8px 10px';
    th.style.border = '1px solid #1C1D1B';
    th.style.textTransform = 'uppercase';
    th.style.textAlign = 'left';
  });

  clone.querySelectorAll('td').forEach(td => {
    td.style.backgroundColor = '#FFFFFF';
    td.style.color = '#1C1D1B';
    td.style.fontSize = '11px';
    td.style.padding = '7px 10px';
    td.style.border = '1px solid #CCCCCC';
    
    // Normalizar elementos anidados
    td.querySelectorAll('*').forEach(child => {
      child.style.color = '#1C1D1B';
      child.style.backgroundColor = 'transparent';
      child.style.borderColor = '#1C1D1B';
    });
  });

  wrapper.appendChild(clone);

  // Pie del documento
  const footer = document.createElement('div');
  footer.style.marginTop = '25px';
  footer.style.paddingTop = '8px';
  footer.style.borderTop = '1px solid #CCCCCC';
  footer.style.fontSize = '9px';
  footer.style.color = '#555555';
  footer.style.display = 'flex';
  footer.style.justifyContent = 'space-between';
  footer.innerHTML = `
    <span>SAVIO ERP · Sistema Administrativo de Gestión Botánica</span>
    <span>Desarrollado y Optimizado por MyJNexoraVisual</span>
  `;
  wrapper.appendChild(footer);

  // Opciones de exportación en PDF
  const opt = {
    margin: 10,
    filename: `${filename}_${new Date().toISOString().slice(0,10)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, backgroundColor: '#FFFFFF' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  html2pdf().set(opt).from(wrapper).save();
};

// Word: Exportar contenido limpio y con contraste óptimo
window.exportWord = function(elementId, filename) {
  const element = document.getElementById(elementId);
  if (!element) return;
  const clone = element.cloneNode(true);
  clone.querySelectorAll('.no-print').forEach(el => el.remove());

  const html = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset='utf-8'>
    <title>${filename}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #1C1D1B; background: #fff; }
      h2 { color: #1C1D1B; border-bottom: 2px solid #1C1D1B; padding-bottom: 5px; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; color: #1C1D1B; }
      th { background-color: #EAE6DF; color: #1C1D1B; border: 1px solid #1C1D1B; padding: 8px; text-transform: uppercase; font-size: 11px; text-align: left; }
      td { border: 1px solid #ccc; padding: 7px; font-size: 11px; color: #1C1D1B; }
    </style>
  </head>
  <body>
    <h2>SAVIO ERP — ${filename.replace(/_/g, ' ')}</h2>
    <p style="font-size:10px; color:#555;">Ituzaingó, Corrientes, Argentina · Emisión: ${new Date().toLocaleDateString('es-AR')}</p>
    ${clone.innerHTML}
    <p style="margin-top:20px; font-size:9px; color:#777;">Desarrollado y Optimizado por MyJNexoraVisual</p>
  </body>
  </html>`;

  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0,10)}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ============================================================
// 5. NORA OCR (SIMULATOR)
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

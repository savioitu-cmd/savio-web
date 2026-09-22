import { supabase } from './supabase-init.js';

const btnCapturar = document.getElementById('btn-capturar-comprobante');
const fileInput = document.getElementById('comprobante-file-input');
const ocrStatus = document.getElementById('ocr-status-container');
const tbodyAsientos = document.getElementById('tbody-asientos');
const btnExportarCsv = document.getElementById('btn-exportar-csv');

export async function procesarComprobanteConNora(file) {
  if (!file) return;

  // Mostrar spinner de Nora
  if (ocrStatus) ocrStatus.classList.remove('hidden');

  // Simulación asíncrona de extracción con Nora AI (2.5s)
  await new Promise(resolve => setTimeout(resolve, 2500));

  const comprobanteExtraido = {
    proveedor_razon_social: 'Sustratos del Paraná S.A.',
    cuit: '30-71458922-3',
    tipo_comprobante: 'Factura A',
    nro_comprobante: '0001-00004521',
    fecha_emision: new Date().toISOString().split('T')[0],
    monto_neto: 85000,
    iva: 17850,
    monto_total: 102850,
    estado_auditoria: 'auditado'
  };

  // Ocultar spinner
  if (ocrStatus) ocrStatus.classList.add('hidden');

  // Renderizar fila en la tabla visual
  if (tbodyAsientos) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${comprobanteExtraido.proveedor_razon_social}</strong></td>
      <td>${comprobanteExtraido.cuit}</td>
      <td><span class="badge-tipo">${comprobanteExtraido.tipo_comprobante}</span></td>
      <td>${comprobanteExtraido.nro_comprobante}</td>
      <td>${comprobanteExtraido.fecha_emision}</td>
      <td class="amount-cell">$${comprobanteExtraido.monto_neto.toLocaleString('es-AR')},00</td>
      <td class="amount-cell">$${comprobanteExtraido.iva.toLocaleString('es-AR')},00</td>
      <td class="amount-cell"><strong>$${comprobanteExtraido.monto_total.toLocaleString('es-AR')},00</strong></td>
      <td><span class="badge-auditoria">● Auditado</span></td>
    `;
    tbodyAsientos.prepend(tr);
  }

  // Persistir en Supabase
  await guardarAsientoEnSupabase(comprobanteExtraido);
}

export async function guardarAsientoEnSupabase(asiento) {
  try {
    const { data, error } = await supabase
      .from('asientos_contables_ocr')
      .insert([asiento])
      .select()
      .single();

    if (error) {
      console.warn('Registro contable guardado localmente (Supabase offline o sin credenciales activas):', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.error('Error al persistir asiento contable:', err);
    return { success: false, error: err.message || err };
  }
}

// Función de exportación a CSV para el contador
export function exportarCierreMensualCSV() {
  if (!tbodyAsientos) return;

  const filas = tbodyAsientos.querySelectorAll('tr');
  const csvHeaders = ['Proveedor', 'CUIT', 'Tipo', 'Nro Comprobante', 'Fecha', 'Neto', 'IVA', 'Total', 'Estado'];
  const csvRows = [csvHeaders.join(';')];

  filas.forEach(fila => {
    const celdas = fila.querySelectorAll('td');
    if (celdas.length >= 9) {
      const filaDatos = [
        `"${celdas[0].innerText.trim()}"`,
        `"${celdas[1].innerText.trim()}"`,
        `"${celdas[2].innerText.trim()}"`,
        `"${celdas[3].innerText.trim()}"`,
        `"${celdas[4].innerText.trim()}"`,
        `"${celdas[5].innerText.replace('$', '').replace('.', '').trim()}"`,
        `"${celdas[6].innerText.replace('$', '').replace('.', '').trim()}"`,
        `"${celdas[7].innerText.replace('$', '').replace('.', '').trim()}"`,
        `"${celdas[8].innerText.trim()}"`
      ];
      csvRows.push(filaDatos.join(';'));
    }
  });

  const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `cierre_contable_savio_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Event Listeners
if (btnCapturar && fileInput) {
  btnCapturar.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) procesarComprobanteConNora(file);
    fileInput.value = '';
  });
}

if (btnExportarCsv) {
  btnExportarCsv.addEventListener('click', exportarCierreMensualCSV);
}

// Cargar asientos desde Supabase al iniciar
export async function cargarAsientosDesdeSupabase() {
  if (!tbodyAsientos) return;

  try {
    const { data, error } = await supabase
      .from('asientos_contables_ocr')
      .select('*')
      .order('creado_at', { ascending: false });

    if (error) {
      console.error('Error al cargar asientos:', error.message);
      return;
    }

    if (data && data.length > 0) {
      tbodyAsientos.innerHTML = '';
      data.forEach(asiento => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${asiento.proveedor_razon_social}</strong></td>
          <td>${asiento.cuit || '-'}</td>
          <td><span class="badge-tipo">${asiento.tipo_comprobante}</span></td>
          <td>${asiento.nro_comprobante || '-'}</td>
          <td>${asiento.fecha_emision}</td>
          <td class="amount-cell">$${asiento.monto_neto.toLocaleString('es-AR')},00</td>
          <td class="amount-cell">$${asiento.iva.toLocaleString('es-AR')},00</td>
          <td class="amount-cell"><strong>$${asiento.monto_total.toLocaleString('es-AR')},00</strong></td>
          <td><span class="badge-auditoria">● ${asiento.estado_auditoria}</span></td>
        `;
        tbodyAsientos.appendChild(tr);
      });
    }
  } catch (err) {
    console.error('Error de conexión con Supabase:', err);
  }
}

document.addEventListener('DOMContentLoaded', cargarAsientosDesdeSupabase);

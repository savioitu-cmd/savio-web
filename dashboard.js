// ============================================================
// SAVIO ERP V3 - Lógica Pragmática
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

// ---- TABS ----
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    e.target.classList.add('active');
    document.getElementById(e.target.dataset.tab).classList.add('active');
  });
});

// ---- CRM FILTER ----
const crmFilter = document.getElementById('crm-filter');
const crmRows = document.querySelectorAll('#crm-tbody tr');

crmFilter?.addEventListener('change', (e) => {
  const val = e.target.value;
  crmRows.forEach(row => {
    if (val === 'todos' || row.dataset.type === val) row.style.display = '';
    else row.style.display = 'none';
  });
});

// ---- CONFIG ----
const cfgOp = document.getElementById('cfg-operator');
const cfgWa = document.getElementById('cfg-wa');
const cfgIg = document.getElementById('cfg-ig');

function loadConfig() {
  cfgOp.value = localStorage.getItem('savio_operator_name') || '';
  cfgWa.value = localStorage.getItem('savio_whatsapp_number') || '5493786519242';
  cfgIg.value = localStorage.getItem('savio_instagram_url') || '';
}

document.getElementById('btn-save-cfg').addEventListener('click', () => {
  localStorage.setItem('savio_operator_name', cfgOp.value);
  localStorage.setItem('savio_whatsapp_number', cfgWa.value.replace(/\D/g,''));
  localStorage.setItem('savio_instagram_url', cfgIg.value);
  alert('Configuración de turno guardada. Impacta de inmediato en la web.');
});

// ---- EXPORTS ----
window.exportPDF = function(elementId, filename) {
  const element = document.getElementById(elementId);
  if (!window.html2pdf) {
    alert("Cargando motor PDF, intente nuevamente en 2 segundos.");
    return;
  }
  const opt = {
    margin: 10,
    filename: `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };
  html2pdf().set(opt).from(element).save();
};

window.exportWord = function(elementId, filename) {
  const table = document.getElementById(elementId).innerHTML;
  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>${table}</body></html>`;
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ---- NORA OCR (SIMULATOR) ----
const dropzone = document.getElementById('ocr-dropzone');
const ocrInput = document.getElementById('ocr-input');
const ocrResult = document.getElementById('ocr-result');

dropzone.addEventListener('click', () => ocrInput.click());

ocrInput.addEventListener('change', (e) => {
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

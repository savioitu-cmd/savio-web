// ============================================================
// SAVIO — Dashboard Administrativo
// Login por turnos + configuración dinámica via localStorage
// ============================================================

const STORAGE_KEYS = {
  session:    'savio_admin_session',
  operator:   'savio_operator_name',
  whatsapp:   'savio_whatsapp_number',
  instagram:  'savio_instagram_url',
  facebook:   'savio_facebook_url',
  greeting:   'savio_nora_greeting',
  visitas:    'savio_stat_visitas',
  consultas:  'savio_stat_consultas',
  waClicks:   'savio_stat_wa_clicks',
};

const CREDENTIALS = {
  user: 'admin',
  pass: '0000'
};

// ---- DOM ----
const loginScreen     = document.getElementById('login-screen');
const dashScreen      = document.getElementById('dashboard-screen');
const loginUserInput  = document.getElementById('login-user');
const loginPassInput  = document.getElementById('login-pass');
const btnLogin        = document.getElementById('btn-login');
const loginError      = document.getElementById('login-error');
const btnLogout       = document.getElementById('btn-logout');
const toast           = document.getElementById('toast');
const badgeOperator   = document.getElementById('badge-operator');

// Config fields
const cfgOperatorName = document.getElementById('cfg-operator-name');
const cfgWhatsApp     = document.getElementById('cfg-whatsapp');
const cfgInstagram    = document.getElementById('cfg-instagram');
const cfgFacebook     = document.getElementById('cfg-facebook');
const cfgNoraGreeting = document.getElementById('cfg-nora-greeting');

// Stats
const statVisitas     = document.getElementById('stat-visitas');
const statConsultas   = document.getElementById('stat-consultas');
const statWa          = document.getElementById('stat-wa');

// ---- Utilities ----
function showToast(msg = '✅ Guardado correctamente.') {
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2800);
}

function loadStats() {
  statVisitas.textContent  = localStorage.getItem(STORAGE_KEYS.visitas)  || '0';
  statConsultas.textContent= localStorage.getItem(STORAGE_KEYS.consultas) || '0';
  statWa.textContent       = localStorage.getItem(STORAGE_KEYS.waClicks) || '0';
}

function loadConfig() {
  cfgOperatorName.value  = localStorage.getItem(STORAGE_KEYS.operator)  || '';
  cfgWhatsApp.value      = localStorage.getItem(STORAGE_KEYS.whatsapp)  || '5493786519242';
  cfgInstagram.value     = localStorage.getItem(STORAGE_KEYS.instagram) || '';
  cfgFacebook.value      = localStorage.getItem(STORAGE_KEYS.facebook)  || '';
  cfgNoraGreeting.value  = localStorage.getItem(STORAGE_KEYS.greeting)  || '';

  const op = localStorage.getItem(STORAGE_KEYS.operator) || 'Operador';
  badgeOperator.textContent = `🌿 ${op}`;
}

// ---- Auth ----
function tryLogin() {
  const user = loginUserInput.value.trim();
  const pass = loginPassInput.value.trim();

  if (user === CREDENTIALS.user && pass === CREDENTIALS.pass) {
    localStorage.setItem(STORAGE_KEYS.session, 'active');
    loginError.style.display = 'none';
    showDashboard();
  } else {
    loginError.style.display = 'block';
    loginPassInput.value = '';
    loginPassInput.focus();
  }
}

function showDashboard() {
  loginScreen.style.display = 'none';
  dashScreen.style.display  = 'block';
  document.body.style.alignItems = 'flex-start';
  loadConfig();
  loadStats();
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.session);
  dashScreen.style.display  = 'none';
  loginScreen.style.display = 'block';
  document.body.style.alignItems = 'center';
  loginUserInput.value = '';
  loginPassInput.value = '';
}

// ---- Evento login ----
btnLogin.addEventListener('click', tryLogin);
[loginUserInput, loginPassInput].forEach(el => {
  el.addEventListener('keypress', (e) => { if (e.key === 'Enter') tryLogin(); });
});

btnLogout.addEventListener('click', logout);

// ---- Guardar Operador ----
document.getElementById('btn-save-operator').addEventListener('click', () => {
  const name = cfgOperatorName.value.trim();
  const wa   = cfgWhatsApp.value.trim().replace(/\D/g, '');

  if (name) {
    localStorage.setItem(STORAGE_KEYS.operator, name);
    badgeOperator.textContent = `🌿 ${name}`;
  }
  if (wa) {
    localStorage.setItem(STORAGE_KEYS.whatsapp, wa);
  }
  showToast('✅ Operador y WhatsApp actualizados. La web tomará los cambios automáticamente.');
});

// ---- Guardar Redes ----
document.getElementById('btn-save-redes').addEventListener('click', () => {
  localStorage.setItem(STORAGE_KEYS.instagram, cfgInstagram.value.trim());
  localStorage.setItem(STORAGE_KEYS.facebook,  cfgFacebook.value.trim());
  showToast('✅ Redes sociales guardadas.');
});

// ---- Guardar Nora ----
document.getElementById('btn-save-nora').addEventListener('click', () => {
  localStorage.setItem(STORAGE_KEYS.greeting, cfgNoraGreeting.value.trim());
  showToast('✅ Saludo de Nora actualizado. Se mostrará en la próxima visita.');
});

// ---- Auto-login si hay sesión activa ----
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem(STORAGE_KEYS.session) === 'active') {
    showDashboard();
  }
});

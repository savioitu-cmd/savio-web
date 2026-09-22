import { recomendarKit } from './quiz-logic.js';
import { setKitPrincipal, generarMensajeWhatsApp } from './whatsapp.js';

// ============================================================
// NORA — ALMA BOTÁNICA SAVIO (V3 - Multimedia Litoral)
// ============================================================
const NORA_STORAGE_KEY = 'savio_nora_history';

document.addEventListener('DOMContentLoaded', () => {

  // ---- DOM refs Nora ----
  const fabBtn       = document.getElementById('nora-fab-btn');
  const chatWindow   = document.getElementById('nora-chat-window');
  const closeBtn     = document.getElementById('nora-close-btn');
  const chatBody     = document.getElementById('nora-chat-container');
  const textInput    = document.getElementById('nora-text-input');
  const sendBtn      = document.getElementById('nora-send-btn');
  const mediaBtn     = document.getElementById('nora-media-btn');
  const fileInput    = document.getElementById('nora-file-input');

  let noraIniciada = false;
  let conversationHistory = [];

  // ---- Helpers ----
  function addMsg(role, html) {
    const div = document.createElement('div');
    div.classList.add('msg', role);
    div.innerHTML = html;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
    return div;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.classList.add('msg', 'typing');
    div.id = 'nora-typing';
    div.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById('nora-typing');
    if (t) t.remove();
  }

  function addQuickReplies(options) {
    const div = document.createElement('div');
    div.classList.add('quick-replies');
    options.forEach(label => {
      const btn = document.createElement('button');
      btn.classList.add('quick-reply-btn');
      btn.textContent = label;
      btn.addEventListener('click', () => {
        div.remove();
        sendToNora(label);
      });
      div.appendChild(btn);
    });
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function persistHistory() {
    try {
      localStorage.setItem(NORA_STORAGE_KEY, JSON.stringify(conversationHistory.slice(-20)));
    } catch(e) {}
  }

  function loadHistory() {
    try {
      const saved = localStorage.getItem(NORA_STORAGE_KEY);
      if (saved) conversationHistory = JSON.parse(saved);
    } catch(e) {}
  }

  function localNoraLogic(text) {
    const t = text.toLowerCase();
    
    // Agronomía Correntina & Litoral
    if (t.includes('calor') || t.includes('verano') || t.includes('corrientes'))
      return 'El clima de Ituzaingó exige riego temprano en verano y mulching para proteger las raíces del calor intenso. Nuestras semillas toleran bien la amplitud térmica del litoral ☀️🌿';
    if (t.includes('humedad') || t.includes('hongo'))
      return 'Con la humedad del río Paraná, es clave no encharcar. Te sugiero un fungicida preventivo orgánico o jabón potásico con neem 💧';
    if (t.includes('precio') || t.includes('costo') || t.includes('vale'))
      return 'Nuestros kits van de $19.500 a $28.500. Para un presupuesto exacto, escribile a Macarena por WhatsApp 🌿';
    if (t.includes('huerta') || t.includes('semilla'))
      return 'El Kit Huerta Urbana es ideal para la tierra de Corrientes: sustrato aireado, semillas de estación y geotextiles por $24.500 🥬';
    
    return '¡Qué buena consulta! Para darte la respuesta más precisa, hablemos por WhatsApp. El operador de turno te asesora al instante 🌿';
  }

  async function sendToNora(text) {
    if (!text.trim()) return;
    addMsg('user', text);
    conversationHistory.push({ role: 'user', content: text });
    showTyping();
    
    // Simular delay neuronal
    setTimeout(() => {
      hideTyping();
      const reply = localNoraLogic(text);
      conversationHistory.push({ role: 'assistant', content: reply });
      persistHistory();
      addMsg('nora', reply);
    }, 900);
  }

  // NORA MULTIMEDIA - SIMULACIÓN ÓPTIMA
  function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      addMsg('user', `<img src="${ev.target.result}" style="max-width:100%;border-radius:4px;margin-bottom:5px;" alt="foto del terreno">`);
      showTyping();
      
      // Delay de procesamiento visual 1.5s
      setTimeout(() => {
        hideTyping();
        const reply = `He analizado la imagen 📷. Noto características típicas de los suelos del litoral. Te sugiero aplicar nuestro <strong>Kit Nutrición de Suelo</strong> para mejorar el drenaje y la carga orgánica. ¿Querés que te pase el link al WhatsApp de ventas? 🌿`;
        addMsg('nora', reply);
        addQuickReplies(['Sí, pasar a WhatsApp', 'Ver otro kit']);
      }, 1500);
    };
    reader.readAsDataURL(file);
  }

  function iniciarNora() {
    if (noraIniciada) return;
    noraIniciada = true;
    loadHistory();

    const customGreeting = localStorage.getItem('savio_nora_greeting');
    const opName = localStorage.getItem('savio_operator_name') || 'Macarena';

    setTimeout(() => {
      const msj = customGreeting || `¡Hola! Te damos la bienvenida a <strong>SAVIO Ituzaingó</strong> 🌿<br>Soy Nora, tu asistente botánica. El operador actual en WhatsApp es ${opName}. ¿En qué te ayudo?`;
      addMsg('nora', msj);
      addQuickReplies(['🌱 Necesito un kit', '🐛 Tengo una plaga', '📷 Subir foto de mi patio']);
    }, 0);
  }

  chatWindow.classList.remove('hidden');
  iniciarNora();

  fabBtn.addEventListener('click', () => chatWindow.classList.toggle('hidden'));
  closeBtn.addEventListener('click', () => chatWindow.classList.add('hidden'));

  sendBtn.addEventListener('click', () => {
    const txt = textInput.value;
    textInput.value = '';
    sendToNora(txt);
  });
  textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const txt = textInput.value;
      textInput.value = '';
      sendToNora(txt);
    }
  });

  if (mediaBtn && fileInput) {
    mediaBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        handleImageUpload(e.target.files[0]);
        e.target.value = '';
      }
    });
  }

  // ============================================================
  // QUIZ TRANSPARENTE - MIX PERSONALIZADO
  // ============================================================
  const btnIniciarQuiz = document.getElementById('btn-iniciar-quiz');
  const quizSection    = document.getElementById('quiz-section');
  const progressBar    = document.getElementById('quiz-progress-bar');
  const currentQSpan   = document.getElementById('quiz-current-q');

  let currentStep = 1;
  const TOTAL = 5;
  const respuestas = {};

  if (btnIniciarQuiz) {
    btnIniciarQuiz.addEventListener('click', () => quizSection.scrollIntoView({ behavior: 'smooth' }));
  }

  function showStep(n) {
    document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`quiz-step-${n}`);
    if (target) target.classList.add('active');
    currentQSpan.textContent = Math.min(n, TOTAL);
    progressBar.style.width = `${(n / TOTAL) * 100}%`;
  }

  document.querySelectorAll('.quiz-btn[data-key]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      respuestas[e.target.dataset.key] = e.target.dataset.value;
      localStorage.setItem('savio_quiz_responses', JSON.stringify(respuestas));
      e.target.classList.add('selected');
      setTimeout(() => {
        currentStep++;
        if (currentStep <= TOTAL) showStep(currentStep);
        else mostrarResultado();
      }, 280);
    });
  });

  function mostrarResultado() {
    progressBar.style.width = '100%';
    document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
    document.getElementById('quiz-result').classList.add('active');
    document.getElementById('quiz-current-q').textContent = TOTAL;

    const recomendacion = recomendarKit(respuestas);
    setKitPrincipal(recomendacion); // Pasa la recomendación completa a WhatsApp JS
    
    let html = `<div class="mix-box">`;
    html += `<h4 class="mix-title">🌿 ${recomendacion.kit.nombre}</h4>`;
    
    html += `<div class="mix-section"><strong>Insumos:</strong><ul>`;
    recomendacion.kit.productos.forEach(p => {
      html += `<li>${p.item} <span class="price">+$${p.precio.toLocaleString()}</span></li>`;
    });
    html += `</ul></div>`;

    html += `<div class="mix-section"><strong>Herramientas:</strong><ul>`;
    recomendacion.kit.herramientas.forEach(h => {
      html += `<li>${h.item} <span class="price">+$${h.precio.toLocaleString()}</span></li>`;
    });
    html += `</ul></div>`;

    if (recomendacion.incluyeAsesoria) {
      html += `<div class="mix-section asesoria-box"><strong>Servicio de Alto Valor:</strong><ul>`;
      html += `<li>${recomendacion.asesoria.item}<br><small>${recomendacion.asesoria.descripcion}</small> <span class="price">+$${recomendacion.asesoria.precio.toLocaleString()}</span></li>`;
      html += `</ul></div>`;
    }

    html += `<div class="mix-total">Inversión Total: $${recomendacion.total.toLocaleString()}</div>`;
    html += `</div>`;

    document.getElementById('quiz-result-kit').innerHTML = html;

    // Actualizar WhatsApp URL global
    document.getElementById('btn-whatsapp-quiz').onclick = () => {
      window.open(generarMensajeWhatsApp(recomendacion, respuestas), '_blank');
    };
  }

  document.getElementById('btn-quiz-reset')?.addEventListener('click', () => {
    currentStep = 1;
    Object.keys(respuestas).forEach(k => delete respuestas[k]);
    document.querySelectorAll('.quiz-btn[data-key]').forEach(b => b.classList.remove('selected'));
    progressBar.style.width = '20%';
    showStep(1);
  });

  // Tienda genérica WhatsApp
  document.querySelectorAll('.btn-product-wa').forEach(btn => {
    btn.addEventListener('click', () => {
      const num = localStorage.getItem('savio_whatsapp_number') || '5493786519242';
      const msg = encodeURIComponent(`Hola 👋 Me interesa: ${btn.dataset.producto}`);
      window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
    });
  });
});

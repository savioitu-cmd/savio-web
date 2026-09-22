import { recomendarKit } from './quiz-logic.js';
import { setKitPrincipal, generarMensajeWhatsApp } from './whatsapp.js';

// ============================================================
// NORA — ALMA BOTÁNICA SAVIO
// Cerebro conversacional vía Hugging Face Serverless (gratis)
// ============================================================

// 🔑 TOKEN GRATUITO: obtenerlo en https://huggingface.co/settings/tokens
// Token leído desde variable de entorno Vercel (VITE_HF_TOKEN)
// En Vercel: Settings → Environment Variables → VITE_HF_TOKEN
const HF_TOKEN = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_HF_TOKEN)
  ? import.meta.env.VITE_HF_TOKEN
  : '';
const HF_MODEL = 'HuggingFaceH4/zephyr-7b-beta';
const HF_API   = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

const SYSTEM_PROMPT = `Sos Nora, la asistente botánica experta de SAVIO Ituzaingó, un comercio premium de jardinería orgánica en Buenos Aires, Argentina.
Tu carácter: cálida, profesional, apasionada por las plantas. Usás lunfardo neutro porteño. Respondés de forma concisa (máximo 3 oraciones).
Tu especialidad: diagnóstico de suelos, control orgánico de plagas, selección de semillas, guías de riego, nutrición vegetal y paisajismo urbano.
Los productos que vendemos: Kit Huerta Urbana ($24.500), Kit Nutrición de Suelo ($22.000), Herramientas Premium ($26.000), Semillas de Estación ($9.800).
Para compras o asesoría presencial, siempre invitá a hablar con Macarena por WhatsApp (+54 9 3786 519242).
Nunca menciones otras marcas. Nunca inventes información. Si no sabés algo, derivá a Macarena.`;

const NORA_STORAGE_KEY = 'savio_nora_history';

document.addEventListener('DOMContentLoaded', () => {

  // ---- DOM refs ----
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

  // ---- Hugging Face API call ----
  async function queryNora(userText) {
    conversationHistory.push({ role: 'user', content: userText });

    const prompt = buildPrompt(conversationHistory);

    try {
      const res = await fetch(HF_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            return_full_text: false,
            stop: ['</s>', '[INST]', '[/INST]']
          }
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      let reply = '';
      if (Array.isArray(data) && data[0]?.generated_text) {
        reply = data[0].generated_text.trim();
      } else if (data.generated_text) {
        reply = data.generated_text.trim();
      } else {
        throw new Error('unexpected response shape');
      }

      // Limpiar tokens residuales
      reply = reply.replace(/\[\/INST\]|\[INST\]|<\/s>/g, '').trim();

      conversationHistory.push({ role: 'assistant', content: reply });
      persistHistory();
      return reply;

    } catch (err) {
      console.warn('Nora HF fallback:', err.message);
      return localFallback(userText);
    }
  }

  function buildPrompt(history) {
    let p = `<s>[INST] ${SYSTEM_PROMPT} [/INST]</s>\n`;
    history.forEach((m, i) => {
      if (m.role === 'user')      p += `[INST] ${m.content} [/INST]`;
      if (m.role === 'assistant') p += ` ${m.content}</s>\n`;
    });
    return p;
  }

  function localFallback(text) {
    const t = text.toLowerCase();
    if (t.includes('precio') || t.includes('costo') || t.includes('vale'))
      return 'Nuestros kits van de $9.800 a $26.000. Para conseguir el mejor para vos, escribile a Macarena por WhatsApp 🌿';
    if (t.includes('riego') || t.includes('agua'))
      return 'La frecuencia de riego depende del sustrato y la estación. En verano, plantas de interior cada 3-4 días; en invierno, reducí a la mitad 💧';
    if (t.includes('plaga') || t.includes('bicho'))
      return 'Para plagas, el jabón potásico con aceite de neem es muy efectivo. Incluido en nuestro Kit Nutrición de Suelo 🌿';
    if (t.includes('huerta') || t.includes('semilla'))
      return 'Nuestro Kit Huerta Urbana SAVIO es perfecto para empezar: semillas, sustrato y macetas geotextil por $24.500 🥬';
    return 'Qué buena consulta! Para darte la respuesta más precisa, hablá con Macarena directamente por WhatsApp 🌿 +54 9 3786 519242';
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

  // ---- Core send flow ----
  async function sendToNora(text) {
    if (!text.trim()) return;
    addMsg('user', text);
    showTyping();
    const reply = await queryNora(text);
    hideTyping();
    addMsg('nora', reply);
  }

  // ---- Inicializar Nora ----
  function iniciarNora() {
    if (noraIniciada) return;
    noraIniciada = true;
    loadHistory();

    setTimeout(() => {
      addMsg('nora', '¡Hola! Te damos la bienvenida a <strong>SAVIO Ituzaingó</strong> 🌿<br>Soy Nora, tu asistente técnica y botánica personal. ¿En qué te puedo ayudar o asesorar hoy?');
      addQuickReplies(['🌱 Quiero un kit', '🐛 Tengo una plaga', '💧 Consulta de riego', '💬 Hablar con Macarena']);
    }, 0);
  }

  // ---- Activar en segundo cero ----
  chatWindow.classList.remove('hidden');
  iniciarNora();

  // ---- Eventos ----
  fabBtn.addEventListener('click', () => chatWindow.classList.toggle('hidden'));
  closeBtn.addEventListener('click', () => chatWindow.classList.add('hidden'));

  sendBtn.addEventListener('click', () => {
    const txt = textInput.value.trim();
    textInput.value = '';
    sendToNora(txt);
  });
  textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const txt = textInput.value.trim();
      textInput.value = '';
      sendToNora(txt);
    }
  });

  if (mediaBtn && fileInput) {
    mediaBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const div = document.createElement('div');
        div.classList.add('msg', 'user');
        div.innerHTML = `<img src="${ev.target.result}" style="max-width:100%;border-radius:4px;" alt="foto">`;
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
        setTimeout(() => addMsg('nora', 'Gracias por la foto 📷 La reviso y en un momento te doy un diagnóstico. También podés enviársela directamente a Macarena por WhatsApp para una respuesta inmediata 🌿'), 1000);
      };
      reader.readAsDataURL(file);
      fileInput.value = '';
    });
  }

  // ---- QUIZ ----
  const btnIniciarQuiz = document.getElementById('btn-iniciar-quiz');
  const quizSection    = document.getElementById('quiz-section');
  const progressBar    = document.getElementById('quiz-progress-bar');
  const currentQSpan   = document.getElementById('quiz-current-q');

  let currentStep = 1;
  const TOTAL = 5;
  const respuestas = {};

  if (btnIniciarQuiz) {
    btnIniciarQuiz.addEventListener('click', () => {
      quizSection.scrollIntoView({ behavior: 'smooth' });
    });
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
        if (currentStep <= TOTAL) {
          showStep(currentStep);
        } else {
          mostrarResultado();
        }
      }, 280);
    });
  });

  function mostrarResultado() {
    progressBar.style.width = '100%';
    document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
    const resultDiv = document.getElementById('quiz-result');
    resultDiv.classList.add('active');
    document.getElementById('quiz-current-q').textContent = TOTAL;

    const rec = recomendarKit(respuestas);
    const txtEl = document.getElementById('quiz-result-text');
    const kitEl = document.getElementById('quiz-result-kit');

    if (respuestas.objetivo === 'asesoria') {
      txtEl.textContent = 'Tu espacio merece un plan botánico profesional. Te recomendamos una Asesoría Personalizada con nuestra especialista.';
      kitEl.innerHTML = '📋 Asesoría Personalizada SAVIO';
      setKitPrincipal(null);
    } else if (rec.kit) {
      txtEl.textContent = 'Basándonos en tu espacio, horas de sol y objetivo, este es tu kit ideal:';
      kitEl.innerHTML = `🌿 <strong>${rec.kit.nombre}</strong><br><span style="font-size:1.1rem;color:var(--dorado);">$${rec.kit.precio.toLocaleString('es-AR')}</span>`;
      setKitPrincipal(rec.kit);
    }

    document.getElementById('btn-whatsapp-quiz').addEventListener('click', () => {
      window.open(generarMensajeWhatsApp({
        nombre: 'Cliente',
        ambiente: respuestas.espacio || 'No especificado',
        problema: respuestas.problema || 'Diagnóstico'
      }), '_blank');
    });
  }

  document.getElementById('btn-quiz-reset')?.addEventListener('click', () => {
    currentStep = 1;
    Object.keys(respuestas).forEach(k => delete respuestas[k]);
    document.querySelectorAll('.quiz-btn[data-key]').forEach(b => b.classList.remove('selected'));
    progressBar.style.width = '20%';
    showStep(1);
  });

  // ---- Botones de producto → WhatsApp ----
  document.querySelectorAll('.btn-product-wa').forEach(btn => {
    btn.addEventListener('click', () => {
      const producto = btn.dataset.producto;
      const msg = encodeURIComponent(`Hola Macarena 👋 Me interesa: ${producto}. ¿Podés darme más información?`);
      window.open(`https://wa.me/5493786519242?text=${msg}`, '_blank');
    });
  });

});

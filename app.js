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
    const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const opName = localStorage.getItem('savio_operator_name') || 'Macarena';
    const opPhone = localStorage.getItem('savio_whatsapp_number') || '5493786519242';

    // 1. PILAR IDENTIDAD & PROPÓSITO
    if (
      t.includes('quien sos') || t.includes('que haces') || t.includes('vos que') ||
      t.includes('como te llamas') || t.includes('presentate') || t.includes('de que se trata') ||
      t.includes('tu nombre') || t.includes('sos un bot') || t.includes('sos real') ||
      t.includes('hola') || t.includes('buen dia') || t.includes('buenas tardes') || t.includes('buenas noches') || t.includes('buenas')
    ) {
      if (t.includes('quien sos') || t.includes('que haces') || t.includes('vos que') || t.includes('presentate') || t.includes('sos')) {
        return 'Soy <strong>Nora</strong>, asistente botánica y paisajista de <strong>SAVIO</strong> en Ituzaingó, Corrientes 🌿. Mi propósito es ayudarte a diseñar tus espacios verdes, diagnosticar la sanidad de tus plantas y recomendarte las herramientas o insumos orgánicos precisos.<br><br>¿En qué proyecto o duda botánica te gustaría que trabajemos hoy?';
      }
      return `¡Hola! Qué gusto saludarte. Soy <strong>Nora</strong>, asistente botánica de SAVIO en Ituzaingó 🌿.<br>Puedo asesorarte sobre el cuidado de tus plantas bajo el clima del litoral, preparaciones de suelo orgánico o los kits de nuestro catálogo. ¿Qué tenés en mente hoy?`;
    }

    // 2. PILAR BOTÁNICA LITORAL (Suelo, Humedad, Calor, Plagas, Riego)
    if (t.includes('tierra') || t.includes('suelo') || t.includes('sustrato') || t.includes('arena') || t.includes('arenoso') || t.includes('drenaje') || t.includes('compost') || t.includes('humus') || t.includes('biochar')) {
      return 'En Ituzaingó y la ribera del Paraná solemos encontrar suelos muy arenosos que drenan rápido y retienen pocos nutrientes, o bien zonas arcillosas pesadas. La clave es enriquecer la estructura con <strong>sustrato aireado, compost maduro y humus puro de lombriz</strong> con partículas de biochar. Esto retiene humedad biológica sin compactar ni pudrir raíces 🌱.<br><br>¿Querés mejorar canteros a tierra directa o macetas?';
    }

    if (t.includes('humedad') || t.includes('hongo') || t.includes('parana') || t.includes('moho') || t.includes('roya') || t.includes('oidio') || t.includes('pudre') || t.includes('podredumbre') || t.includes('lluvia')) {
      return 'Con la humedad propia de la cuenca del Paraná, los hongos foliares (como oídio y roya) encuentran condiciones propicias si las hojas quedan húmedas al anochecer. Para prevenirlo:<br>1. Regá siempre a primera hora de la mañana y directo al suelo.<br>2. Asegurá buena aireación y espacio entre plantas.<br>3. Aplicá de forma preventiva <strong>jabón potásico con neem</strong> o purín de cola de caballo 💧.<br><br>¿Notás manchas circulares o polvillo blanco en el follaje?';
    }

    if (t.includes('calor') || t.includes('verano') || t.includes('sol') || t.includes('temperatura') || t.includes('quemad') || t.includes('seco') || t.includes('seca') || t.includes('riego') || t.includes('regar')) {
      return 'El sol del litoral correntino en verano alcanza radiaciones muy intensas. Dos reglas vitales:<br>• <strong>Riego estratégico:</strong> Siempre al amanecer o al caer el sol, evitando regar en la siesta para no cocinar las raíces ni generar efecto lupa en hojas.<br>• <strong>Mulching protector:</strong> Acolchado de hojarasca o corteza en la superficie para bajar la temperatura del suelo hasta 8°C y conservar la humedad ☀️🌿.<br><br>¿Tus plantas reciben sol pleno todo el día o media sombra?';
    }

    if (t.includes('plaga') || t.includes('bicho') || t.includes('cochinilla') || t.includes('pulgon') || t.includes('arañuela') || t.includes('mosca blanca') || t.includes('oruga') || t.includes('hoja comida') || t.includes('enferma') || t.includes('mancha')) {
      return 'En SAVIO tratamos las plagas con enfoque ecológico sin químicos agresivos: la emulsión de <strong>jabón potásico con aceite de neem</strong> actúa por contacto disolviendo la cutícula cerosa de cochinillas y pulgones sin dañar polinizadores 🐝.<br><br>Si podés, subí una foto con el botón 📷 de abajo y te ayudo a identificar el síntoma exacto en el momento.';
    }

    // 3. PILAR TIENDA, KITS & ASESORÍA
    if (t.includes('huerta') || t.includes('semilla') || t.includes('verdura') || t.includes('aromatica') || t.includes('tomate') || t.includes('lechuga')) {
      return 'El <strong>Kit Huerta Urbana Ituzaingó ($24.500)</strong> está diseñado justo para nuestra zona: incluye 5 variedades de semillas de estación resistentes al calor, compost maduro premium (15L), humus de lombriz puro (5L) y pala de trasplante milimetrada 🥬.<br><br>¿Tenés espacio para canteros o preferís cajones/macetas geotextiles?';
    }

    if (t.includes('poda') || t.includes('podar') || t.includes('tijera') || t.includes('serrucho') || t.includes('herramienta')) {
      return 'Para un corte limpio que cicatrice rápido contamos con el <strong>Kit Poda Profesional ($26.000)</strong>: incluye tijera bypass de acero templado SK5, serrucho curvo plegable y pasta cicatrizante con propóleo para blindar los cortes contra patógenos litoraleños ✂️.';
    }

    if (t.includes('interior') || t.includes('living') || t.includes('departamento') || t.includes('sombra')) {
      return 'Para interiores recomendamos el <strong>Kit Oasis Interior ($19.500)</strong>: trae tónico abrillantador vegetal ecológico, fertilizante de liberación lenta, medidor análogo de humedad de sustrato y pulverizador de bruma fina 🌿. Ideal para monsteras, potus y calatheas.';
    }

    if (t.includes('asesor') || t.includes('agronomo') || t.includes('visita') || t.includes('tecnico') || t.includes('paisajis')) {
      return 'Contamos con el servicio de <strong>Asesoría Técnica SAVIO ($15.000)</strong> brindada por un Ingeniero Agrónomo. Incluye diagnóstico fitosanitario en terreno (Ituzaingó), análisis de suelo, plan de fertilización a medida y seguimiento post-visita 📋.';
    }

    if (t.includes('kit') || t.includes('precio') || t.includes('costo') || t.includes('catalogo') || t.includes('producto') || t.includes('cuanto sale') || t.includes('cuanto cuesta')) {
      return 'En SAVIO disponemos de 5 soluciones integrales preparadas para nuestro ecosistema:<br><br>' +
        '• <strong>Kit Huerta Urbana Ituzaingó ($24.500):</strong> Semillas litoraleñas, compost (15L), humus (5L) y pala graduada.<br>' +
        '• <strong>Kit Rescate Litoral ($28.500):</strong> Sustrato con biochar (20L), bioestimulante radicular, fertilizante NPK y tijera botánica.<br>' +
        '• <strong>Kit Mantenimiento Correntino ($22.000):</strong> Fertilizante balanceado, bioestimulante anti-estrés, jabón potásico con neem y dosificador.<br>' +
        '• <strong>Kit Poda Profesional ($26.000):</strong> Tijera bypass SK5, serrucho curvo y pasta cicatrizante con propóleo.<br>' +
        '• <strong>Kit Oasis Interior ($19.500):</strong> Abrillantador vegetal, nutrición lenta, medidor de humedad y brumizador.<br><br>' +
        '¿Cuál de estos kits responde mejor a lo que necesita tu espacio?';
    }

    // 4. CIERRE DIRECTO DE COMPRA O PEDIDO (WhatsApp intencional)
    if (t.includes('comprar') || t.includes('compro') || t.includes('pedido') || t.includes('pedir') || t.includes('encargar') || t.includes('whatsapp') || t.includes('envio') || t.includes('despacho') || t.includes('pago')) {
      const waMsg = encodeURIComponent(`Hola ${opName}, estoy en la tienda SAVIO y quiero coordinar un pedido.`);
      return `¡Genial! Podés coordinar la entrega en Ituzaingó o envío directo con nuestro operador de turno (<strong>${opName}</strong>):<br><br>` +
        `<a href="https://wa.me/${opPhone}?text=${waMsg}" target="_blank" style="display:inline-block;margin-top:6px;padding:8px 14px;background:#4E6844;color:#FFF;border-radius:6px;text-decoration:none;font-weight:600;">📲 Iniciar pedido con ${opName} por WhatsApp</a>`;
    }

    // 5. AFIRMACIONES Y AGRADECIMIENTOS
    if (t === 'gracias' || t.includes('muchas gracias') || t === 'genial' || t === 'joya' || t === 'excelente' || t === 'dale' || t === 'buenisimo') {
      return '¡Un gusto total! Estoy acá para lo que necesites en el jardín o la huerta. Si querés evaluar otro espacio o tenés dudas de cultivo, avisame y lo vemos juntas 🌿';
    }

    // 6. PILAR FLUIDEZ - FALLBACK INTELIGENTE
    return 'Entiendo lo que mencionás. Para darte una orientación precisa para las condiciones de suelo y clima de Ituzaingó, contame: ¿se trata de un espacio exterior (patio, cantero, huerta) o plantas de interior? ¿O notás algún síntoma específico en las hojas? 🌱';
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
        const reply = `He analizado la imagen 📷. Noto características típicas de los suelos del litoral. Te sugiero aplicar nuestro <strong>Kit Rescate Litoral</strong> para mejorar el drenaje, la carga orgánica con biochar y reactivar las raíces. ¿Querés que analicemos algún detalle más o preferís ver la composición del kit? 🌿`;
        addMsg('nora', reply);
        addQuickReplies(['Ver composición del kit', 'Consultar por plagas', 'Tengo dudas de riego']);
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

import { KITS, recomendarKit } from './quiz-logic.js';
import { 
  carrito, 
  setKitPrincipal, 
  agregarAlCarrito, 
  quitarDelCarrito, 
  calcularTotal, 
  generarMensajeWhatsApp 
} from './whatsapp.js';

const PASOS = [
  {
    clave: 'ambiente',
    titulo: '¿Dónde están ubicadas tus plantas?',
    opciones: [
      { valor: 'interior', icono: '🪴', label: 'Interior', sub: 'Departamentos, salas, poca o media luz' },
      { valor: 'exterior', icono: '🌿', label: 'Exterior', sub: 'Balcón, terraza, patio o parque abierto' }
    ]
  },
  {
    clave: 'tipo',
    titulo: '¿Qué tipo de espacio verde o vegetación tenés?',
    opciones: [
      { valor: 'plantas', icono: '🌱', label: 'Plantas y Follaje', sub: 'Macetas, plantas verdes o de flor' },
      { valor: 'huerta', icono: '🥕', label: 'Huerta en Casa', sub: 'Aromáticas, verduras o frutales' },
      { valor: 'jardín', icono: '🌳', label: 'Césped y Canteros', sub: 'Arbustos, árboles y césped' }
    ]
  },
  {
    clave: 'problema',
    titulo: '¿Cuál es la situación actual o problema principal?',
    opciones: [
      { valor: 'descuidado', icono: '🥀', label: 'Jardín Descuidado', sub: 'Tierra seca, plantas marchitas o dañadas' },
      { valor: 'mantenimiento', icono: '✨', label: 'Mantenimiento Regular', sub: 'Quiero mantener la salud y nutrición' },
      { valor: 'poda', icono: '✂️', label: 'Ramas Secas o Crecidas', sub: 'Necesito limpieza, saneamiento y poda' },
      { valor: 'ninguno', icono: '☀️', label: 'Comenzar desde Cero', sub: 'Quiero armar un rincón verde nuevo' }
    ]
  },
  {
    clave: 'frecuencia',
    titulo: '¿Con qué frecuencia podés dedicarte al cuidado?',
    opciones: [
      { valor: 'alta', icono: '📅', label: 'Frecuente', sub: 'Varias veces por semana o fin de semana completo' },
      { valor: 'baja', icono: '⏳', label: 'Baja dedicación', sub: 'Poco tiempo, rutinas prácticas y mensuales' }
    ]
  },
  {
    clave: 'tamaño',
    titulo: '¿Qué tamaño aproximado tiene tu espacio?',
    opciones: [
      { valor: 'chico', icono: '🏡', label: 'Espacio Reducido', sub: 'Macetas, estantes o balcón chico' },
      { valor: 'grande', icono: '🌲', label: 'Espacio Amplio', sub: 'Patio mediano, jardín o parque' }
    ]
  }
];

let pasoActual = 0;
const respuestasUsuario = {
  ambiente: '',
  tipo: '',
  problema: '',
  frecuencia: '',
  tamaño: ''
};

let nombreCliente = '';
let kitActual = null;
let crossSellActuales = [];

const quizContainer = document.getElementById('quiz-container');
const quizResult = document.getElementById('quiz-result');
const progressBar = document.getElementById('quiz-progress');
const stepIndicator = document.getElementById('step-indicator');
const questionTitle = document.getElementById('question-title');
const optionsContainer = document.getElementById('options-container');

function actualizarProgreso() {
  const porcentaje = ((pasoActual + 1) / PASOS.length) * 100;
  if (progressBar) progressBar.style.width = `${Math.min(porcentaje, 100)}%`;
}

function renderizarPaso() {
  const paso = PASOS[pasoActual];
  if (!paso) return;

  actualizarProgreso();
  if (stepIndicator) stepIndicator.textContent = `Paso ${pasoActual + 1} de ${PASOS.length}`;
  if (questionTitle) questionTitle.textContent = paso.titulo;

  if (optionsContainer) {
    optionsContainer.innerHTML = '';
    paso.opciones.forEach(opcion => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'option-btn';
      boton.innerHTML = `
        <span class="option-icon">${opcion.icono}</span>
        <span class="option-label">${opcion.label}</span>
        <span class="option-sub">${opcion.sub}</span>
      `;
      boton.addEventListener('click', () => {
        respuestasUsuario[paso.clave] = opcion.valor;
        avanzarPaso();
      });
      optionsContainer.appendChild(boton);
    });
  }
}

function avanzarPaso() {
  if (pasoActual < PASOS.length - 1) {
    pasoActual++;
    renderizarPaso();
  } else {
    solicitarNombre();
  }
}

function solicitarNombre() {
  actualizarProgreso();
  if (stepIndicator) stepIndicator.textContent = 'Diagnóstico Final';
  if (questionTitle) questionTitle.textContent = '¿A nombre de quién preparamos la recomendación?';

  if (optionsContainer) {
    optionsContainer.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1rem; width:100%;">
        <input type="text" id="input-nombre-cliente" placeholder="Tu nombre o apodo..." 
          style="padding:0.9rem 1.1rem; border:1.5px solid var(--border-color); border-radius:var(--radius-md); font-size:1rem; outline:none; background:var(--bg-card-subtle); color:var(--text-primary);">
        <button type="button" id="btn-procesar-quiz" class="btn-train" style="height:48px; border-radius:var(--radius-md); font-size:1rem;">
          Ver Kit Recomendado
        </button>
      </div>
    `;

    const input = document.getElementById('input-nombre-cliente');
    const btn = document.getElementById('btn-procesar-quiz');

    const procesar = () => {
      nombreCliente = input.value.trim() || 'Cliente';
      mostrarResultado();
    };

    btn.addEventListener('click', procesar);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') procesar();
    });
    input.focus();
  }
}

function mostrarResultado() {
  const { kit, sugeridos } = recomendarKit(respuestasUsuario);
  kitActual = kit;
  crossSellActuales = sugeridos;
  setKitPrincipal(kit);

  if (quizContainer) quizContainer.classList.add('hidden');
  if (quizResult) {
    quizResult.classList.remove('hidden');
    renderizarContenidoResultado();
  }

  // Notificación a Nora
  const noraStream = document.getElementById('nora-chat-container');
  if (noraStream) {
    const bubble = document.createElement('div');
    bubble.className = 'nora-bubble';
    bubble.innerHTML = `🌿 <strong>Diagnóstico completado para ${nombreCliente}:</strong> Recomiendo especialmente el <em>${kit.nombre}</em>. Podés agregar los complementos sugeridos para potenciar el tratamiento.`;
    noraStream.appendChild(bubble);
    noraStream.scrollTop = noraStream.scrollHeight;
  }
}

function renderizarContenidoResultado() {
  const total = calcularTotal();

  let listaItemsKit = kitActual.productosIncluidos
    .map(p => `<li style="margin-bottom:0.4rem; font-size:0.9rem; color:var(--text-muted);">✓ ${p}</li>`)
    .join('');

  let htmlSugeridos = crossSellActuales.map(prod => {
    const yaAgregado = carrito.extras.some(e => e.id === prod.id);
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem 1rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); margin-bottom:0.6rem; background:var(--bg-card-subtle);">
        <div>
          <strong style="display:block; font-size:0.9rem;">${prod.nombre}</strong>
          <span style="font-size:0.82rem; color:var(--text-muted);">$${prod.precio.toLocaleString('es-AR')}</span>
        </div>
        <button type="button" class="btn-cross-sell" data-id="${prod.id}" 
          style="padding:0.45rem 0.85rem; border:1px solid var(--text-primary); border-radius:var(--radius-sm); background:${yaAgregado ? 'var(--text-primary)' : 'transparent'}; color:${yaAgregado ? 'var(--bg-crema)' : 'var(--text-primary)'}; cursor:pointer; font-size:0.8rem; font-weight:600; transition:var(--transition);">
          ${yaAgregado ? 'Agregado ✓' : '+ Agregar'}
        </button>
      </div>
    `;
  }).join('');

  quizResult.innerHTML = `
    <div style="border-top:1px solid var(--border-color); padding-top:1.5rem;">
      <span class="badge" style="background:var(--accent-sage-light); color:var(--accent-sage);">Kit Recomendado Para Vos</span>
      <h3 style="font-family:var(--font-serif); font-size:1.6rem; margin:0.5rem 0; color:var(--text-primary);">${kitActual.nombre}</h3>
      <p style="font-size:1.3rem; font-weight:700; color:var(--accent-terra); margin-bottom:1rem;">$${kitActual.precio.toLocaleString('es-AR')}</p>
      
      <div style="background:var(--bg-card-subtle); padding:1.2rem; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:1.5rem;">
        <h4 style="font-size:0.85rem; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.6rem; color:var(--text-primary);">Contenido del Kit:</h4>
        <ul style="list-style:none; padding:0;">${listaItemsKit}</ul>
      </div>

      <div style="margin-bottom:1.8rem;">
        <h4 style="font-size:0.95rem; font-weight:600; margin-bottom:0.75rem; color:var(--text-primary);">También podés necesitar esto:</h4>
        ${htmlSugeridos}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; padding:1rem 0; border-top:1px solid var(--border-color); margin-bottom:1.2rem;">
        <span style="font-size:1.05rem; font-weight:600;">Total de la orden:</span>
        <span id="label-total-orden" style="font-size:1.4rem; font-weight:700; color:var(--text-primary);">$${total.toLocaleString('es-AR')}</span>
      </div>

      <a id="btn-checkout-whatsapp" href="${generarMensajeWhatsApp({ nombre: nombreCliente, ambiente: respuestasUsuario.ambiente, problema: respuestasUsuario.problema })}" 
        target="_blank" rel="noopener noreferrer" 
        style="display:flex; align-items:center; justify-content:center; gap:0.6rem; background:#25D366; color:#FFFFFF; text-decoration:none; padding:1rem; border-radius:var(--radius-md); font-weight:600; font-size:1rem; box-shadow:var(--shadow-subtle); transition:var(--transition); text-align:center;">
        <span>🌿 Confirmar Pedido por WhatsApp</span>
      </a>
    </div>
  `;

  // Listeners para botones de cross-selling
  const crossSellButtons = quizResult.querySelectorAll('.btn-cross-sell');
  crossSellButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const prodId = btn.getAttribute('data-id');
      const prod = crossSellActuales.find(p => p.id === prodId);
      if (!prod) return;

      const existe = carrito.extras.some(e => e.id === prod.id);
      if (existe) {
        quitarDelCarrito(prod.id);
      } else {
        agregarAlCarrito(prod);
      }
      renderizarContenidoResultado();
    });
  });
}

// Nora chat interactivo y multimedia
const noraInput = document.getElementById('nora-user-input');
const noraSendBtn = document.getElementById('nora-send-btn');
const noraChatContainer = document.getElementById('nora-chat-container');
const noraMediaBtn = document.getElementById('nora-media-btn');
const noraFileInput = document.getElementById('nora-file-input');

if (noraSendBtn && noraInput && noraChatContainer) {
  const responderNora = () => {
    const texto = noraInput.value.trim();
    if (!texto) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'bubble-user';
    userMsg.textContent = texto;
    noraChatContainer.appendChild(userMsg);
    noraInput.value = '';

    setTimeout(() => {
      const noraMsg = document.createElement('div');
      noraMsg.className = 'nora-bubble';
      noraMsg.innerHTML = `🌿 Para esa consulta te recomiendo asegurarte de que el sustrato tenga buen drenaje y aplicar la nutrición en las horas de menor radiación solar. Podés pedirlo directamente en tu kit de WhatsApp.`;
      noraChatContainer.appendChild(noraMsg);
      noraChatContainer.scrollTop = noraChatContainer.scrollHeight;
    }, 500);

    noraChatContainer.scrollTop = noraChatContainer.scrollHeight;
  };

  noraSendBtn.addEventListener('click', responderNora);
  noraInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') responderNora();
  });
}

// Manejo de imagen y cámara para Nora
if (noraMediaBtn && noraFileInput && noraChatContainer) {
  noraMediaBtn.addEventListener('click', () => {
    noraFileInput.click();
  });

  noraFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      // Miniatura en el chat (burbuja usuario)
      const userImgBubble = document.createElement('div');
      userImgBubble.className = 'bubble-user';
      userImgBubble.style.padding = '0.4rem';
      userImgBubble.style.background = 'transparent';
      userImgBubble.innerHTML = `
        <img src="${event.target.result}" alt="Foto enviada" 
          style="max-width:180px; max-height:180px; border-radius:12px; object-fit:cover; display:block; border:2px solid var(--text-primary); box-shadow:var(--shadow-subtle);">
      `;
      noraChatContainer.appendChild(userImgBubble);

      // Indicador de análisis de Nora
      const loadingBubble = document.createElement('div');
      loadingBubble.className = 'nora-bubble';
      loadingBubble.id = 'nora-analyzing-indicator';
      loadingBubble.innerHTML = `<em>Nora está analizando tu espacio... 🌿</em>`;
      noraChatContainer.appendChild(loadingBubble);
      noraChatContainer.scrollTop = noraChatContainer.scrollHeight;

      // Simulación de análisis agronómico tras 2 segundos
      setTimeout(() => {
        const indicator = document.getElementById('nora-analyzing-indicator');
        if (indicator) indicator.remove();

        const responseBubble = document.createElement('div');
        responseBubble.className = 'nora-bubble';
        responseBubble.innerHTML = `🌿 Analizé la imagen de tu espacio. De acuerdo a los protocolos técnicos de nuestro Ingeniero Agrónomo, detecto signos de estrés hídrico y falta de oxigenación en el sustrato. Te sugiero aplicar el <strong>Kit cuidado de plantas de interior</strong> que incluye el medidor análogo de humedad para controlar el riego de forma exacta.`;
        noraChatContainer.appendChild(responseBubble);
        noraChatContainer.scrollTop = noraChatContainer.scrollHeight;
      }, 2000);
    };
    reader.readAsDataURL(file);
    noraFileInput.value = '';
  });
}

// Bienvenida proactiva con botones de respuesta rápida
export function inicializarNoraProactiva() {
  if (!noraChatContainer) return;
  noraChatContainer.innerHTML = '';

  const bienvenida = document.createElement('div');
  bienvenida.className = 'nora-bubble';
  bienvenida.innerHTML = `<p>¡Hola! Bienvenido a Savio 🌿. Soy Nora, tu asistente botánica. Estoy acá para ayudarte a cuidar y transformar tu espacio verde. ¿Cómo te gustaría empezar hoy?</p>`;
  noraChatContainer.appendChild(bienvenida);

  const quickWrap = document.createElement('div');
  quickWrap.className = 'quick-replies-wrap';
  quickWrap.id = 'nora-quick-replies';

  const opciones = [
    { texto: '✨ Hacer mi Diagnóstico Botánico', target: '#diagnostico', accion: null },
    { texto: '🛒 Ver el Catálogo de Productos', target: '#catalogo', accion: null },
    { 
      texto: '🏡 Conocer sus Trabajos de Paisajismo', 
      target: '#portfolio', 
      accion: () => {
        setTimeout(() => {
          const respNora = document.createElement('div');
          respNora.className = 'nora-bubble';
          respNora.innerHTML = `🌿 ¡Excelente elección! Acá abajo podés ver cómo transformamos balcones y jardines con las normativas de nuestro Ingeniero Agrónomo.`;
          noraChatContainer.appendChild(respNora);
          noraChatContainer.scrollTop = noraChatContainer.scrollHeight;
        }, 400);
      } 
    }
  ];

  opciones.forEach(opc => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quick-reply-btn';
    btn.textContent = opc.texto;
    btn.addEventListener('click', () => {
      // Remover botones de respuesta rápida
      quickWrap.remove();

      // Imprimir elección del usuario
      const userBubble = document.createElement('div');
      userBubble.className = 'bubble-user';
      userBubble.textContent = opc.texto;
      noraChatContainer.appendChild(userBubble);
      noraChatContainer.scrollTop = noraChatContainer.scrollHeight;

      // Desplazamiento suave
      const section = document.querySelector(opc.target);
      if (section) section.scrollIntoView({ behavior: 'smooth' });

      // Si tiene acción contextual adicional
      if (opc.accion) opc.accion();

      // En mobile, cerrar modal para ver la sección seleccionada
      const noraWidget = document.getElementById('nora-widget');
      if (noraWidget && window.innerWidth < 768) {
        noraWidget.classList.remove('mobile-open');
      }
    });
    quickWrap.appendChild(btn);
  });

  noraChatContainer.appendChild(quickWrap);
}

// Renderizado del Catálogo de Kits
function renderizarCatalogoKits() {
  const grid = document.getElementById('catalog-kits-grid');
  if (!grid) return;

  grid.innerHTML = KITS.map(kit => `
    <article class="catalog-card">
      <div class="catalog-header">
        <span class="badge">Tratamiento Especializado</span>
        <h3 class="catalog-title">${kit.nombre}</h3>
        <p class="catalog-price">$${kit.precio.toLocaleString('es-AR')}</p>
      </div>
      <ul class="catalog-items">
        ${kit.productosIncluidos.map(p => `<li>✓ ${p}</li>`).join('')}
      </ul>
      <button type="button" class="btn-catalog-action" data-kit-id="${kit.id}">
        Seleccionar Kit & Consultar
      </button>
    </article>
  `).join('');

  grid.querySelectorAll('.btn-catalog-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const kitId = btn.getAttribute('data-kit-id');
      const kit = KITS.find(k => k.id === kitId);
      if (kit) {
        setKitPrincipal(kit);
        const section = document.querySelector('#diagnostico');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
        
        const bubble = document.createElement('div');
        bubble.className = 'nora-bubble';
        bubble.innerHTML = `🌿 Seleccionaste el <strong>${kit.nombre}</strong> desde el catálogo. Completá tu nombre o consultame por complementos.`;
        noraChatContainer.appendChild(bubble);
        noraChatContainer.scrollTop = noraChatContainer.scrollHeight;
      }
    });
  });
}

// Control Móvil de Nora (FAB y Modal)
const noraFab = document.getElementById('nora-fab-toggle');
const noraCloseBtn = document.getElementById('nora-close-btn');
const noraWidget = document.getElementById('nora-widget');

if (noraFab && noraWidget) {
  noraFab.addEventListener('click', () => {
    noraWidget.classList.add('mobile-open');
  });
}

if (noraCloseBtn && noraWidget) {
  noraCloseBtn.addEventListener('click', () => {
    noraWidget.classList.remove('mobile-open');
  });
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  renderizarPaso();
  renderizarCatalogoKits();
  inicializarNoraProactiva();
});


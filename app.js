import { recomendarKit } from './quiz-logic.js';
import { setKitPrincipal, generarMensajeWhatsApp } from './whatsapp.js';

document.addEventListener('DOMContentLoaded', () => {
  // --- NORA CHATBOT LOGIC ---
  const fabBtn = document.getElementById('nora-fab-btn');
  const chatWindow = document.getElementById('nora-chat-window');
  const closeBtn = document.getElementById('nora-close-btn');
  const chatContainer = document.getElementById('nora-chat-container');
  const textInput = document.getElementById('nora-text-input');
  const sendBtn = document.getElementById('nora-send-btn');
  const mediaBtn = document.getElementById('nora-media-btn');
  const fileInput = document.getElementById('nora-file-input');

  let noraIniciada = false;

  function toggleChat() {
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden') && !noraIniciada) {
      iniciarNora();
    }
  }

  fabBtn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', () => chatWindow.classList.add('hidden'));

  function agregarMensaje(remitente, texto) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('msg', remitente);
    msgDiv.textContent = texto;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function agregarQuickReplies() {
    const btnJardineria = document.createElement('button');
    btnJardineria.textContent = 'Jardinería';
    btnJardineria.classList.add('quiz-btn');
    btnJardineria.style.padding = '0.5rem';
    btnJardineria.style.marginRight = '0.5rem';
    btnJardineria.style.fontSize = '0.9rem';
    btnJardineria.addEventListener('click', () => {
      qrContainer.style.display = 'none';
      handleQuickReply('Jardinería');
    });

    const btnAsesoria = document.createElement('button');
    btnAsesoria.textContent = 'Asesoría';
    btnAsesoria.classList.add('quiz-btn');
    btnAsesoria.style.padding = '0.5rem';
    btnAsesoria.style.fontSize = '0.9rem';
    btnAsesoria.addEventListener('click', () => {
      qrContainer.style.display = 'none';
      handleQuickReply('Asesoría');
    });

    const qrContainer = document.createElement('div');
    qrContainer.style.marginTop = '0.5rem';
    qrContainer.appendChild(btnJardineria);
    qrContainer.appendChild(btnAsesoria);
    
    chatContainer.appendChild(qrContainer);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function handleQuickReply(opcion) {
    agregarMensaje('user', opcion);
    setTimeout(() => {
      agregarMensaje('nora', `¡Perfecto! Te sugiero iniciar nuestro Diagnóstico Rápido en pantalla para que podamos recomendarte la mejor opción de ${opcion}.`);
    }, 800);
  }

  function iniciarNora() {
    noraIniciada = true;
    agregarMensaje('nora', '¡Hola! Soy Nora, tu asistente en SAVIO. ¿Qué te gustaría consultar hoy?');
    agregarQuickReplies();
  }

  // Activar en segundo cero
  setTimeout(() => {
    chatWindow.classList.remove('hidden');
    iniciarNora();
  }, 0);

  function enviarMensaje() {
    const texto = textInput.value.trim();
    if (texto === '') return;
    agregarMensaje('user', texto);
    textInput.value = '';
    // Respuesta RAG simulada por localStorage (costo cero)
    setTimeout(() => {
      agregarMensaje('nora', 'He guardado tu consulta en mi memoria. Te recomiendo realizar el diagnóstico de la página principal o contactar a Macarena por WhatsApp para una asesoría personalizada.');
    }, 1200);
  }

  sendBtn.addEventListener('click', enviarMensaje);
  textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') enviarMensaje();
  });

  // --- QUIZ LOGIC ---
  const btnIniciarQuiz = document.getElementById('btn-iniciar-quiz');
  const quizSection = document.getElementById('quiz-section');
  const quizProgress = document.getElementById('quiz-current-q');
  
  let currentStep = 1;
  const totalSteps = 5;
  const respuestas = {};

  if(btnIniciarQuiz) {
    btnIniciarQuiz.addEventListener('click', () => {
      document.getElementById('inicio').classList.add('hidden');
      quizSection.classList.remove('hidden');
    });
  }

  const quizBtns = document.querySelectorAll('.quiz-btn[data-key]');
  quizBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const key = e.target.getAttribute('data-key');
      const value = e.target.getAttribute('data-value');
      respuestas[key] = value;
      
      localStorage.setItem('savio_quiz_responses', JSON.stringify(respuestas));
      
      e.target.classList.add('selected');
      
      setTimeout(() => {
        document.getElementById(`quiz-step-${currentStep}`).classList.add('hidden');
        currentStep++;
        
        if(currentStep <= totalSteps) {
          document.getElementById(`quiz-step-${currentStep}`).classList.remove('hidden');
          quizProgress.textContent = currentStep;
        } else {
          mostrarResultados();
        }
      }, 300);
    });
  });

  function mostrarResultados() {
    document.getElementById('quiz-progress').classList.add('hidden');
    const resultStep = document.getElementById('quiz-result');
    resultStep.classList.remove('hidden');
    
    const recomendacion = recomendarKit(respuestas);
    
    const resultText = document.getElementById('quiz-result-text');
    const resultKit = document.getElementById('quiz-result-kit');
    
    if (respuestas.objetivo === 'asesoria') {
      resultText.textContent = "Según tus respuestas, tu espacio necesita una planificación detallada.";
      resultKit.innerHTML = "Recomendación: <strong>Asesoría Personalizada SAVIO</strong>";
      setKitPrincipal(null);
    } else {
      resultText.textContent = "Hemos analizado tu espacio y horas de sol.";
      resultKit.innerHTML = `Kit Recomendado: <br><strong>${recomendacion.kit.nombre}</strong><br>Precio: $${recomendacion.kit.precio.toLocaleString('es-AR')}`;
      setKitPrincipal(recomendacion.kit);
    }

    const btnWhatsAppQuiz = document.getElementById('btn-whatsapp-quiz');
    btnWhatsAppQuiz.addEventListener('click', () => {
      const link = generarMensajeWhatsApp({
        nombre: 'Cliente',
        ambiente: respuestas.espacio || 'No especificado',
        problema: respuestas.problema || 'Mantenimiento'
      });
      window.open(link, '_blank');
    });
  }
});

/**
 * ═══════════════════════════════════════════════════════════════
 * MESEROS EVENTOS — Cotizador Inteligente
 * 
 * Arquitectura modular con Single Responsibility Principle.
 * Preparado para futura integración con API/Backend.
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

/* ─────────────────────────────────────────
   CONFIG — Constantes y configuración
   ───────────────────────────────────────── */
const CONFIG = Object.freeze({
  // Reglas de negocio
  MESAS_POR_MESERO: 4,
  INVITADOS_POR_BARRA: 100,
  PERSONAL_BARRA_POR_GRUPO: 2,

  // WhatsApp
  WHATSAPP_NUMBER: '5219981447597',
  WHATSAPP_BASE_URL: 'https://wa.me/',

  // Validaciones
  TELEFONO_LENGTH: 10,
  NOMBRE_MIN_LENGTH: 3,

  // Selectores del DOM
  SELECTORS: {
    form: '#cotizadorForm',
    nombre: '#nombre',
    telefono: '#telefono',
    fecha: '#fecha',
    lugar: '#lugar',
    mesas: '#mesas',
    invitados: '#invitados',
    barraSi: '#barraSi',
    barraNo: '#barraNo',
    horaInicio: '#horaInicio',
    horaFin: '#horaFin',
    resultMeseros: '#resultMeseros',
    resultMeserosText: '#resultMeserosText',
    resultBarra: '#resultBarra',
    resultBarraText: '#resultBarraText',
    barraHint: '#barraHint',
    resultDuracion: '#resultDuracion',
    resultDuracionText: '#resultDuracionText',
    resumenPreview: '#resumenPreview',
    resumenContent: '#resumenContent',
    btnEnviar: '#btnEnviar',
    navbar: '#navbar',
    navToggle: '#navToggle',
    navMenu: '#navMenu',
  },
});


/* ─────────────────────────────────────────
   DOM — Cached element references
   ───────────────────────────────────────── */
const DOM = {};

function cacheDOMElements() {
  for (const [key, selector] of Object.entries(CONFIG.SELECTORS)) {
    DOM[key] = document.querySelector(selector);
  }
}


/* ─────────────────────────────────────────
   FORM DATA — Obtener datos del formulario
   ───────────────────────────────────────── */

/**
 * Recopila todos los datos del formulario de cotización.
 * @returns {Object} Datos estructurados del formulario.
 */
function getFormData() {
  return {
    nombre: DOM.nombre.value.trim(),
    telefono: DOM.telefono.value.trim(),
    fecha: DOM.fecha.value,
    lugar: DOM.lugar.value.trim(),
    mesas: parseInt(DOM.mesas.value, 10) || 0,
    invitados: parseInt(DOM.invitados.value, 10) || 0,
    barra: DOM.barraSi.checked,
    horaInicio: DOM.horaInicio.value,
    horaFin: DOM.horaFin.value,
  };
}


/* ─────────────────────────────────────────
   VALIDATION — Validar datos del formulario
   ───────────────────────────────────────── */

/**
 * Muestra un error en un campo específico.
 * @param {string} fieldId - ID del campo (sin #).
 * @param {string} message - Mensaje de error.
 */
function showFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorSpan = document.getElementById(`${fieldId}Error`);

  if (input) {
    input.classList.add('form-group__input--error');
  }
  if (errorSpan) {
    errorSpan.textContent = message;
  }
}

/**
 * Limpia todos los errores del formulario.
 */
function clearAllErrors() {
  const errorSpans = document.querySelectorAll('.form-group__error');
  const errorInputs = document.querySelectorAll('.form-group__input--error');

  errorSpans.forEach(span => (span.textContent = ''));
  errorInputs.forEach(input => input.classList.remove('form-group__input--error'));
}

/**
 * Valida los datos del formulario.
 * @param {Object} data - Datos del formulario.
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
function validateForm(data) {
  const errors = [];

  // Nombre
  if (!data.nombre || data.nombre.length < CONFIG.NOMBRE_MIN_LENGTH) {
    errors.push('nombre');
    showFieldError('nombre', 'Ingresa tu nombre completo.');
  }

  // Teléfono
  if (!data.telefono || !/^\d{10}$/.test(data.telefono)) {
    errors.push('telefono');
    showFieldError('telefono', 'Ingresa un teléfono válido de 10 dígitos.');
  }

  // Fecha
  if (!data.fecha) {
    errors.push('fecha');
    showFieldError('fecha', 'Selecciona la fecha del evento.');
  } else {
    const eventDate = new Date(data.fecha);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventDate < today) {
      errors.push('fecha');
      showFieldError('fecha', 'La fecha debe ser futura.');
    }
  }

  // Lugar
  if (!data.lugar) {
    errors.push('lugar');
    showFieldError('lugar', 'Indica el lugar del evento.');
  }

  // Mesas
  if (!data.mesas || data.mesas < 1) {
    errors.push('mesas');
    showFieldError('mesas', 'Ingresa al menos 1 mesa.');
  }

  // Invitados
  if (!data.invitados || data.invitados < 1) {
    errors.push('invitados');
    showFieldError('invitados', 'Ingresa el número de invitados.');
  }

  // Hora inicio
  if (!data.horaInicio) {
    errors.push('horaInicio');
    showFieldError('horaInicio', 'Selecciona la hora de inicio.');
  }

  // Hora fin
  if (!data.horaFin) {
    errors.push('horaFin');
    showFieldError('horaFin', 'Selecciona la hora de finalización.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}


/* ─────────────────────────────────────────
   CÁLCULOS — Lógica de negocio
   ───────────────────────────────────────── */

/**
 * Calcula el número de meseros según las mesas.
 * Regla: 1 mesero por cada 4 mesas.
 * @param {number} mesas - Número de mesas.
 * @returns {number} Meseros necesarios.
 */
function calcularMeseros(mesas) {
  if (!mesas || mesas <= 0) return 0;
  return Math.ceil(mesas / CONFIG.MESAS_POR_MESERO);
}

/**
 * Calcula el personal de barra según los invitados.
 * Regla: 2 personas de barra por cada 100 invitados.
 * @param {number} invitados - Número de invitados.
 * @returns {number} Personal de barra necesario.
 */
function calcularBarra(invitados) {
  if (!invitados || invitados <= 0) return 0;
  return Math.ceil(invitados / CONFIG.INVITADOS_POR_BARRA) * CONFIG.PERSONAL_BARRA_POR_GRUPO;
}

/**
 * Calcula la duración del evento en horas.
 * Considera que el evento puede terminar al día siguiente.
 * @param {string} horaInicio - Hora de inicio en formato HH:mm.
 * @param {string} horaFin - Hora de fin en formato HH:mm.
 * @returns {number} Duración en horas.
 */
function calcularDuracion(horaInicio, horaFin) {
  if (!horaInicio || !horaFin) return 0;
  
  const [horasInicio, minutosInicio] = horaInicio.split(':').map(Number);
  const [horasFin, minutosFin] = horaFin.split(':').map(Number);
  
  let minutosInicioTotal = horasInicio * 60 + minutosInicio;
  let minutosFinTotal = horasFin * 60 + minutosFin;
  
  // Si la hora de fin es menor, asumimos que es al día siguiente
  if (minutosFinTotal <= minutosInicioTotal) {
    minutosFinTotal += 24 * 60; // Agregar 24 horas
  }
  
  const duracionMinutos = minutosFinTotal - minutosInicioTotal;
  const duracionHoras = duracionMinutos / 60;
  
  return Math.round(duracionHoras * 10) / 10; // Redondear a 1 decimal
}


/* ─────────────────────────────────────────
   RESUMEN — Generar resumen del evento
   ───────────────────────────────────────── */

/**
 * Formatea una fecha ISO a formato legible en español.
 * @param {string} dateStr - Fecha en formato YYYY-MM-DD.
 * @returns {string} Fecha formateada.
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('es-MX', options);
}

/**
 * Formatea hora de 24h a formato 12h AM/PM.
 * @param {string} time24 - Hora en formato HH:mm.
 * @returns {string} Hora formateada.
 */
function formatTime(time24) {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Genera un resumen estructurado del evento.
 * @param {Object} data - Datos del formulario.
 * @returns {Object} Resumen con todos los cálculos.
 */
function generarResumen(data) {
  const meseros = calcularMeseros(data.mesas);
  const personalBarra = data.barra ? calcularBarra(data.invitados) : 0;

  return {
    nombre: data.nombre,
    telefono: data.telefono,
    fecha: formatDate(data.fecha),
    fechaRaw: data.fecha,
    lugar: data.lugar,
    mesas: data.mesas,
    meseros,
    invitados: data.invitados,
    barra: data.barra,
    personalBarra,
    horaInicio: formatTime(data.horaInicio),
    horaFin: formatTime(data.horaFin),
    horario: `${formatTime(data.horaInicio)} - ${formatTime(data.horaFin)}`,
  };
}


/* ─────────────────────────────────────────
   RESUMEN HTML — Mostrar preview
   ───────────────────────────────────────── */

/**
 * Muestra el resumen del evento en el DOM.
 * @param {Object} resumen - Resumen generado.
 */
function mostrarResumenPreview(resumen) {
  const barraLine = resumen.barra
    ? `<div class="preview-line">🍹 <strong>Personal de barra:</strong> ${resumen.personalBarra} persona(s)</div>`
    : '';

  DOM.resumenContent.innerHTML = `
    <div class="preview-line">👤 <strong>Nombre:</strong> ${resumen.nombre}</div>
    <div class="preview-line">📞 <strong>Teléfono:</strong> ${resumen.telefono}</div>
    <div class="preview-line">📅 <strong>Fecha:</strong> ${resumen.fecha}</div>
    <div class="preview-line">📍 <strong>Lugar:</strong> ${resumen.lugar}</div>
    <div class="preview-line">🍽 <strong>Mesas:</strong> ${resumen.mesas}</div>
    <div class="preview-line">👨‍🍳 <strong>Meseros asignados:</strong> ${resumen.meseros}</div>
    <div class="preview-line">👥 <strong>Invitados:</strong> ${resumen.invitados}</div>
    ${barraLine}
    <div class="preview-line">⏰ <strong>Horario:</strong> ${resumen.horario}</div>
  `;

  DOM.resumenPreview.style.display = 'block';
  DOM.resumenPreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}


/* ─────────────────────────────────────────
   WHATSAPP — Construir y enviar mensaje
   ───────────────────────────────────────── */

/**
 * Construye el mensaje de WhatsApp con formato profesional.
 * @param {Object} resumen - Resumen del evento.
 * @returns {string} Mensaje formateado para WhatsApp.
 */
function buildWhatsAppMessage(resumen) {
  let message = `Hola, me gustaría cotizar un evento:\n\n`;
  message += `👤 *Nombre:* ${resumen.nombre}\n`;
  message += `📞 *Teléfono:* ${resumen.telefono}\n`;
  message += `📅 *Fecha:* ${resumen.fecha}\n`;
  message += `📍 *Lugar:* ${resumen.lugar}\n`;
  message += `🍽 *Mesas:* ${resumen.mesas}\n`;
  message += `👨‍🍳 *Meseros asignados:* ${resumen.meseros}\n`;
  message += `👥 *Invitados:* ${resumen.invitados}\n`;

  if (resumen.barra) {
    message += `🍹 *Personal de barra:* ${resumen.personalBarra} persona(s)\n`;
  }

  message += `⏰ *Horario:* ${resumen.horario}\n`;
  message += `\nQuedo pendiente de información y disponibilidad. ✨`;

  return message;
}

/**
 * Redirige a WhatsApp con el mensaje codificado.
 * @param {string} message - Mensaje a enviar.
 */
function enviarWhatsApp(message) {
  const encodedMessage = encodeURIComponent(message);
  const url = `${CONFIG.WHATSAPP_BASE_URL}${CONFIG.WHATSAPP_NUMBER}?text=${encodedMessage}`;

  window.open(url, '_blank');
}


/* ─────────────────────────────────────────
   DYNAMIC UI — Actualización en tiempo real
   ───────────────────────────────────────── */

/**
 * Actualiza el cálculo dinámico de meseros al cambiar el número de mesas.
 */
function actualizarMeseros() {
  const mesas = parseInt(DOM.mesas.value, 10);

  if (mesas && mesas > 0) {
    const meseros = calcularMeseros(mesas);
    DOM.resultMeserosText.textContent = `Para ${mesas} mesa(s) se asignarán ${meseros} mesero(s).`;
    DOM.resultMeseros.style.display = 'flex';
  } else {
    DOM.resultMeseros.style.display = 'none';
  }
}

/**
 * Actualiza el cálculo dinámico de personal de barra.
 */
function actualizarBarra() {
  const invitados = parseInt(DOM.invitados.value, 10);
  const barraActiva = DOM.barraSi.checked;

  if (barraActiva && invitados && invitados > 0) {
    const personalBarra = calcularBarra(invitados);
    DOM.resultBarraText.textContent = `Se asignarán ${personalBarra} persona(s) de barra.`;
    DOM.resultBarra.style.display = 'flex';
    DOM.barraHint.style.display = 'block';
  } else {
    DOM.resultBarra.style.display = 'none';
    DOM.barraHint.style.display = barraActiva ? 'block' : 'none';
  }
}

/**
 * Actualiza el cálculo dinámico de duración del evento.
 */
function actualizarDuracion() {
  const horaInicio = DOM.horaInicio.value;
  const horaFin = DOM.horaFin.value;

  if (horaInicio && horaFin) {
    const duracion = calcularDuracion(horaInicio, horaFin);
    const duracionTexto = duracion % 1 === 0 ? duracion : duracion.toFixed(1);
    DOM.resultDuracionText.textContent = `El servicio duraría ${duracionTexto} hora(s).`;
    DOM.resultDuracion.style.display = 'flex';
  } else {
    DOM.resultDuracion.style.display = 'none';
  }
}


/* ─────────────────────────────────────────
   NAVBAR — Comportamiento de navegación
   ───────────────────────────────────────── */

/**
 * Inicializa el comportamiento del navbar.
 */
function initNavbar() {
  // Scroll effect
  let lastScrollY = 0;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 50) {
      DOM.navbar.classList.add('navbar--scrolled');
    } else {
      DOM.navbar.classList.remove('navbar--scrolled');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });

  // Mobile menu toggle
  DOM.navToggle.addEventListener('click', () => {
    const isOpen = DOM.navMenu.classList.toggle('navbar__menu--open');
    DOM.navToggle.classList.toggle('navbar__toggle--active');
    DOM.navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu on link click
  DOM.navMenu.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', () => {
      DOM.navMenu.classList.remove('navbar__menu--open');
      DOM.navToggle.classList.remove('navbar__toggle--active');
      DOM.navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!DOM.navMenu.contains(e.target) && !DOM.navToggle.contains(e.target)) {
      DOM.navMenu.classList.remove('navbar__menu--open');
      DOM.navToggle.classList.remove('navbar__toggle--active');
      DOM.navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}


/* ─────────────────────────────────────────
   SCROLL REVEAL — Animaciones al scroll
   ───────────────────────────────────────── */

/**
 * Inicializa animaciones de entrada al hacer scroll.
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll(
    '.servicio-card, .galeria__item, .form-block, .section-header'
  );

  revealElements.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  revealElements.forEach(el => observer.observe(el));
}


/* ─────────────────────────────────────────
   FORM HANDLERS — Manejo del formulario
   ───────────────────────────────────────── */

/**
 * Maneja el envío del formulario.
 * @param {Event} event - Evento de submit.
 */
function handleFormSubmit(event) {
  event.preventDefault();

  // Limpiar errores previos
  clearAllErrors();

  // Obtener datos
  const data = getFormData();

  // Validar
  const validation = validateForm(data);

  if (!validation.isValid) {
    // Scroll al primer error
    const firstErrorField = document.getElementById(validation.errors[0]);
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstErrorField.focus();
    }
    return;
  }

  // Generar resumen
  const resumen = generarResumen(data);

  // Mostrar preview
  mostrarResumenPreview(resumen);

  // Construir mensaje WhatsApp
  const message = buildWhatsAppMessage(resumen);

  // Enviar a WhatsApp con un pequeño delay para que se vea el resumen
  setTimeout(() => {
    enviarWhatsApp(message);
  }, 800);
}

/**
 * Limpia el error de un campo al escribir.
 * @param {Event} event - Evento de input.
 */
function handleInputChange(event) {
  const input = event.target;
  const errorSpan = document.getElementById(`${input.id}Error`);

  input.classList.remove('form-group__input--error');
  if (errorSpan) {
    errorSpan.textContent = '';
  }
}


/* ─────────────────────────────────────────
   DATE CONSTRAINTS — Restricciones de fecha
   ───────────────────────────────────────── */

/**
 * Establece la fecha mínima como hoy.
 */
function setMinDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  DOM.fecha.setAttribute('min', `${yyyy}-${mm}-${dd}`);
}


/* ─────────────────────────────────────────
   INITIALIZATION — Punto de entrada
   ───────────────────────────────────────── */

/**
 * Inicializa toda la aplicación.
 * Punto de entrada principal.
 */
function init() {
  // Cache DOM
  cacheDOMElements();

  // Navbar
  initNavbar();

  // Scroll reveal
  initScrollReveal();

  // Fecha mínima
  setMinDate();

  // Event listeners — Cálculos dinámicos
  DOM.mesas.addEventListener('input', actualizarMeseros);
  DOM.invitados.addEventListener('input', actualizarBarra);
  DOM.barraSi.addEventListener('change', actualizarBarra);
  DOM.barraNo.addEventListener('change', actualizarBarra);
  DOM.horaInicio.addEventListener('input', actualizarDuracion);
  DOM.horaFin.addEventListener('input', actualizarDuracion);

  // Event listeners — Limpiar errores al escribir
  const formInputs = DOM.form.querySelectorAll('.form-group__input');
  formInputs.forEach(input => {
    input.addEventListener('input', handleInputChange);
  });

  // Event listener — Submit
  DOM.form.addEventListener('submit', handleFormSubmit);

  // Log de inicialización (para desarrollo)
  console.log('✦ Meseros Yucatán — Cotizador inicializado correctamente.');
}

// Arrancar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);


/* ─────────────────────────────────────────
   API READY — Preparado para backend
   ───────────────────────────────────────── 
   
   Para integración futura con backend:
   
   async function enviarCotizacion(data) {
     try {
       const response = await fetch('/api/cotizaciones', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(data),
       });
       
       if (!response.ok) throw new Error('Error al enviar cotización');
       
       return await response.json();
     } catch (error) {
       console.error('Error:', error);
       throw error;
     }
   }
*/

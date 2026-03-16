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
  WHATSAPP_NUMBER: '5219991553227',
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
    personalBarra: '#personalBarra',
    horaInicio: '#horaInicio',
    horaFin: '#horaFin',
    resultMeseros: '#resultMeseros',
    resultMeserosText: '#resultMeserosText',
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
    personalBarra: parseInt(DOM.personalBarra.value, 10) || 0,
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
  const personalBarra = data.personalBarra;

  return {
    nombre: data.nombre,
    telefono: data.telefono,
    fecha: formatDate(data.fecha),
    fechaRaw: data.fecha,
    lugar: data.lugar,
    mesas: data.mesas,
    meseros,
    invitados: data.invitados,
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
  const barraLine = resumen.personalBarra > 0
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
  message += `*Nombre:* ${resumen.nombre}\n`;
  message += `*Teléfono:* ${resumen.telefono}\n`;
  message += `*Fecha:* ${resumen.fecha}\n`;
  message += `*Lugar:* ${resumen.lugar}\n`;
  message += `*Mesas:* ${resumen.mesas}\n`;
  message += `*Meseros asignados:* ${resumen.meseros}\n`;
  message += `*Invitados:* ${resumen.invitados}\n`;

  if (resumen.personalBarra > 0) {
    message += `*Personal de barra:* ${resumen.personalBarra} persona(s)\n`;
  }

  message += `*Horario:* ${resumen.horario}\n`;
  message += `\nQuedo pendiente de información y disponibilidad.`;

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
  DOM.horaInicio.addEventListener('input', actualizarDuracion);
  DOM.horaFin.addEventListener('input', actualizarDuracion);

  // Event listeners — Limpiar errores al escribir
  const formInputs = DOM.form.querySelectorAll('.form-group__input');
  formInputs.forEach(input => {
    input.addEventListener('input', handleInputChange);
  });

  // Event listener — Submit
  DOM.form.addEventListener('submit', handleFormSubmit);

  // Inicializar carrusel
  initCarousel();

  // Inicializar galería completa
  initGaleriaCompleta();

  // Inicializar modal de comentarios
  initFeedbackModal();

  // Log de inicialización (para desarrollo)
  console.log('✦ Meseros Yucatán — Cotizador inicializado correctamente.');
}

// Arrancar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);


/* ═══════════════════════════════════════════
   CARRUSEL — Control de galería de imágenes
   ═══════════════════════════════════════════ */

/**
 * Inicializa el carrusel de galería con auto-avance y controles.
 */
function initCarousel() {
  const slides = document.querySelectorAll('.carousel__slide');
  const indicators = document.querySelectorAll('.carousel__indicator');
  const btnPrev = document.getElementById('carouselPrev');
  const btnNext = document.getElementById('carouselNext');

  if (!slides.length) return;

  let currentSlide = 0;
  let autoPlayInterval;

  /**
   * Cambia al slide especificado.
   * @param {number} index - Índice del slide.
   */
  function goToSlide(index) {
    // Remover clases activas
    slides[currentSlide].classList.remove('carousel__slide--active');
    indicators[currentSlide].classList.remove('carousel__indicator--active');

    // Actualizar índice
    currentSlide = index;
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;

    // Agregar clases activas
    slides[currentSlide].classList.add('carousel__slide--active');
    indicators[currentSlide].classList.add('carousel__indicator--active');
  }

  /**
   * Avanza al siguiente slide.
   */
  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  /**
   * Retrocede al slide anterior.
   */
  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  /**
   * Inicia el auto-avance del carrusel.
   */
  function startAutoPlay() {
    stopAutoPlay(); // Limpiar cualquier intervalo previo
    autoPlayInterval = setInterval(nextSlide, 7000); // Cambia cada 7 segundos
  }

  /**
   * Detiene el auto-avance del carrusel.
   */
  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  }

  // Event Listeners
  btnNext?.addEventListener('click', () => {
    nextSlide();
    stopAutoPlay();
    startAutoPlay(); // Reiniciar timer
  });

  btnPrev?.addEventListener('click', () => {
    prevSlide();
    stopAutoPlay();
    startAutoPlay(); // Reiniciar timer
  });

  // Indicadores
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      goToSlide(index);
      stopAutoPlay();
      startAutoPlay(); // Reiniciar timer
    });
  });

  // Pausar auto-avance al hacer hover
  const carousel = document.querySelector('.carousel');
  carousel?.addEventListener('mouseenter', stopAutoPlay);
  carousel?.addEventListener('mouseleave', startAutoPlay);

  // Soporte táctil para swipe
  let touchStartX = 0;
  let touchEndX = 0;

  carousel?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carousel?.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      stopAutoPlay();
      startAutoPlay();
    }
  }

  // Iniciar auto-avance
  startAutoPlay();
}


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


/* ═══════════════════════════════════════════
   GALERÍA COMPLETA - FILTRADO
   ═══════════════════════════════════════════ */

/**
 * Configuración de la galería completa
 */
const GALERIA_CONFIG = {
  categorias: {
    'bodas': { nombre: 'Bodas', carpeta: 'bodas' },
    'xv-anios': { nombre: 'XV Años', carpeta: 'xv-anios' },
    'cumpleanos': { nombre: 'Cumpleaños', carpeta: 'cumpleanos' },
    'aniversarios': { nombre: 'Aniversarios', carpeta: 'aniversarios' },
    'fiestas': { nombre: 'Fiestas', carpeta: 'fiestas' },
    'posadas': { nombre: 'Posadas', carpeta: 'posadas' }
  },
  basePath: 'assets/images/'
};

/**
 * Imágenes por categoría (agregar aquí las imágenes manualmente)
 */
const GALERIA_IMAGENES = {
  'bodas': [
    { archivo: 'Boda.jpeg', titulo: 'Boda Elegante' }
  ],
  'xv-anios': [
    { archivo: 'XVzoe.jpeg', titulo: 'XV Años Zoe' },
    { archivo: 'copasXV.jpeg', titulo: 'Brindis XV Años' }
  ],
  'cumpleanos': [],
  'aniversarios': [],
  'fiestas': [],
  'posadas': []
};

/**
 * Inicializa la galería completa
 */
function initGaleriaCompleta() {
  const grid = document.getElementById('galeriaGrid');
  const filtros = document.querySelectorAll('.galeria-filtros__btn');

  if (!grid || filtros.length === 0) return;

  // Renderizar categoría 'bodas' al inicio
  renderGaleria('bodas');

  // Agregar eventos a los filtros
  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remover active de todos
      filtros.forEach(b => b.classList.remove('galeria-filtros__btn--active'));

      // Agregar active al clickeado
      btn.classList.add('galeria-filtros__btn--active');

      // Filtrar galería
      const categoria = btn.dataset.categoria;
      renderGaleria(categoria);
    });
  });
}

/**
 * Renderiza la galería según la categoría seleccionada
 */
function renderGaleria(categoria) {
  const grid = document.getElementById('galeriaGrid');
  if (!grid) return;

  // Limpiar grid
  grid.innerHTML = '';

  let imagenes = [];

  // Obtener imágenes según categoría
  if (categoria === 'todas') {
    // Agregar todas las imágenes de todas las categorías
    Object.keys(GALERIA_IMAGENES).forEach(cat => {
      GALERIA_IMAGENES[cat].forEach(img => {
        imagenes.push({
          ...img,
          categoria: cat,
          categoriaNombre: GALERIA_CONFIG.categorias[cat].nombre,
          carpeta: GALERIA_CONFIG.categorias[cat].carpeta
        });
      });
    });
  } else {
    // Agregar solo imágenes de la categoría seleccionada
    if (GALERIA_IMAGENES[categoria]) {
      imagenes = GALERIA_IMAGENES[categoria].map(img => ({
        ...img,
        categoria: categoria,
        categoriaNombre: GALERIA_CONFIG.categorias[categoria].nombre,
        carpeta: GALERIA_CONFIG.categorias[categoria].carpeta
      }));
    }
  }

  // Si no hay imágenes, no mostrar nada
  if (imagenes.length === 0) {
    return;
  }

  // Renderizar imágenes
  imagenes.forEach((img, index) => {
    const item = document.createElement('div');
    item.className = 'galeria-item';
    item.style.animationDelay = `${(index % 6) * 0.1}s`;

    item.innerHTML = `
            <img 
                src="${GALERIA_CONFIG.basePath}${img.carpeta}/${img.archivo}" 
                alt="${img.titulo}"
                class="galeria-item__img"
                loading="lazy"
            >
            <div class="galeria-item__overlay">
                <h3 class="galeria-item__title">${img.titulo}</h3>
                <p class="galeria-item__category">${img.categoriaNombre}</p>
            </div>
        `;

    grid.appendChild(item);
  });
}


/* ═══════════════════════════════════════════
   MODAL DE COMENTARIOS Y SUGERENCIAS
   ═══════════════════════════════════════════ */

/**
 * Configuración EmailJS para comentarios
 * Cambiar estos valores por los de tu cuenta EmailJS
 */
const EMAILJS_CONFIG_FEEDBACK = {
  serviceID: 'service_vupug89',    // Service ID configurado
  templateID: 'template_dd4t67c',  // Template ID configurado
  publicKey: 'e1y0lBACakyS17xiq'   // Public Key configurado
};

/**
 * Inicializa el modal de comentarios
 */
function initFeedbackModal() {
  const modal = document.getElementById('feedbackModal');
  const openBtn = document.getElementById('feedbackBtn');
  const closeBtn = document.getElementById('modalClose');
  const form = document.getElementById('feedbackForm');
  const successDiv = document.getElementById('feedbackSuccess');

  if (!modal || !openBtn || !closeBtn || !form) return;

  // Abrir modal
  openBtn.addEventListener('click', () => {
    modal.classList.add('modal-overlay--active');
    document.body.style.overflow = 'hidden';
  });

  // Cerrar modal
  const closeModal = () => {
    modal.classList.remove('modal-overlay--active');
    document.body.style.overflow = '';
    // Resetear después de la animación
    setTimeout(() => {
      form.style.display = 'flex';
      successDiv.classList.remove('modal__success--active');
      form.reset();
    }, 300);
  };

  closeBtn.addEventListener('click', closeModal);

  // Cerrar al hacer clic fuera del modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Cerrar con tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('modal-overlay--active')) {
      closeModal();
    }
  });

  // Manejar envío del formulario
  form.addEventListener('submit', handleFeedbackSubmit);
}

/**
 * Maneja el envío del formulario de comentarios
 */
async function handleFeedbackSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector('.btn--primary');
  const comentario = document.getElementById('feedbackComentario').value.trim();

  // Validar comentario
  if (!comentario) {
    alert('Por favor, escribe tu comentario.');
    return;
  }

  // Deshabilitar botón
  submitBtn.disabled = true;
  submitBtn.classList.add('btn--loading');

  try {
    // Obtener datos del formulario
    const feedbackData = {
      from_name: document.getElementById('feedbackNombre').value.trim() || 'Anónimo',
      user_phone: document.getElementById('feedbackTelefono').value.trim() || 'No proporcionado',
      message: comentario,
      date: new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    console.log('📤 Enviando datos:', feedbackData); // Debug

    // Enviar con EmailJS
    await emailjs.send(
      EMAILJS_CONFIG_FEEDBACK.serviceID,
      EMAILJS_CONFIG_FEEDBACK.templateID,
      feedbackData,
      EMAILJS_CONFIG_FEEDBACK.publicKey
    );

    // Mostrar mensaje de éxito
    form.style.display = 'none';
    document.getElementById('feedbackSuccess').classList.add('modal__success--active');

    // Log para desarrollo
    console.log('📧 Comentario enviado:', feedbackData);

  } catch (error) {
    console.error('Error al enviar comentario:', error);
    alert('Hubo un error al enviar tu comentario. Por favor, intenta de nuevo.');
  } finally {
    // Rehabilitar botón
    submitBtn.disabled = false;
    submitBtn.classList.remove('btn--loading');
  }
}

/**
 * Enviar comentario (función independiente para futuro uso)
 */
async function enviarComentario(nombre, telefono, comentario) {
  try {
    const feedbackData = {
      nombre: nombre || 'Anónimo',
      telefono: telefono || 'No proporcionado',
      comentario: comentario,
      fecha: new Date().toLocaleDateString('es-MX')
    };

    // Integración con EmailJS
    // await emailjs.send(...);

    return { success: true, data: feedbackData };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error };
  }
}

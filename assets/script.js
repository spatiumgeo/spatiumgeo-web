(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const mq = (query) => (window.matchMedia ? window.matchMedia(query).matches : false);
  const isMobile = mq('(max-width: 760px)');
  const isTouch = mq('(pointer: coarse)');
  const reducedMotion = mq('(prefers-reduced-motion: reduce)');

  function addBrowserClasses() {
    const ua = navigator.userAgent || '';
    const vendor = navigator.vendor || '';
    const platform = navigator.platform || '';
    const html = document.documentElement;
    const classes = ['js'];
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);
    const isEdge = /Edg\//.test(ua) || /EdgA\//.test(ua) || /EdgiOS\//.test(ua);
    const isOpera = /OPR\//.test(ua) || /Opera/.test(ua) || /OPT\//.test(ua);
    const isFirefox = /Firefox\//.test(ua) || /FxiOS\//.test(ua);
    const isChromeIOS = /CriOS\//.test(ua);
    const isChrome = !isEdge && !isOpera && !isFirefox && (/Chrome\//.test(ua) || /Chromium\//.test(ua) || isChromeIOS || /Google Inc/.test(vendor));
    const isSafari = !isEdge && !isOpera && !isChrome && !isFirefox && (/Safari\//.test(ua) || /Apple/.test(vendor));

    if (isEdge) classes.push('is-edge', 'browser-edge', 'engine-blink');
    else if (isOpera) classes.push('is-opera', 'browser-opera', 'engine-blink');
    else if (isFirefox) classes.push('is-firefox', 'browser-firefox', 'engine-gecko');
    else if (isChrome) classes.push(isChromeIOS ? 'is-chrome-ios' : 'is-chrome', 'browser-chrome', isIOS ? 'engine-webkit' : 'engine-blink');
    else if (isSafari) classes.push('is-safari', 'browser-safari', 'engine-webkit');
    else classes.push('browser-unknown');

    if (isIOS) classes.push('is-ios', 'platform-ios');
    if (isAndroid) classes.push('is-android', 'platform-android');
    if (/Win/.test(platform)) classes.push('platform-windows');
    if (/Mac/.test(platform) && !isIOS) classes.push('platform-macos');
    if (/Linux/.test(platform) && !isAndroid) classes.push('platform-linux');

    if (window.CSS && CSS.supports) {
      const backdrop = CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
      classes.push(backdrop ? 'supports-backdrop-filter' : 'no-backdrop-filter');
      classes.push(CSS.supports('aspect-ratio', '1 / 1') ? 'supports-aspect-ratio' : 'no-aspect-ratio');
      classes.push(CSS.supports('object-fit', 'cover') ? 'supports-object-fit' : 'no-object-fit');
      classes.push(CSS.supports('display', 'grid') ? 'supports-css-grid' : 'no-css-grid');
    }

    if (isTouch) classes.push('is-touch');
    if (mq('(hover: none)')) classes.push('no-hover');
    if (isMobile) classes.push('is-mobile');
    if (reducedMotion) classes.push('reduced-motion');
    html.classList.add(...classes);
  }

  addBrowserClasses();
  const fxEnabled = !isMobile && !reducedMotion;

  document.documentElement.classList.add('fx-ready');

  const menu = $('.menu-toggle');
  const nav = $('#nav');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', (event) => {
      if (event.target.matches('a')) {
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Animaciones de entrada
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach((el) => revealObserver.observe(el));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  // Contadores
  if ('IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count || 0);
        const suffix = target === 360 ? '°' : target === 100 ? '%' : '';
        let start = null;
        const duration = 1200;
        function step(ts) {
          if (!start) start = ts;
          const p = Math.min((ts - start) / duration, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        countObserver.unobserve(el);
      });
    }, { threshold: .35 });
    $$('[data-count]').forEach((el) => countObserver.observe(el));
  }

  // Brillo de cursor
  const glow = $('.cursor-glow');
  let mouseX = innerWidth / 2, mouseY = innerHeight / 2, glowX = mouseX, glowY = mouseY;
  if (glow && fxEnabled) {
    glow.style.display = 'block';
    addEventListener('pointermove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    }, { passive: true });
    function moveGlow() {
      glowX += (mouseX - glowX) * 0.09;
      glowY += (mouseY - glowY) * 0.09;
      glow.style.setProperty('transform', `translate(${glowX - 190}px, ${glowY - 190}px)`, 'important');
      requestAnimationFrame(moveGlow);
    }
    moveGlow();
  } else if (glow) {
    glow.style.display = 'none';
  }

  // Tilt en tarjetas. Usamos priority important porque algunas reglas de rendimiento lo bloqueaban.
  if (fxEnabled && !isTouch) {
    $$('.tilt').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        card.style.setProperty('transform', `perspective(900px) rotateX(${-py * 5}deg) rotateY(${px * 7}deg) translateY(-4px)`, 'important');
      });
      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('transform');
      });
    });

    $$('.magnetic').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('transform', `translate(${(e.clientX - r.left - r.width / 2) * .08}px, ${(e.clientY - r.top - r.height / 2) * .12}px)`, 'important');
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.removeProperty('transform');
      });
    });
  }

  // Chispas lumínicas discretas
  if (fxEnabled) {
    const existing = $$('.fx-spark');
    existing.forEach((el) => el.remove());
    for (let i = 0; i < 26; i++) {
      const s = document.createElement('span');
      s.className = 'fx-spark';
      s.style.left = Math.random() * 100 + 'vw';
      s.style.top = Math.random() * 100 + 'vh';
      s.style.setProperty('--tx', (Math.random() * 260 - 130) + 'px');
      s.style.setProperty('--ty', (-80 - Math.random() * 260) + 'px');
      s.style.setProperty('--dur', (8 + Math.random() * 12) + 's');
      s.style.animationDelay = (-Math.random() * 14) + 's';
      document.body.appendChild(s);
    }
  }

  // MODAL CASOS DE USO
  const caseModalData = {

    "realidad-aumentada": {
      title: "Realidad aumentada",
      text: "Aplicamos realidad aumentada para visualizar datos GIS, modelos 3D e información técnica sobre el entorno real de forma clara y útil.",
      steps: ["Preparación de capas GIS, modelos 3D y puntos de interés.", "Visualización de información territorial sobre el entorno real.", "Validación en campo, interpretación técnica y comunicación visual."]
    },

    "arqueologia-ar": {
      title: "Realidad aumentada",
      text: "Aplicamos realidad aumentada para visualizar datos GIS, modelos 3D e información técnica sobre el entorno real de forma clara y útil.",
      steps: ["Preparación de capas GIS, modelos 3D y puntos de interés.", "Visualización de información territorial sobre el entorno real.", "Validación en campo, interpretación técnica y comunicación visual."]
    },

    "gestiones-catastrales": {
      title: "PIC CATASTRO Y PROPIEDAD",
      text: "Servicio de apoyo para consulta catastral, certificación, revisión parcelaria y delimitación técnica de la propiedad inmobiliaria.",
      steps: [
        "Consulta y certificación de datos catastrales.",
        "Revisión de parcelas, límites y colindancias.",
        "Delimitación técnica con soporte GNSS + CAD + GIS."
      ]
    },
    "planificacion-urbanistica": {
      title: "Planificación Urbanística",
      text: "Convertimos datos territoriales, cartografía y modelos urbanos en escenarios útiles para evaluar alternativas de planificación urbanística.",
      steps: ["Diagnóstico del ámbito, estructura urbana, usos y condicionantes.", "Análisis GIS de movilidad, equipamientos, oportunidades y limitaciones.", "Generación de mapas, escenarios y criterios técnicos de planificación."]
    },
    "movilidad-y-transporte": {
      title: "Movilidad y transporte",
      text: "Analizamos redes, accesibilidad y flujos de movilidad para detectar puntos críticos y apoyar decisiones de planificación y transporte.",
      steps: ["Lectura de red viaria, transporte público, accesibilidad y demanda.", "Análisis GIS de recorridos, conexiones, tiempos y áreas de influencia.", "Mapas e indicadores para priorizar actuaciones y mejorar la movilidad."]
    },
    "operaciones-y-activos": {
      title: "Operaciones y activos",
      text: "Estructuramos inventarios de activos e infraestructuras para facilitar mantenimiento, control, actualización y consulta operativa.",
      steps: ["Captura de campo, imágenes, sensores y datos georreferenciados.", "Clasificación de activos y organización en base GIS.", "Paneles, mapas y consultas para mantenimiento y operaciones diarias."]
    },
    "ordenacion-del-territorio": {
      title: "Ordenación del territorio",
      text: "Integramos cartografía, normativa y condicionantes físicos para definir criterios de ordenación territorial claros, medibles y coherentes.",
      steps: ["Revisión de capas territoriales, usos, infraestructuras y restricciones.", "Cruce GIS de compatibilidades, riesgos, oportunidades y afecciones.", "Mapas de síntesis y apoyo técnico para la toma de decisiones."]
    },
    "sostenibilidad-y-medioambiente": {
      title: "Sostenibilidad y Medioambiente",
      text: "Evaluamos variables ambientales y territoriales para anticipar impactos, reducir riesgos y orientar decisiones sostenibles.",
      steps: ["Inventario ambiental y análisis de sensibilidad del entorno.", "Cruce de capas de vegetación, hidrología, pendientes, riesgos y afecciones.", "Mapas de impacto, medidas preventivas y soporte para evaluación ambiental."]
    },
    "gemelo-digital": {
      title: "Gemelo digital",
      text: "Creamos modelos 3D conectados a datos GIS, BIM e indicadores para visualizar el territorio, validar escenarios y comunicar decisiones.",
      steps: ["Integración de cartografía, LiDAR, BIM, sensores y datos territoriales.", "Construcción de modelo 3D operativo y capas de información.", "Visualización, análisis de escenarios y comunicación técnica."]
    }
  };

  const caseModal = document.getElementById('case-modal');
  const caseModalTitle = document.getElementById('case-modal-title');
  const caseModalText = document.getElementById('case-modal-text');
  const caseModalSteps = document.getElementById('case-modal-steps');
  const caseModalImg = document.getElementById('case-modal-img');
  let lastCaseTrigger = null;

  function getLargestImageFromSrcset(srcset) {
    if (!srcset) return '';
    const items = srcset.split(',').map((item) => {
      const parts = item.trim().split(/\s+/);
      const url = parts[0] || '';
      const width = parseInt((parts[1] || '').replace('w', ''), 10) || 0;
      return { url, width };
    }).filter((item) => item.url).sort((a, b) => b.width - a.width);
    return items.length ? items[0].url : '';
  }

  function openCaseModal(tile) {
    if (!caseModal || !tile) return;
    const key = tile.dataset.case;
    const data = caseModalData[key] || {
      title: tile.textContent.trim(),
      text: 'Proceso técnico adaptado al proyecto, combinando datos geoespaciales, análisis y visualización.',
      steps: ['Diagnóstico inicial.', 'Análisis territorial.', 'Entrega de resultados claros.']
    };
    const img = tile.querySelector('img');
    lastCaseTrigger = tile;
    caseModalTitle.textContent = data.title;
    caseModalText.textContent = data.text;
    const steps = Array.isArray(data.steps) ? data.steps : [];
    caseModalSteps.innerHTML = steps.map((step) => `<li>${step}</li>`).join('');
    caseModalSteps.hidden = steps.length === 0;
    if (img) {
      const fullImage = img.dataset.full || getLargestImageFromSrcset(img.getAttribute('srcset')) || img.getAttribute('src') || img.currentSrc;
      caseModalImg.removeAttribute('srcset');
      caseModalImg.removeAttribute('sizes');
      caseModalImg.src = fullImage;
      caseModalImg.alt = img.alt || data.title;
    }
    caseModal.classList.add('is-open');
    caseModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('case-modal-open');
    const close = caseModal.querySelector('[data-case-close]');
    if (close) close.focus({ preventScroll: true });
  }

  function closeCaseModal() {
    if (!caseModal) return;
    caseModal.classList.remove('is-open');
    caseModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('case-modal-open');
    if (lastCaseTrigger) lastCaseTrigger.focus({ preventScroll: true });
  }

  const caseTiles = $$('.case-grid.bento-cases .case-tile[data-case]');
  let lastTouchActivation = 0;

  caseTiles.forEach((tile) => {
    tile.setAttribute('role', 'button');
    tile.setAttribute('tabindex', '0');
    tile.setAttribute('aria-controls', 'case-modal');
  });

  function activateCaseFromEvent(event) {
    const tile = event.target.closest ? event.target.closest('.case-grid.bento-cases .case-tile[data-case]') : null;
    if (!tile) return;

    if (event.cancelable) event.preventDefault();
    event.stopPropagation();

    const now = Date.now();
    if (event.type === 'touchend') {
      lastTouchActivation = now;
    } else if (event.type === 'click' && now - lastTouchActivation < 650) {
      return;
    }

    openCaseModal(tile);
  }

  const casesGrid = $('.case-grid.bento-cases');
  if (casesGrid) {
    casesGrid.addEventListener('click', activateCaseFromEvent, false);
    casesGrid.addEventListener('touchend', activateCaseFromEvent, { passive: false });
    casesGrid.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      activateCaseFromEvent(event);
    }, false);
  }

  $$('[data-case-close]').forEach((el) => {
    el.addEventListener('click', closeCaseModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && caseModal && caseModal.classList.contains('is-open')) {
      closeCaseModal();
    }
  });

})();

// Caso añadido: PIC CATASTRO Y PROPIEDAD
window.extraCaseData = window.extraCaseData || {};
window.extraCaseData.catastro = {
  title: "PIC CATASTRO Y PROPIEDAD",
  image: "assets/case-gestiones-catastrales-final-1254.webp",
  text: "Servicio de apoyo para consulta catastral, certificación, revisión parcelaria y delimitación técnica de la propiedad inmobiliaria.",
  bullets: ["Consulta catastral", "Revisión parcelaria", "Delimitación técnica"]
};

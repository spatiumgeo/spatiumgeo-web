(function () {
  function $(selector, root) { return (root || document).querySelector(selector); }
  function $$(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function mq(query) { return window.matchMedia ? window.matchMedia(query).matches : false; }

  var isTouch = mq('(pointer: coarse)');
  var reducedMotion = mq('(prefers-reduced-motion: reduce)');

  var menu = $('.menu-toggle');
  var nav = $('#nav');
  if (menu && nav) {
    menu.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (event) {
      if (event.target && event.target.matches && event.target.matches('a')) {
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var mobileQuickMenu = $('.mobile-quick-menu');
  if (mobileQuickMenu) {
    mobileQuickMenu.addEventListener('click', function () {
      if (nav) nav.classList.remove('open');
      if (menu) menu.setAttribute('aria-expanded', 'false');
    });
  }

  // Scroll robusto para el CTA final y los enlaces a contacto.
  // Evita el fallo de no moverse cuando la URL ya contiene #contacto o cuando el navegador ignora el salto nativo.
  function scrollToSection(targetId, event) {
    var target = targetId ? document.getElementById(targetId) : null;
    if (!target) return false;
    if (event && event.preventDefault) event.preventDefault();

    var header = $('.site-header');
    var headerOffset = header ? header.getBoundingClientRect().height + 18 : 90;
    var top = target.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || 0) - headerOffset;
    top = Math.max(0, Math.round(top));

    try {
      window.scrollTo({ top: top, left: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    } catch (e) {
      window.scrollTo(0, top);
    }

    try {
      if (window.history && window.history.replaceState) window.history.replaceState(null, '', '#' + targetId);
    } catch (e) {}

    window.setTimeout(function () {
      if (!target.focus) return;
      try { target.focus({ preventScroll: true }); } catch (e) { try { target.focus(); } catch (ignore) {} }
    }, reducedMotion ? 0 : 420);
    return true;
  }

  $$('.js-scroll-contact[data-scroll-target], a[href="#contacto"]').forEach(function (link) {
    if (link.dataset.spgScrollBound === '1') return;
    link.dataset.spgScrollBound = '1';
    link.addEventListener('click', function (event) {
      var targetId = link.getAttribute('data-scroll-target') || 'contacto';
      scrollToSection(targetId, event);
    });
  });

  // Failsafe: mostrar la web aunque IntersectionObserver falle en Edge u otro navegador.
  var revealItems = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    revealItems.forEach(function (el) { revealObserver.observe(el); });
    window.setTimeout(function () { revealItems.forEach(function (el) { el.classList.add('is-visible'); }); }, 900);
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  }

  if ('IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = Number(el.dataset.count || 0);
        var suffix = target === 360 ? '°' : target === 100 ? '%' : '';
        var start = null;
        var duration = 1200;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) window.requestAnimationFrame(step);
        }
        window.requestAnimationFrame(step);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.35 });
    $$('[data-count]').forEach(function (el) { countObserver.observe(el); });
  }


  // Efecto magnético ligero solo para botones marcados como .magnetic.
  // No activa partículas, malla, brillo de cursor ni efectos globales.
  if (!isTouch && !reducedMotion) {
    $$('.magnetic').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.055;
        var y = (e.clientY - r.top - r.height / 2) * 0.075;
        btn.style.transform = 'translate(' + x + 'px, ' + y + 'px) translateY(-2px)';
      });
      btn.addEventListener('pointerleave', function () {
        btn.style.transform = '';
      });
    });
  }


  var caseModalData = {
    'visualizacion-tecnica': {
      title: 'Visualización técnica',
      text: 'Visualización avanzada para explicar datos GIS, modelos 3D e información técnica del proyecto de forma clara y útil.',
      steps: ['Preparación de cartografía GIS, modelos 3D y puntos de interés.', 'Visualización de información territorial del ámbito de trabajo.', 'Interpretación técnica y comunicación visual.']
    },
    'catastro-registro': {
      title: 'Revisión catastral y GML',
      text: 'GML, IVG, comprobaciones geométricas y memoria cartográfica cuando el encargo lo requiera.',
      steps: ['Revisión catastral y comprobaciones geométricas.', 'Preparación o revisión de GML - IVG cuando proceda.', 'Memoria cartográfica y resumen técnico.']
    },
    'planificacion-urbanistica': {
      title: 'Planificación urbanística',
      text: 'Convertimos información territorial, cartografía y modelos urbanos en escenarios útiles para valorar alternativas de planificación urbanística.',
      steps: ['Lectura del ámbito, estructura urbana, usos y condicionantes.', 'Estudio GIS de movilidad, equipamientos, oportunidades y limitaciones.', 'Elaboración de cartografía, escenarios y criterios técnicos de planificación.']
    },
    'movilidad-y-transporte': {
      title: 'Movilidad y transporte',
      text: 'Estudiamos redes, accesibilidad y flujos de movilidad para detectar puntos críticos y apoyar decisiones de planificación y transporte.',
      steps: ['Lectura de red viaria, transporte público, accesibilidad y demanda.', 'Estudio GIS de recorridos, conexiones, tiempos y áreas de influencia.', 'Mapas e indicadores para priorizar actuaciones y mejorar la movilidad.']
    },
    'operaciones-y-activos': {
      title: 'Operaciones y activos',
      text: 'Estructuramos inventarios de activos e infraestructuras para facilitar mantenimiento, control, actualización y consulta operativa.',
      steps: ['Recopilación de datos georreferenciados e información aportada.', 'Clasificación de activos y organización en base GIS.', 'Dashboards, mapas y consultas para mantenimiento y operaciones.']
    },
    'ordenacion-del-territorio': {
      title: 'Ordenación del territorio',
      text: 'Integramos cartografía, normativa y condicionantes físicos para definir criterios de ordenación territorial claros, medibles y coherentes.',
      steps: ['Revisión de información territorial, usos, infraestructuras y condicionantes.', 'Análisis GIS de compatibilidades, riesgos, oportunidades y afecciones.', 'Cartografía de síntesis para la toma de decisiones técnicas.']
    },
    'medioambiente': {
      title: 'Medioambiente',
      text: 'Evaluamos variables ambientales y territoriales para anticipar impactos, reducir riesgos y orientar decisiones vinculadas al medioambiente.',
      steps: ['Inventario ambiental y análisis de sensibilidad del entorno.', 'Análisis GIS de variables ambientales, pendientes, riesgos y afecciones.', 'Cartografía técnica, medidas preventivas y soporte documental.']
    },
    'gemelo-digital': {
      title: 'Modelos 3D',
      text: 'Modelos 3D para visualizar propuestas, revisar volúmenes y comunicar resultados con claridad técnica.',
      steps: ['Integración de cartografía, LiDAR, BIM y datos territoriales.', 'Construcción de modelo 3D y organización de información asociada.', 'Visualización y comunicación técnica de resultados.']
    }
  };

  var caseModal = document.getElementById('case-modal');
  // Colocamos el modal como hijo directo del <body> para que nunca quede
  // atrapado por el z-index de main/footer/header al abrirlo desde el índice inferior.
  if (caseModal && caseModal.parentNode !== document.body) {
    document.body.appendChild(caseModal);
  }
  var caseModalTitle = document.getElementById('case-modal-title');
  var caseModalText = document.getElementById('case-modal-text');
  var caseModalSteps = document.getElementById('case-modal-steps');
  var caseModalImg = document.getElementById('case-modal-img');
  var lastCaseTrigger = null;
  var caseTiles = $$('.case-grid.bento-cases .case-tile[data-case]');

  function largestFromSrcset(srcset) {
    if (!srcset) return '';
    var best = '', bestW = 0;
    srcset.split(',').forEach(function (item) {
      var parts = item.trim().split(/\s+/);
      var url = parts[0] || '';
      var width = parseInt((parts[1] || '').replace('w', ''), 10) || 0;
      if (url && width >= bestW) { best = url; bestW = width; }
    });
    return best;
  }

  function findCaseTileByKey(key) {
    for (var i = 0; i < caseTiles.length; i++) if (caseTiles[i].dataset.case === key) return caseTiles[i];
    return null;
  }

  function openCaseModal(tile, triggerElement) {
    if (!caseModal || !tile) return;
    var key = tile.dataset.case;
    var data = caseModalData[key] || { title: tile.textContent.trim(), text: 'Proceso técnico adaptado al proyecto, combinando datos geoespaciales, análisis y visualización.', steps: ['Diagnóstico inicial.', 'Análisis territorial.', 'Entrega de resultados claros.'] };
    var img = tile.querySelector('img');
    lastCaseTrigger = triggerElement || null;
    caseModalTitle.textContent = data.title;
    caseModalText.textContent = data.text;
    var steps = Array.isArray(data.steps) ? data.steps : [];
    caseModalSteps.innerHTML = steps.map(function (step) { return '<li>' + step + '</li>'; }).join('');
    caseModalSteps.hidden = steps.length === 0;
    if (img && caseModalImg) {
      var imageWidth = parseInt(img.getAttribute('width'), 10) || img.naturalWidth || 1;
      var imageHeight = parseInt(img.getAttribute('height'), 10) || img.naturalHeight || 1;
      caseModal.style.setProperty('--case-modal-ratio', imageWidth + ' / ' + imageHeight);
      var fullImage = img.getAttribute('data-full') || largestFromSrcset(img.getAttribute('srcset')) || img.getAttribute('src') || img.currentSrc;
      caseModalImg.removeAttribute('srcset');
      caseModalImg.removeAttribute('sizes');
      caseModalImg.src = fullImage;
      caseModalImg.alt = img.alt || data.title;
      caseModalImg.onload = function () {
        if (caseModalImg.naturalWidth && caseModalImg.naturalHeight) {
          caseModal.style.setProperty('--case-modal-ratio', caseModalImg.naturalWidth + ' / ' + caseModalImg.naturalHeight);
        }
      };
    }
    // Asegura que el modal sea el último elemento del body en cada apertura.
    if (caseModal.parentNode !== document.body) {
      document.body.appendChild(caseModal);
    } else if (document.body.lastElementChild !== caseModal) {
      document.body.appendChild(caseModal);
    }
    caseModal.classList.add('is-open');
    caseModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('case-modal-open');
    var close = caseModal.querySelector('[data-case-close]');
    if (close && close.focus) close.focus({ preventScroll: true });
  }

  function closeCaseModal() {
    if (!caseModal) return;
    caseModal.classList.remove('is-open');
    caseModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('case-modal-open');
    if (lastCaseTrigger && lastCaseTrigger.focus) lastCaseTrigger.focus({ preventScroll: true });
  }

  function openCaseByKey(key, triggerElement) {
    var tile = findCaseTileByKey(key);
    if (!tile) return;
    openCaseModal(tile, triggerElement || null);
  }

  caseTiles.forEach(function (tile) {
    var labelNode = tile.querySelector('strong');
    var label = labelNode ? labelNode.textContent : 'caso de uso';
    tile.setAttribute('aria-label', label + ': pulsa Saber más para abrir la ventana');
    tile.addEventListener('click', function (event) {
      // Impide que imagen/tarjeta abran el modal. Solo el botón Saber más.
      if (!event.target.closest || !event.target.closest('.case-more-trigger')) {
        return;
      }
    });
    var trigger = tile.querySelector('.case-more-trigger[data-case-open]');
    if (!trigger) return;
    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      openCaseByKey(trigger.getAttribute('data-case-open'), trigger);
    });
  });

  $$('[data-footer-case-open]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var key = link.getAttribute('data-footer-case-open');
      if (!key) return;
      event.preventDefault();
      openCaseByKey(key, link);
    });
  });

  function openCaseFromHash() {
    var hash = decodeURIComponent(window.location.hash || '');
    if (hash.indexOf('#abrir-caso-') !== 0) return;
    var key = hash.replace('#abrir-caso-', '');
    window.setTimeout(function () { openCaseByKey(key); }, 80);
  }
  openCaseFromHash();
  window.addEventListener('hashchange', openCaseFromHash);

  $$('[data-case-close]').forEach(function (el) { el.addEventListener('click', closeCaseModal); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && caseModal && caseModal.classList.contains('is-open')) closeCaseModal();
  });

  /* SPATIUMGEO: hover/resaltado unificado para todas las ventanas.
     No depende del motor de efectos decorativos, por eso funciona aunque fxEnabled esté desactivado. */
  $$('.spg-window-effect').forEach(function (item) {
    item.addEventListener('pointerenter', function () {
      item.classList.add('is-hovering');
    });
    item.addEventListener('pointerleave', function () {
      item.classList.remove('is-hovering');
    });
    item.addEventListener('pointercancel', function () {
      item.classList.remove('is-hovering');
    });
    item.addEventListener('focusin', function () {
      item.classList.add('is-hovering');
    });
    item.addEventListener('focusout', function () {
      item.classList.remove('is-hovering');
    });
  });

})();

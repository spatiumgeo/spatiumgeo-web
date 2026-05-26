(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

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

  const glow = $('.cursor-glow');
  let mouseX = innerWidth / 2, mouseY = innerHeight / 2, glowX = mouseX, glowY = mouseY;
  addEventListener('pointermove', (event) => { mouseX = event.clientX; mouseY = event.clientY; }, { passive: true });
  function moveGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    if (glow) glow.style.transform = `translate(${glowX - 190}px, ${glowY - 190}px)`;
    requestAnimationFrame(moveGlow);
  }
  moveGlow();

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });
  $$('.reveal').forEach((el) => revealObserver.observe(el));

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
  }, { threshold: .4 });
  $$('[data-count]').forEach((el) => countObserver.observe(el));

  $$('.tilt').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(900px) rotateX(${-py * 5}deg) rotateY(${px * 7}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  $$('.magnetic').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .08}px, ${(e.clientY - r.top - r.height / 2) * .12}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });

  const canvas = $('#mesh-canvas');
  const ctx = canvas && canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (canvas && ctx && !reduced) {
    let w = 0, h = 0, dpr = 1;
    const points = [];
    const total = Math.min(160, Math.floor((innerWidth * innerHeight) / 8500));
    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.width = Math.floor(innerWidth * dpr);
      h = canvas.height = Math.floor(innerHeight * dpr);
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      points.length = 0;
      for (let i = 0; i < total; i++) {
        points.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - .5) * .22 * dpr,
          vy: (Math.random() - .5) * .22 * dpr,
          r: (Math.random() * 1.7 + .7) * dpr
        });
      }
    }
    resize();
    addEventListener('resize', resize, { passive: true });
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of points) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i], b = points[j];
          const dx = a.x - b.x, dy = a.y - b.y, dist = Math.hypot(dx, dy);
          const max = 230 * dpr;
          if (dist < max) {
            ctx.globalAlpha = (1 - dist / max) * .72;
            ctx.strokeStyle = '#10c8e8';
            ctx.lineWidth = 1.05 * dpr;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      const mx = mouseX * dpr, my = mouseY * dpr;
      for (const p of points) {
        const distM = Math.hypot(p.x - mx, p.y - my);
        const maxM = 260 * dpr;
        if (distM < maxM) {
          ctx.globalAlpha = (1 - distM / maxM) * .95;
          ctx.strokeStyle = '#e8fbff';
          ctx.lineWidth = 1.25 * dpr;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mx, my); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#e8fbff';
      for (const p of points) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 1.15, 0, Math.PI * 2); ctx.fill(); }
      requestAnimationFrame(draw);
    }
    draw();
  }


  // FX particles visibles en todo el sitio: puntos luminosos con movimiento suave.
  const sparkLayerOK = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (sparkLayerOK) {
    for (let i = 0; i < 42; i++) {
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

})();

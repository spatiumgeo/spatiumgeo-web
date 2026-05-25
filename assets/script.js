const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

const cards = document.querySelectorAll('.interactive-card');
cards.forEach((card) => {
  card.classList.add('reveal');
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rx = (0.5 - y) * 10;
    const ry = (x - 0.5) * 12;
    card.style.setProperty('--mx', `${x * 100}%`);
    card.style.setProperty('--my', `${y * 100}%`);
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
  });
  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('in');
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal, .hero-content, .section-title, .profile-copy, .contact-box').forEach((el) => {
  el.classList.add('reveal');
  observer.observe(el);
});

function createMesh(canvasId, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, points = [], pointer = {x:-9999,y:-9999};
  const density = options.density || 72;
  const maxDistance = options.maxDistance || 170;
  const color = options.color || '104,240,255';
  const accent = options.accent || '156,255,59';
  const lineAlpha = options.lineAlpha || .28;
  const scan = !!options.scan;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width; height = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(28, Math.floor(width * height / (density * density)));
    points = Array.from({length: count}, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - .5) * .18,
      vy: (Math.random() - .5) * .18,
      r: 1 + Math.random() * 1.9,
      hue: i % 5 === 0 ? accent : color
    }));
  }
  function track(e){ const r = canvas.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; }
  function leave(){ pointer.x = -9999; pointer.y = -9999; }
  function drawGrid() {
    if (!options.grid) return;
    const size = options.grid;
    ctx.strokeStyle = `rgba(${color},.06)`;
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += size) {
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,height); ctx.stroke();
    }
    for (let y = 0; y <= height; y += size) {
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(width,y); ctx.stroke();
    }
  }
  function drawRidge() {
    if (!options.ridge) return;
    const baseY = height * .18;
    ctx.beginPath();
    for (let x = -40; x <= width + 40; x += 26) {
      const y = baseY + Math.sin((x * .02) + performance.now() * .00045) * 18 + Math.sin((x * .045) + 2) * 8;
      if (x === -40) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(${color},.44)`;
    ctx.lineWidth = 1.25;
    ctx.stroke();
    for (let x = -40; x <= width + 40; x += 22) {
      for (let y = baseY; y <= baseY + 72; y += 18) {
        ctx.strokeStyle = `rgba(${color},.08)`;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 16, y - 10);
        ctx.stroke();
      }
    }
  }
  function drawScanlines() {
    if (!scan) return;
    const t = (performance.now() * .08) % (height + 180) - 90;
    const gradient = ctx.createLinearGradient(0, t - 70, 0, t + 70);
    gradient.addColorStop(0, 'rgba(104,240,255,0)');
    gradient.addColorStop(.5, 'rgba(104,240,255,.12)');
    gradient.addColorStop(1, 'rgba(104,240,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, t - 70, width, 140);
  }
  function tick() {
    ctx.clearRect(0,0,width,height);
    drawGrid();
    drawRidge();
    points.forEach((p) => {
      const dx = p.x - pointer.x, dy = p.y - pointer.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 200) {
        const force = (200 - dist) / 200;
        p.vx += (dx / (dist || 1)) * force * .032;
        p.vy += (dy / (dist || 1)) * force * .032;
      }
      p.x += p.vx; p.y += p.vy;
      p.vx *= .988; p.vy *= .988;
      if (p.x < -20) p.x = width + 20; if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20; if (p.y > height + 20) p.y = -20;
    });
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i], b = points[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < maxDistance) {
          const alpha = (1 - d / maxDistance) * lineAlpha;
          ctx.strokeStyle = `rgba(${color},${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    points.forEach((p) => {
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(${p.hue},.55)`;
      ctx.fillStyle = `rgba(${p.hue},.84)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });
    drawScanlines();
    requestAnimationFrame(tick);
  }
  window.addEventListener('resize', resize);
  canvas.addEventListener('pointermove', track);
  canvas.addEventListener('pointerleave', leave);
  resize(); tick();
}

createMesh('page-mesh', { density: 130, maxDistance: 145, color: '104,240,255', accent: '156,255,59', lineAlpha: .08, grid: 140, scan: true });
createMesh('neural-canvas', { density: 70, maxDistance: 170, color: '104,240,255', accent: '156,255,59', lineAlpha: .34, ridge: true, scan: true });
createMesh('contact-mesh', { density: 82, maxDistance: 140, color: '104,240,255', accent: '156,255,59', lineAlpha: .15, grid: 90, scan: true });

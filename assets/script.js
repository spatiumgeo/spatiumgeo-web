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

document.querySelectorAll('.interactive-card').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mx', `${x}%`);
    card.style.setProperty('--my', `${y}%`);
  });
});

function createMesh(canvasId, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const pointer = { x: -1000, y: -1000 };
  let width = 0;
  let height = 0;
  let points = [];
  const density = options.density || 46;
  const maxDistance = options.maxDistance || 145;
  const color = options.color || '103,232,249';
  const green = '137,169,50';

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(24, Math.floor((width * height) / (density * density)));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      ox: Math.random() * width,
      oy: Math.random() * height,
      vx: (Math.random() - .5) * .22,
      vy: (Math.random() - .5) * .22,
      r: 1 + Math.random() * 1.8
    }));
  }

  function move(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  }
  function leave() { pointer.x = -1000; pointer.y = -1000; }

  function tick() {
    ctx.clearRect(0, 0, width, height);
    points.forEach((p) => {
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 190) {
        const force = (190 - dist) / 190;
        p.vx += (dx / (dist || 1)) * force * .08;
        p.vy += (dy / (dist || 1)) * force * .08;
      }
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= .982;
      p.vy *= .982;
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;
    });

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i];
        const b = points[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < maxDistance) {
          const alpha = (1 - d / maxDistance) * .34;
          ctx.strokeStyle = `rgba(${color},${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    points.forEach((p, index) => {
      ctx.fillStyle = index % 4 === 0 ? `rgba(${green},.72)` : `rgba(${color},.72)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerleave', leave);
  resize();
  tick();
}

createMesh('neural-canvas', { density: 60, maxDistance: 150, color: '103,232,249' });
createMesh('contact-mesh', { density: 52, maxDistance: 120, color: '6,17,31' });

createMesh('page-mesh', { density: 85, maxDistance: 135, color: '103,232,249' });

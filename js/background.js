// js/background.js - красные частицы на черном фоне
(function(){
  const canvas = document.getElementById('bg');
  if (!canvas) { console.error('Canvas #bg not found'); return; }
  const ctx = canvas.getContext('2d', { alpha: true });

  // Параметры (красная цветовая схема)
  const PARTICLE_COUNT_DESKTOP = 70;
  const PARTICLE_COUNT_MOBILE = 28;
  const FOCAL_BASE = 700;
  const Z_SPREAD = 1000;
  const MAX_SIZE = 56;
  const MIN_SIZE = 10;
  const COLORS = [
    'hsl(0, 100%, 50%)',   // ярко-красный
    'hsl(0, 100%, 40%)',   // темно-красный
    'hsl(0, 90%, 45%)',    // средний красный
    'hsl(0, 80%, 35%)'     // глубокий красный
  ];

  // State
  let DPR = Math.max(1, window.devicePixelRatio || 1);
  let W = 0, H = 0, CX = 0, CY = 0;
  let particles = [];
  let mouseX = 0, mouseY = 0;
  let scrollY = 0;
  let focal = FOCAL_BASE;
  let last = performance.now();

  // --- Resize & init ---
  function setSize() {
    DPR = Math.max(1, window.devicePixelRatio || 1);
    W = Math.max(320, window.innerWidth);
    H = Math.max(240, window.innerHeight);
    CX = W / 2; CY = H / 2;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    // scale drawing so ctx coordinates are CSS pixels
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // adjust focal for small screens
    focal = FOCAL_BASE * (W > 900 ? 1 : 0.85);
    createParticles();
  }

  window.addEventListener('resize', setSize, { passive: true });

  // mouse + scroll
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY || window.pageYOffset || 0;
  }, { passive: true });

  // --- Particles ---
  function rand(min, max){ return min + Math.random() * (max - min); }

  function makeParticle() {
    const z = rand(-Z_SPREAD/2, Z_SPREAD/2);
    const size = rand(MIN_SIZE, MAX_SIZE);
    const shape = Math.random() < 0.6 ? 'tri' : (Math.random() < 0.5 ? 'quad' : 'circle');
    return {
      x: rand(-W/2, W/2),
      y: rand(-H/2, H/2),
      z,
      vx: rand(-0.18, 0.18),
      vy: rand(-0.18, 0.18),
      vz: rand(-0.25, 0.25),
      size,
      rot: Math.random() * Math.PI * 2,
      vrot: rand(-0.01, 0.01),
      hue: COLORS[Math.floor(Math.random()*COLORS.length)],
      shape,
      alphaBase: 0.6 + Math.random()*0.4, // повышенная прозрачность для лучшей видимости на черном
      floatAmp: 0.5 + Math.random()*1.2,
      wire: Math.random() > 0.76
    };
  }

  function createParticles(){
    particles = [];
    const count = (W < 700) ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
    for (let i=0;i<count;i++) particles.push(makeParticle());
    // expose for debug
    window.__bg_particles = window.__bg_particles || {};
    window.__bg_particles.particles = particles;
  }

  // projection (simple perspective)
  function projectScale(z) {
    const camZ = focal - (scrollY * 0.25);
    const denom = camZ + z;
    return denom <= 0.01 ? 1 : (camZ / denom);
  }

  // draw one particle (красные частицы)
  function drawParticle(p, sx, sy, s) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(p.rot);
    const scale = s * p.size / 20;

    // Свечение с повышенной интенсивностью для черного фона
    const glowRadius = Math.max(8, scale * 16); 
    const g = ctx.createRadialGradient(0,0,0,0,0, glowRadius);
    g.addColorStop(0, hsla(p.hue, p.alphaBase * 0.8));
    g.addColorStop(0.35, hsla(p.hue, p.alphaBase * 0.3));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0,0, glowRadius, 0, Math.PI*2);
    ctx.fill();

    // shape fill
    ctx.globalAlpha = Math.min(0.7, p.alphaBase); // повышенная прозрачность
    ctx.fillStyle = p.hue;
    ctx.strokeStyle = 'rgba(255,255,255,0.16)'; // светлая обводка для контраста
    ctx.lineWidth = Math.max(1, scale * 1.4);

    if (p.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0,0, scale*8, 0, Math.PI*2);
      ctx.fill();
      ctx.stroke();
    } else if (p.shape === 'tri') {
      ctx.beginPath();
      ctx.moveTo(0, -scale*12);
      ctx.lineTo(scale*10, scale*8);
      ctx.lineTo(-scale*10, scale*8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      const s2 = scale*10;
      ctx.beginPath();
      ctx.rect(-s2, -s2, s2*2, s2*2);
      ctx.fill();
      ctx.stroke();
    }

    if (p.wire) {
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function hsla(hslStr, a) {
    return hslStr.replace('hsl(', 'hsla(').replace(')', ',' + (a||1) + ')');
  }

  // --- Render loop ---
  function render(now) {
    const dt = Math.min(40, now - last);
    last = now;

    // clear entire canvas
    ctx.clearRect(0, 0, W, H);

    // sort far→near so nearer draw last
    particles.sort((a,b) => a.z - b.z);

    // update & draw
    for (let p of particles) {
      // update physics
      p.x += p.vx * (dt/16) * (0.6 + Math.abs(p.z) / Z_SPREAD);
      p.y += p.vy * (dt/16) * (0.6 + Math.abs(p.z) / Z_SPREAD);
      p.z += p.vz * (dt/16) * 0.4;
      p.rot += p.vrot * (dt/16);

      // wrapping in depth
      if (p.z < -Z_SPREAD/2) p.z += Z_SPREAD;
      if (p.z > Z_SPREAD/2) p.z -= Z_SPREAD;

      // projection scale & screen coords with parallax
      const sc = projectScale(p.z);
      const sx = CX + (p.x * sc) + (mouseX * (140 * (1 - sc)));
      const sy = CY + (p.y * sc) + (mouseY * (80 * (1 - sc))) + Math.sin((Date.now()*0.001) * p.floatAmp) * 6;

      if ((focal + p.z) <= 0.05) continue; // behind camera
      const drawScale = Math.max(0.22, sc);
      drawParticle(p, sx, sy, drawScale);
    }

    requestAnimationFrame(render);
  }

  // start
  function start() {
    last = performance.now();
    requestAnimationFrame(render);
  }

  // init whole thing
  function init() {
    setSize();
    start();
  }
  init();

  // expose for debugging
  window.__bg_particles = window.__bg_particles || {};
  window.__bg_particles.particles = particles;
  window.__bg_particles.info = () => ({ W, H, particlesCount: particles.length });

})();
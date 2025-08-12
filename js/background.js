// js/background.js — particles + animated gradient + parallax waves
(function(){
  const canvas = document.getElementById('bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  let DPR = Math.max(1, window.devicePixelRatio || 1);
  let W = 0, H = 0, CX = 0, CY = 0;
  let particles = [];
  const COUNT_DESKTOP = 80, COUNT_MOBILE = 30;
  let mouseX = 0, mouseY = 0, last = performance.now();
  let hue = 355;

  function rand(a,b){ return a + Math.random()*(b-a); }
  function resize(){
    DPR = Math.max(1, window.devicePixelRatio || 1);
    W = Math.max(320, window.innerWidth);
    H = Math.max(240, window.innerHeight);
    CX = W/2; CY = H/2;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    canvas.width = Math.round(W*DPR);
    canvas.height = Math.round(H*DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
    initParticles();
  }

  function initParticles(){
    particles = [];
    const count = (W < 800) ? COUNT_MOBILE : COUNT_DESKTOP;
    for (let i=0;i<count;i++){
      particles.push({
        x: rand(0, W),
        y: rand(0, H),
        r: rand(2, 14),
        vx: rand(-0.2,0.2),
        vy: rand(-0.12,0.12),
        hueOff: rand(-10,10),
        alpha: rand(0.18,0.7)
      });
    }
  }

  window.addEventListener('mousemove', (e)=> {
    mouseX = (e.clientX / W - 0.5) * 2;
    mouseY = (e.clientY / H - 0.5) * 2;
  }, { passive:true });

  window.addEventListener('resize', resize, { passive:true });

  function drawGradient(now) {
    const gx = CX + Math.sin(now*0.00025) * (W*0.12) + mouseX * 40;
    const gy = CY + Math.cos(now*0.0002) * (H*0.07) + mouseY * 20;
    const g = ctx.createRadialGradient(gx, gy, Math.min(W,H)*0.05, gx, gy, Math.max(W,H));
    const h1 = (hue % 360);
    const h2 = ((hue + 18) % 360);
    g.addColorStop(0, `hsla(${h1}, 85%, 30%, 0.14)`);
    g.addColorStop(0.5, `hsla(${h2}, 80%, 12%, 0.08)`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);
  }

  function render(now) {
    const dt = Math.min(40, now - last);
    last = now;
    hue += 0.01 * (dt/16);

    ctx.clearRect(0,0,W,H);

    ctx.globalAlpha = 1;
    drawGradient(now);

    for (let p of particles) {
      p.x += p.vx * (dt/16) * (1 + Math.abs(mouseX)*0.6);
      p.y += p.vy * (dt/16);

      if (p.x < -20) p.x = W + 20;
      if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20;
      if (p.y > H + 20) p.y = -20;

      const hueLocal = (hue + p.hueOff) % 360;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${hueLocal}, 85%, 50%, ${p.alpha})`;
      ctx.arc(p.x + mouseX*8*(1 + p.r/20), p.y + mouseY*6*(1 + p.r/30), p.r, 0, Math.PI*2);
      ctx.fill();
    }

    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = `hsla(${(hue+10)%360}, 90%, 50%, 1)`;
    const lines = 3;
    for (let i=0;i<lines;i++){
      ctx.beginPath();
      const offset = (i - 1) * 24 + (mouseY * 12);
      for (let x = -20; x < W + 20; x += 20) {
        const y = CY + Math.sin((x*0.008) + now*0.0012 + i) * (18 + i*6) + offset;
        if (x === -20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(render);
  }

  resize();
  requestAnimationFrame(render);
})();

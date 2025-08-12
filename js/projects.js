// js/projects.js — tilt + gif hover/pulse + applyGifEffect API
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.project-card');

  function bindTilt(card) {
    const media = card.querySelector('.project-media');
    const img = card.querySelector('.project-gif');
    const max = parseFloat(card.dataset.tiltMax) || 12;
    const scale = parseFloat(card.dataset.tiltScale) || 1.02;

    let anim = null;

    function onMove(e) {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = ((y - 0.5) * 2) * max;
      const ry = ((x - 0.5) * -2) * max;
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
      if (media) media.style.transform = `translate3d(${(x-0.5)*8}px, ${(y-0.5)*6}px, 0)`;
    }

    function onLeave() {
      card.style.transform = '';
      if (media) media.style.transform = '';
    }

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);

    // Web Animations API: delicate pulse for GIF on hover
    if (img && typeof img.animate === 'function') {
      card.addEventListener('mouseenter', () => {
        if (anim) anim.cancel();
        anim = img.animate([
          { transform: 'scale(1)', filter: 'brightness(1) saturate(1)' },
          { transform: 'scale(1.06)', filter: 'brightness(1.06) saturate(1.08)' }
        ], { duration: 700, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
      });
      card.addEventListener('mouseleave', () => {
        if (anim) { anim.cancel(); anim = null; }
        img.style.transform = '';
      });
    }
  }

  cards.forEach(bindTilt);

  // API for externally enabling effects on GIFs
  window.applyGifEffect = function(imgEl, opts = {}) {
    if (!imgEl) return;
    const mode = opts.mode || 'glow';
    imgEl.classList.add('gif-effect--active');
    imgEl.dataset.gifEffect = mode;
    if (opts.intensity !== undefined) imgEl.style.setProperty('--gif-eff-int', String(opts.intensity));
  };

});
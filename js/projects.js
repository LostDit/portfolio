// js/projects.js
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.project-card');
  if (cards.length === 0) return;

  // Initialize tilt effect
  function initTilt(card) {
    const max = parseFloat(card.dataset.tiltMax) || 12;
    const scale = parseFloat(card.dataset.tiltScale) || 1.02;
    const media = card.querySelector('.project-media');
    const img = card.querySelector('.project-gif');
    
    let anim = null;
    let isMobile = window.matchMedia('(pointer: coarse)').matches;

    // Skip tilt on mobile devices
    if (isMobile) return;

    function onMove(e) {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = ((y - 0.5) * 2) * max;
      const ry = ((x - 0.5) * -2) * max;
      
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
      
      if (media) {
        media.style.transform = `translate3d(${(x-0.5)*8}px, ${(y-0.5)*6}px, 0)`;
      }
    }

    function onLeave() {
      card.style.transform = '';
      if (media) media.style.transform = '';
      if (anim) {
        anim.cancel();
        anim = null;
      }
    }

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);

    // Add pulse animation to GIF
    if (img && typeof img.animate === 'function') {
      card.addEventListener('mouseenter', () => {
        if (anim) anim.cancel();
        anim = img.animate([
          { transform: 'scale(1)', filter: 'brightness(1) saturate(1)' },
          { transform: 'scale(1.06)', filter: 'brightness(1.06) saturate(1.08)' }
        ], { 
          duration: 700, 
          direction: 'alternate', 
          iterations: Infinity, 
          easing: 'ease-in-out' 
        });
      });
    }
  }

  // Initialize all cards
  cards.forEach(initTilt);
});
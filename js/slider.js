// js/slider.js
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.slider');
  if (!slider) return;

  const slidesEl = slider.querySelector('.slides');
  const slides = Array.from(slidesEl.querySelectorAll('.slide'));
  const dotsContainer = document.getElementById('slider-dots');
  const nextBtns = slider.querySelectorAll('[data-action="next"]');
  const prevBtns = slider.querySelectorAll('[data-action="prev"]');

  let index = 0;
  const total = slides.length;
  const AUTOPLAY_MS = 4500;
  let autoplay = true;
  let timer = null;

  // ensure only one slide is active
  function setActive(i) {
    index = ((i % total) + total) % total;
    slides.forEach((s, idx) => {
      s.classList.toggle('active', idx === index);
    });
    // update dots
    if (dotsContainer) {
      Array.from(dotsContainer.children).forEach((d, idx) => d.classList.toggle('active', idx === index));
    }
  }

  function next() { setActive(index + 1); restartAutoplay(); }
  function prev() { setActive(index - 1); restartAutoplay(); }

  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const d = document.createElement('button');
      d.className = 'slider-dot' + (i === 0 ? ' active' : '');
      d.type = 'button';
      d.setAttribute('aria-label', 'Перейти к слайду ' + (i+1));
      d.dataset.i = i;
      d.addEventListener('click', () => { setActive(parseInt(d.dataset.i, 10)); restartAutoplay(); });
      dotsContainer.appendChild(d);
    }
  }

  function restartAutoplay() {
    if (!autoplay) return;
    if (timer) { clearInterval(timer); timer = null; }
    timer = setInterval(() => setActive(index + 1), AUTOPLAY_MS);
  }

  // controls
  nextBtns.forEach(b => b.addEventListener('click', next));
  prevBtns.forEach(b => b.addEventListener('click', prev));

  // hover pause
  slider.addEventListener('mouseenter', () => { autoplay = false; if (timer) { clearInterval(timer); timer = null; } });
  slider.addEventListener('mouseleave', () => { autoplay = true; restartAutoplay(); });

  // keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // update on resize: nothing heavy, but keep it robust
  window.addEventListener('resize', () => { /* noop for now */ });

  // init
  buildDots();
  setActive(0);
  restartAutoplay();
});

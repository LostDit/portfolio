// js/slider.js
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.slider');
  if (!slider) return;

  const slidesEl = slider.querySelector('.slides');
  if (!slidesEl) return;

  const slides = Array.from(slidesEl.querySelectorAll('.slide'));
  const dotsContainer = slider.querySelector('#slider-dots');
  const nextBtns = slider.querySelectorAll('[data-action="next"]');
  const prevBtns = slider.querySelectorAll('[data-action="prev"]');
  const sliderControls = slider.querySelector('.slider-controls');

  if (slides.length === 0) return;

  let index = 0;
  const total = slides.length;
  const AUTOPLAY_MS = 4500;
  let autoplay = true;
  let timer = null;

  // ensure there is a visible caption area
  let caption = slider.querySelector('.slider-caption');
  if (!caption) {
    caption = document.createElement('div');
    caption.className = 'slider-caption';
    caption.textContent = 'Автоплей • Нажмите стрелки для навигации';
    if (sliderControls) sliderControls.appendChild(caption);
    else slider.appendChild(caption);
  }

  // play/pause button (small)
  let playBtn = slider.querySelector('.slider-playpause');
  if (!playBtn) {
    playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'slider-playpause';
    playBtn.setAttribute('aria-label', 'Пауза автоплея');
    playBtn.title = 'Пауза/воспроизвести';
    playBtn.style.marginLeft = '12px';
    playBtn.style.padding = '6px 8px';
    playBtn.style.borderRadius = '8px';
    playBtn.style.border = '1px solid rgba(255,255,255,0.04)';
    playBtn.style.background = 'transparent';
    playBtn.style.color = 'var(--text)';
    playBtn.style.cursor = 'pointer';
    playBtn.textContent = '⏸';
    caption.parentNode && caption.parentNode.appendChild(playBtn);
  }

  function updateCaption() {
    caption.textContent = autoplay ? 'Автоплей • Нажмите стрелки для навигации' : 'Автоплей приостановлён';
    playBtn.textContent = autoplay ? '⏸' : '▶';
    playBtn.setAttribute('aria-pressed', (!autoplay).toString());
  }

  // Set active slide
  function setActive(i) {
    index = ((i % total) + total) % total;
    slides.forEach((s, idx) => s.classList.toggle('active', idx === index));
    if (dotsContainer) {
      Array.from(dotsContainer.children).forEach((d, idx) => d.classList.toggle('active', idx === index));
    }
  }

  function next() { setActive(index + 1); restartAutoplay(); }
  function prev() { setActive(index - 1); restartAutoplay(); }

  // Build navigation dots
  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Перейти к слайду ' + (i + 1));
      dot.dataset.i = i;
      dot.addEventListener('click', () => {
        setActive(parseInt(dot.dataset.i, 10));
        restartAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  // Restart autoplay
  function restartAutoplay() {
    if (!autoplay) return;
    if (timer) clearInterval(timer);
    timer = setInterval(() => setActive(index + 1), AUTOPLAY_MS);
  }

  // toggle autoplay
  function toggleAutoplay() {
    autoplay = !autoplay;
    if (!autoplay && timer) {
      clearInterval(timer); timer = null;
    } else {
      restartAutoplay();
    }
    updateCaption();
  }

  // Add event listeners for controls
  if (nextBtns.length > 0) nextBtns.forEach(btn => btn.addEventListener('click', next));
  if (prevBtns.length > 0) prevBtns.forEach(btn => btn.addEventListener('click', prev));

  // Pause on hover
  slider.addEventListener('mouseenter', () => {
    if (autoplay) {
      if (timer) clearInterval(timer);
      timer = null;
    }
  });
  slider.addEventListener('mouseleave', () => { if (autoplay) restartAutoplay(); });

  // keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === ' ' && document.activeElement === document.body) {
      // space toggles autoplay only when not focused on input
      e.preventDefault();
      toggleAutoplay();
    }
  });

  // play/pause button handler
  playBtn.addEventListener('click', toggleAutoplay);

  // touch swipe (basic)
  let touchStartX = null;
  slidesEl.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slidesEl.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = (e.changedTouches[0].clientX - touchStartX);
    if (Math.abs(dx) > 40) {
      if (dx < 0) next(); else prev();
    }
    touchStartX = null;
  });

  // Initialize
  buildDots();
  setActive(0);
  updateCaption();
  restartAutoplay();
});

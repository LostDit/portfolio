// js/slider.js — Book flip slider for #presentation
document.addEventListener('DOMContentLoaded', () => {
  const book = document.getElementById('presentation');
  if (!book) return;

  const pagesWrapper = book.querySelector('.pages');
  const pages = Array.from(book.querySelectorAll('.page'));
  const pager = book.querySelector('.book-pager');
  const prevBtn = book.querySelector('[data-action="prev"]');
  const nextBtn = book.querySelector('[data-action="next"]');

  let index = 0;
  const total = pages.length;
  const AUTOPLAY_MS = 6000;
  let autoplay = true;
  let timer = null;
  let animating = false;

  function updatePager() {
    if (!pager) return;
    pager.textContent = `${index + 1} / ${total}`;
  }

  function setCurrent(i) {
    if (animating) return;
    animating = true;
    const prev = pages[index];
    const nextIndex = ((i % total) + total) % total;
    const next = pages[nextIndex];
    if (prev === next) { animating = false; return; }

    // flip prev to left (visual)
    prev.classList.add('flipped');
    prev.classList.remove('current');

    // show next
    next.classList.remove('flipped');
    next.classList.add('current');

    // after transition end, cleanup flipped pages except those behind current
    const onTransitionEnd = () => {
      // keep only current with high z-index, others remain rotated away
      pages.forEach((p, idx) => {
        if (idx === nextIndex) {
          p.classList.add('current');
          p.classList.remove('flipped');
          p.style.zIndex = 5;
        } else {
          p.classList.remove('current');
          p.style.zIndex = 1;
        }
      });
      index = nextIndex;
      updatePager();
      animating = false;
      prev.removeEventListener('transitionend', onTransitionEnd);
    };
    // listen transition on prev (it will flip)
    prev.addEventListener('transitionend', onTransitionEnd);
  }

  function next() { setCurrent(index + 1); restartAutoplay(); }
  function prev() { setCurrent(index - 1); restartAutoplay(); }

  function restartAutoplay() {
    if (!autoplay) return;
    if (timer) clearInterval(timer);
    timer = setInterval(() => setCurrent(index + 1), AUTOPLAY_MS);
  }

  // init pages state
  pages.forEach((p, i) => {
    p.classList.remove('current', 'flipped');
    if (i === 0) {
      p.classList.add('current');
      p.style.zIndex = 5;
    } else {
      p.classList.remove('current');
      p.classList.remove('flipped');
      p.style.zIndex = 1;
      // rotated away handled by CSS for non-current
    }
  });
  updatePager();
  restartAutoplay();

  // attach controls
  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);

  // pause on hover
  book.addEventListener('mouseenter', () => { autoplay = false; if (timer) clearInterval(timer); });
  book.addEventListener('mouseleave', () => { autoplay = true; restartAutoplay(); });

  // keyboard
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // touch: simple swipe support
  let touchStartX = null;
  book.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  book.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = (e.changedTouches[0].clientX - touchStartX);
    if (Math.abs(dx) > 40) {
      if (dx < 0) next(); else prev();
    }
    touchStartX = null;
  }, { passive: true });
});

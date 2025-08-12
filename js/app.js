// js/app.js — smooth scroll, reveal on scroll, safe menu toggle
(function () {
  'use strict';

  // Плавная прокрутка
  function smoothScrollTo(targetEl, offset = 72, duration = 520) {
    if (!targetEl) return;
    const startY = window.scrollY || window.pageYOffset;
    const rect = targetEl.getBoundingClientRect();
    const targetY = rect.top + startY - offset;
    const diff = targetY - startY;
    const start = performance.now();

    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      window.scrollTo(0, Math.round(startY + diff * eased));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Смягчающая привязка для ссылок
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        const el = document.querySelector(href);
        if (!el) return;
        e.preventDefault();
        smoothScrollTo(el, 84, 520);
      });
    });
  }

  // Reveal on scroll via IntersectionObserver
  function initRevealOnScroll() {
    const opts = { threshold: 0.12 };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('inview');
          // unobserve to preserve performance
          io.unobserve(en.target);
        }
      });
    }, opts);

    document.querySelectorAll('.project-card, section, .card').forEach(el => {
      io.observe(el);
    });
  }

  // Safe menu-toggle
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      const nav = document.querySelector('.nav');
      if (nav) nav.classList.toggle('active');
    });
  }

  // Accessibility helper
  function initAccessibility() {
    let usingKeyboard = false;
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') usingKeyboard = true;
      document.documentElement.classList.toggle('keyboard', usingKeyboard);
    });
    window.addEventListener('mousedown', () => {
      usingKeyboard = false;
      document.documentElement.classList.remove('keyboard');
    });
  }

  // init
  function init() {
    initSmoothAnchors();
    initRevealOnScroll();
    initAccessibility();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0);
  }

  window.__app_helpers = { smoothScrollTo };
})();

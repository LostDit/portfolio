// js/app.js
(function () {
  'use strict';

  // Smooth scrolling
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

  // Smooth anchor navigation
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

  // Reveal on scroll
  function initRevealOnScroll() {
    const opts = { threshold: 0.12 };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('inview');
          io.unobserve(en.target);
        }
      });
    }, opts);

    document.querySelectorAll('.project-card, section, .card').forEach(el => {
      io.observe(el);
    });
  }

  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      const nav = document.querySelector('.nav');
      if (nav) nav.classList.toggle('active');
      
      // Toggle aria-expanded
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
    });
  }

  // Accessibility features
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

  // Initialize all components
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

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-link');

  // простая подсветка по клику
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // подсветка по скроллу (IntersectionObserver)
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        const id = en.target.id;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => io.observe(s));
});

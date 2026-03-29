/* ============================================================
   GOATINC ROOFING & CONSTRUCTION
   main.js — Pass 3
   Modular, concise vanilla JS
   ============================================================ */

'use strict';

/* ============================================================
   UTILITY HELPERS
   ============================================================ */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   LUCIDE ICONS — initialise after DOM ready
   ============================================================ */
function initIcons() {
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* ============================================================
   NAV — scroll shadow + sticky
   ============================================================ */
function initNav() {
  const nav = qs('#nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ============================================================
   MOBILE MENU
   ============================================================ */
function initMobileMenu() {
  const hamburger = qs('.hamburger');
  const overlay   = qs('#menu-overlay');
  if (!hamburger || !overlay) return;

  const open = () => {
    overlay.style.top = nav.offsetHeight + 'px';
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    overlay.classList.add('open');
    document.body.classList.add('scroll-locked');
  };

  const close = () => {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    overlay.classList.remove('open');
    document.body.classList.remove('scroll-locked');
  };

  hamburger.addEventListener('click', () => {
    overlay.classList.contains('open') ? close() : open();
  });

  // Close on nav link click
  qsa('a', overlay).forEach(a => a.addEventListener('click', close));

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });
}

/* ============================================================
   MODAL
   ============================================================ */
function initModal() {
  const overlay = qs('#modal-overlay');
  if (!overlay) return;

  const openModal = () => {
    overlay.removeAttribute('hidden');
    document.body.classList.add('scroll-locked');
    // Focus first input
    const first = qs('input, select, textarea', overlay);
    if (first) first.focus();
  };

  const closeModal = () => {
    overlay.setAttribute('hidden', '');
    document.body.classList.remove('scroll-locked');
    clearFormErrors(overlay);
  };

  // All CTA buttons
  qsa('.open-modal').forEach(btn =>
    btn.addEventListener('click', openModal)
  );

  // Close button
  const closeBtn = qs('.modal-close', overlay);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Click outside modal box
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !overlay.hasAttribute('hidden')) closeModal();
  });
}

/* ============================================================
   FORM VALIDATION
   ============================================================ */
function validateField(field) {
  const error = field.parentElement.querySelector('.field-error');
  let msg = '';

  if (field.required && !field.value.trim()) {
    msg = 'This field is required.';
  } else if (field.type === 'email' && field.value.trim()) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(field.value.trim())) msg = 'Please enter a valid email.';
  } else if (field.type === 'tel' && field.value.trim()) {
    const stripped = field.value.replace(/\D/g, '');
    if (stripped.length < 10) msg = 'Please enter a valid phone number.';
  }

  if (error) error.textContent = msg;
  field.classList.toggle('invalid', !!msg);
  return !msg;
}

function clearFormErrors(ctx) {
  qsa('.field-error', ctx).forEach(e => e.textContent = '');
  qsa('.invalid', ctx).forEach(f => f.classList.remove('invalid'));
}

function initFormValidation() {
  qsa('form').forEach(form => {
    const fields = qsa('input[required], select[required], textarea[required]', form);

    // Live validate on blur
    fields.forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('invalid')) validateField(field);
      });
    });

    // Submit validation
    form.addEventListener('submit', e => {
      let valid = true;
      const requiredFields = qsa('input[required], select[required], textarea[required]', form);
      requiredFields.forEach(field => {
        if (!validateField(field)) valid = false;
      });
      if (!valid) {
        e.preventDefault();
        const firstInvalid = qs('.invalid', form);
        if (firstInvalid) firstInvalid.focus();
      }
    });
  });
}

/* ============================================================
   SCROLL FADE-UP (IntersectionObserver)
   ============================================================ */
function initScrollAnimations() {
  if (prefersReducedMotion()) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger within a group by order of appearance
          const delay = (entry.target.dataset.delay || 0);
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  // Apply stagger delays to grouped children
  const staggerParents = [
    '.services-grid',
    '.reviews-grid',
    '.stats-grid',
    '.area-grid',
    '.gallery-bento',
    '.about-badges',
    '.faq-list',
  ];

  staggerParents.forEach(sel => {
    const parent = qs(sel);
    if (!parent) return;
    qsa('.fade-up', parent).forEach((el, i) => {
      el.dataset.delay = i * 60;
    });
  });

  qsa('.fade-up').forEach(el => observer.observe(el));
}

/* ============================================================
   STATS COUNTER ANIMATION
   ============================================================ */
function animateCounter(el, target, duration = 1500) {
  if (prefersReducedMotion()) {
    el.textContent = target;
    return;
  }

  const start    = performance.now();
  const easeOut  = t => 1 - Math.pow(1 - t, 3); // cubic ease-out

  const tick = (now) => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    el.textContent = Math.round(easeOut(progress) * target);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };

  requestAnimationFrame(tick);
}

function initStatsCounter() {
  const statNumbers = qsa('.stat-number[data-target]');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.dataset.target, 10);
          animateCounter(el, target);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach(el => observer.observe(el));
}

/* ============================================================
   GALLERY — LIGHTBOX
   ============================================================ */
function initLightbox() {
  const lightbox   = qs('#lightbox');
  const lbImg      = qs('#lightbox-img');
  const lbCaption  = qs('#lightbox-caption');
  const closeBtn   = qs('.lightbox-close');
  const prevBtn    = qs('.lightbox-prev');
  const nextBtn    = qs('.lightbox-next');
  const items      = qsa('.gallery-item');

  if (!lightbox || !items.length) return;

  let current = 0;

  const getImgData = (index) => {
    const item = items[index];
    const img  = qs('img', item);
    const cap  = qs('.gallery-overlay span', item);
    return {
      src: img?.src || '',
      alt: img?.alt || '',
      caption: cap?.textContent || '',
    };
  };

  const show = (index) => {
    current = (index + items.length) % items.length;
    const { src, alt, caption } = getImgData(current);
    lbImg.src          = src;
    lbImg.alt          = alt;
    lbCaption.textContent = caption;
    lightbox.removeAttribute('hidden');
    document.body.classList.add('scroll-locked');
    closeBtn.focus();
  };

  const hide = () => {
    lightbox.setAttribute('hidden', '');
    document.body.classList.remove('scroll-locked');
    items[current]?.focus();
  };

  // Open on click
  items.forEach((item, i) => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `View project photo ${i + 1}`);

    item.addEventListener('click', () => show(i));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); }
    });
  });

  closeBtn?.addEventListener('click', hide);
  prevBtn?.addEventListener('click', () => show(current - 1));
  nextBtn?.addEventListener('click', () => show(current + 1));

  // Overlay click to close
  lightbox.addEventListener('click', e => { if (e.target === lightbox) hide(); });

  // Keyboard nav
  document.addEventListener('keydown', e => {
    if (lightbox.hasAttribute('hidden')) return;
    if (e.key === 'Escape')     hide();
    if (e.key === 'ArrowLeft')  show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  // Touch swipe
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) dx < 0 ? show(current + 1) : show(current - 1);
  }, { passive: true });
}

/* ============================================================
   GALLERY — HOVER PARALLAX (mouse 3D tilt)
   ============================================================ */
function initGalleryParallax() {
  if (prefersReducedMotion()) return;

  // Disable on touch devices
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (isTouch) return;

  const MAX_ROT = 8; // degrees

  qsa('.gallery-item').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotX   = (-dy * MAX_ROT).toFixed(2);
      const rotY   = ( dx * MAX_ROT).toFixed(2);
      card.style.transform         = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      card.style.transition        = 'transform 100ms linear';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 400ms ease';
    });
  });
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
function initFAQ() {
  qsa('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const answer   = btn.nextElementSibling;

      // Close all others
      qsa('.faq-question[aria-expanded="true"]').forEach(other => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          const otherAnswer = other.nextElementSibling;
          if (otherAnswer) otherAnswer.hidden = true;
        }
      });

      // Toggle current
      btn.setAttribute('aria-expanded', String(!expanded));
      if (answer) answer.hidden = expanded;
    });
  });
}

/* ============================================================
   SMOOTH ANCHOR SCROLL (offset for fixed nav)
   ============================================================ */
function initSmoothScroll() {
  const NAV_HEIGHT = 96;

  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id     = link.getAttribute('href');
      if (id === '#') return;
      const target = qs(id);
      if (!target) return;
      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
      window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    });
  });
}

/* ============================================================
   FOOTER YEAR
   ============================================================ */
function initFooterYear() {
  const el = qs('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ============================================================
   BEFORE / AFTER SLIDER
   ============================================================ */
function initBeforeAfter() {
  const wrap    = qs('.ba-wrap');
  if (!wrap) return;
  const before  = qs('.ba-before', wrap);
  const divider = qs('.ba-divider', wrap);
  let active = false;

  const setPos = (x) => {
    const rect = wrap.getBoundingClientRect();
    const pct  = Math.min(100, Math.max(0, ((x - rect.left) / rect.width) * 100));
    divider.style.left         = pct + '%';
    before.style.clipPath      = `inset(0 ${100 - pct}% 0 0)`;
  };

  wrap.addEventListener('pointerdown', e => {
    active = true;
    wrap.setPointerCapture(e.pointerId);
    setPos(e.clientX);
  });

  wrap.addEventListener('pointermove', e => {
    if (!active) return;
    setPos(e.clientX);
  });

  wrap.addEventListener('pointerup',     () => { active = false; });
  wrap.addEventListener('pointercancel', () => { active = false; });
}

/* ============================================================
   INIT — DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  initNav();
  initMobileMenu();
  initModal();
  initFormValidation();
  initScrollAnimations();
  initStatsCounter();
  initLightbox();
  initGalleryParallax();
  initFAQ();
  initSmoothScroll();
  initFooterYear();
  initBeforeAfter();
});

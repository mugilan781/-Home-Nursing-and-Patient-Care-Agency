/* =====================================================
   CARE HAVEN — Main JavaScript
   ===================================================== */

'use strict';

/* ─── Theme & LocalStorage ─── */
const ThemeManager = {
  KEY: 'careHavenTheme',
  DIR_KEY: 'careHavenDir',

  init() {
    const saved = localStorage.getItem(this.KEY) || 'light';
    const dir = localStorage.getItem(this.DIR_KEY) || 'ltr';
    this.apply(saved);
    this.applyDir(dir);
    this.bindToggle();
    this.bindDirToggle();
  },

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.KEY, theme);
    const sunSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    const moonSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    const icon = document.getElementById('themeIcon');
    if (icon) icon.innerHTML = theme === 'dark' ? sunSvg : moonSvg;
    const icon2 = document.getElementById('themeIcon2');
    if (icon2) icon2.innerHTML = theme === 'dark' ? sunSvg : moonSvg;
  },

  applyDir(dir) {
    document.documentElement.setAttribute('dir', dir);
    localStorage.setItem(this.DIR_KEY, dir);
    const btn = document.getElementById('dirToggle');
    if (btn) btn.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
    const btn2 = document.getElementById('dirToggle2');
    if (btn2) btn2.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    this.apply(current === 'dark' ? 'light' : 'dark');
  },

  toggleDir() {
    const current = document.documentElement.getAttribute('dir') || 'ltr';
    this.applyDir(current === 'rtl' ? 'ltr' : 'rtl');
  },

  bindToggle() {
    document.querySelectorAll('[data-theme-toggle]').forEach(el => {
      el.addEventListener('click', () => this.toggle());
    });
  },

  bindDirToggle() {
    document.querySelectorAll('[data-dir-toggle]').forEach(el => {
      el.addEventListener('click', () => this.toggleDir());
    });
  }
};

/* ─── Navbar ─── */
const Navbar = {
  el: null,
  lastScroll: 0,

  init() {
    this.el = document.getElementById('navbar');
    if (!this.el) return;
    this.onScroll();
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    this.initMobile();
    this.setActive();
  },

  onScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      this.el.classList.add('scrolled');
      this.el.classList.remove('transparent');
    } else {
      this.el.classList.remove('scrolled');
      if (this.el.dataset.transparent !== 'false') {
        this.el.classList.add('transparent');
      }
    }
    // FAB back to top
    const fab = document.getElementById('fabTop');
    if (fab) {
      if (scrollY > 400) fab.classList.add('visible');
      else fab.classList.remove('visible');
    }
    this.lastScroll = scrollY;
  },

  initMobile() {
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    const overlay = document.getElementById('mobileOverlay');

    if (!hamburger) return;

    hamburger.addEventListener('click', () => this.toggleMobile());
    overlay?.addEventListener('click', () => this.closeMobile());

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => this.closeMobile());
    });
  },

  toggleMobile() {
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    const overlay = document.getElementById('mobileOverlay');
    hamburger?.classList.toggle('open');
    mobileNav?.classList.toggle('open');
    overlay?.classList.toggle('open');
    document.body.style.overflow = mobileNav?.classList.contains('open') ? 'hidden' : '';
  },

  closeMobile() {
    document.getElementById('hamburger')?.classList.remove('open');
    document.getElementById('mobileNav')?.classList.remove('open');
    document.getElementById('mobileOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
  },

  setActive() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
      const href = link.getAttribute('href')?.split('/').pop();
      if (href === path) link.classList.add('active');
    });
  }
};

/* ─── Hero Slider ─── */
const HeroSlider = {
  current: 0,
  timer: null,
  interval: 5000,

  init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    this.slides = container.querySelectorAll('.hero-slide');
    this.dots = container.querySelectorAll('.slider-dot');
    if (this.slides.length === 0) return;
    this.show(0);
    this.startAuto();
    container.querySelector('.slider-prev')?.addEventListener('click', () => this.prev());
    container.querySelector('.slider-next')?.addEventListener('click', () => this.next());
    this.dots.forEach((dot, i) => dot.addEventListener('click', () => { this.show(i); this.resetAuto(); }));
    // Touch support
    let startX = 0;
    container.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    container.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? this.next() : this.prev();
    });
  },

  show(index) {
    this.slides.forEach((s, i) => {
      s.classList.toggle('active', i === index);
    });
    this.dots.forEach((d, i) => d.classList.toggle('active', i === index));
    this.current = index;
  },

  next() {
    this.show((this.current + 1) % this.slides.length);
    this.resetAuto();
  },

  prev() {
    this.show((this.current - 1 + this.slides.length) % this.slides.length);
    this.resetAuto();
  },

  startAuto() {
    this.timer = setInterval(() => this.next(), this.interval);
  },

  resetAuto() {
    clearInterval(this.timer);
    this.startAuto();
  }
};

/* ─── Scroll Reveal ─── */
const ScrollReveal = {
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
};

/* ─── FAQ Accordion ─── */
const FAQ = {
  init() {
    document.querySelectorAll('.faq-question').forEach(q => {
      q.addEventListener('click', () => {
        const item = q.closest('.faq-item');
        const answer = item.querySelector('.faq-answer');
        const isOpen = item.classList.contains('open');

        // Close others
        document.querySelectorAll('.faq-item.open').forEach(open => {
          if (open !== item) {
            open.classList.remove('open');
            open.querySelector('.faq-answer').style.maxHeight = null;
          }
        });

        item.classList.toggle('open', !isOpen);
        answer.style.maxHeight = !isOpen ? answer.scrollHeight + 'px' : null;
      });
    });
  }
};

/* ─── Form Validation ─── */
const FormValidator = {
  init() {
    document.querySelectorAll('[data-validate]').forEach(form => {
      form.addEventListener('submit', (e) => this.handleSubmit(e, form));
      form.querySelectorAll('.form-control').forEach(field => {
        field.addEventListener('blur', () => this.validateField(field));
        field.addEventListener('input', () => {
          if (field.classList.contains('error')) this.validateField(field);
        });
      });
    });
  },

  validateField(field) {
    const error = field.closest('.form-group')?.querySelector('.form-error');
    let msg = '';

    if (field.required && !field.value.trim()) {
      msg = 'This field is required.';
    } else if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      msg = 'Please enter a valid email address.';
    } else if (field.type === 'tel' && field.value && !/^[\+\d\s\-\(\)]{8,}$/.test(field.value)) {
      msg = 'Please enter a valid phone number.';
    } else if (field.minLength > 0 && field.value.length < field.minLength) {
      msg = `Minimum ${field.minLength} characters required.`;
    }

    field.classList.toggle('error', !!msg);
    if (error) {
      error.textContent = msg;
      error.classList.toggle('visible', !!msg);
    }
    return !msg;
  },

  handleSubmit(e, form) {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('.form-control').forEach(field => {
      if (!this.validateField(field)) valid = false;
    });
    if (valid) {
      const btn = form.querySelector('[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span class="spinner"></span> Sending...';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;vertical-align:middle;"><polyline points="20 6 9 17 4 12"/></svg> Message Sent Successfully!';
        btn.style.background = '#2E7D32';
        form.reset();
        Toast.show('Thank you! We\'ll contact you within 2 hours.');
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 4000);
      }, 1800);
    }
  }
};

/* ─── Toast Notification ─── */
const Toast = {
  el: null,

  show(msg, duration = 4000) {
    if (!this.el) {
      this.el = document.createElement('div');
      this.el.className = 'toast';
      document.body.appendChild(this.el);
    }
    this.el.textContent = msg;
    this.el.classList.add('visible');
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.el.classList.remove('visible'), duration);
  }
};

/* ─── Page Transition ─── */
const PageTransition = {
  el: null,

  init() {
    this.el = document.getElementById('pageTransition');
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('http')) return;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(href);
      });
    });
  },

  navigate(href) {
    if (!this.el) { window.location.href = href; return; }
    this.el.classList.add('active');
    setTimeout(() => window.location.href = href, 450);
  }
};

/* ─── Counter Animation ─── */
const Counter = {
  init() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => observer.observe(el));
  },

  animate(el) {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();
    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(this.easeOut(progress) * target);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  },

  easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }
};

/* ─── Smooth Parallax ─── */
const Parallax = {
  init() {
    document.querySelectorAll('[data-parallax]').forEach(el => {
      window.addEventListener('scroll', () => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        const rect = el.getBoundingClientRect();
        const offset = (window.innerHeight / 2 - rect.top - rect.height / 2) * speed;
        el.style.transform = `translateY(${offset}px)`;
      }, { passive: true });
    });
  }
};

/* ─── FAB Back to Top ─── */
const FAB = {
  init() {
    const fab = document.getElementById('fabTop');
    if (fab) fab.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
};

/* ─── Tabs ─── */
const Tabs = {
  init() {
    document.querySelectorAll('[data-tabs]').forEach(container => {
      const triggers = container.querySelectorAll('[data-tab]');
      triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          const target = trigger.dataset.tab;
          triggers.forEach(t => t.classList.remove('active'));
          trigger.classList.add('active');
          container.querySelectorAll('[data-tab-content]').forEach(content => {
            content.classList.toggle('active', content.dataset.tabContent === target);
          });
        });
      });
    });
  }
};

/* ─── Image Zoom ─── */
const ImageZoom = {
  init() {
    document.querySelectorAll('[data-zoom]').forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => this.open(img.src, img.alt));
    });
  },

  open(src, alt) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:20px;';
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    img.style.cssText = 'max-width:90vw;max-height:90vh;object-fit:contain;border-radius:8px;animation:scaleIn 0.3s ease;';
    overlay.appendChild(img);
    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
  }
};

/* ─── Sticky Table of Contents ─── */
const TOC = {
  init() {
    const toc = document.getElementById('toc');
    if (!toc) return;
    const headings = document.querySelectorAll('article h2, article h3');
    const links = toc.querySelectorAll('a');
    window.addEventListener('scroll', () => {
      let current = '';
      headings.forEach(h => {
        if (window.scrollY >= h.offsetTop - 120) current = h.id;
      });
      links.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
      });
    }, { passive: true });
  }
};

/* ─── Testimonial Carousel ─── */
const TestimonialSlider = {
  init(id) {
    const container = document.getElementById(id);
    if (!container) return;
    let isDragging = false, startX = 0, scrollLeft = 0;
    container.addEventListener('mousedown', e => {
      isDragging = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      container.style.cursor = 'grabbing';
    });
    container.addEventListener('mouseleave', () => { isDragging = false; container.style.cursor = ''; });
    container.addEventListener('mouseup', () => { isDragging = false; container.style.cursor = ''; });
    container.addEventListener('mousemove', e => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      container.scrollLeft = scrollLeft - (x - startX);
    });
  }
};

/* ─── Cookie Consent ─── */
const CookieConsent = {
  init() {
    if (localStorage.getItem('cookieConsent') === 'accepted') return;
    const banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;bottom:20px;left:20px;right:20px;max-width:500px;background:var(--charcoal);color:rgba(255,255,255,0.85);padding:20px 24px;border-radius:12px;box-shadow:var(--shadow-xl);z-index:9997;font-size:0.85rem;line-height:1.6;display:flex;gap:16px;align-items:center;flex-wrap:wrap;';
    banner.innerHTML = `
      <div style="flex:1;min-width:200px;display:flex;align-items:center;gap:8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--champagne)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><span>We use cookies to enhance your experience and analyze our traffic. <a href="privacy.html" style="color:var(--champagne);">Privacy Policy</a></span></div>
      <div style="display:flex;gap:10px;flex-shrink:0;">
        <button onclick="CookieConsent.accept(this.closest('div[style]'))" style="background:var(--champagne);color:var(--charcoal);border:none;padding:8px 18px;border-radius:999px;font-weight:700;font-size:0.82rem;cursor:pointer;">Accept</button>
        <button onclick="this.closest('div[style]').remove()" style="background:transparent;color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.2);padding:8px 18px;border-radius:999px;font-size:0.82rem;cursor:pointer;">Decline</button>
      </div>`;
    document.body.appendChild(banner);
  },
  accept(el) {
    localStorage.setItem('cookieConsent', 'accepted');
    el.remove();
  }
};

/* ─── Lazy Images ─── */
const LazyImages = {
  init() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    });
    document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
  }
};

/* ─── Init All ─── */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  Navbar.init();
  ScrollReveal.init();
  FAQ.init();
  FormValidator.init();
  Counter.init();
  FAB.init();
  Tabs.init();
  ImageZoom.init();
  TOC.init();
  LazyImages.init();
  CookieConsent.init();

  // Sliders (init per-page)
  if (document.getElementById('heroSlider')) HeroSlider.init('heroSlider');
  if (document.getElementById('testimonialTrack')) TestimonialSlider.init('testimonialTrack');

  // Page transition
  PageTransition.init();
});

// Expose globally for inline use
window.ThemeManager = ThemeManager;
window.Toast = Toast;
window.CookieConsent = CookieConsent;

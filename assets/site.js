/* PrivateForge marketing — interactions */
(function () {
  'use strict';
  var doc = document.documentElement;

  /* ---------- Theme toggle ---------- */
  function getInitialTheme() {
    try {
      var stored = window.__pfTheme || null;
      if (stored) return stored;
    } catch (e) {}
    return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  var theme = getInitialTheme();
  doc.setAttribute('data-theme', theme);

  function paintToggle(btn, t) {
    if (!btn) return;
    btn.setAttribute('aria-label', 'Switch to ' + (t === 'dark' ? 'light' : 'dark') + ' mode');
    btn.innerHTML = t === 'dark'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  function bindThemeToggles() {
    var toggles = document.querySelectorAll('[data-theme-toggle]');
    toggles.forEach(function (btn) {
      paintToggle(btn, theme);
      btn.addEventListener('click', function () {
        theme = theme === 'dark' ? 'light' : 'dark';
        doc.setAttribute('data-theme', theme);
        try { window.__pfTheme = theme; } catch (e) {}
        toggles.forEach(function (b) { paintToggle(b, theme); });
      });
    });
  }

  /* ---------- Scroll-aware header ---------- */
  function bindHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var apply = function () {
      if (window.scrollY > 8) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    apply();
    window.addEventListener('scroll', apply, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  function bindMobileMenu() {
    var btn = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!btn || !menu) return;
    btn.addEventListener('click', function () {
      var open = menu.getAttribute('data-open') === 'true';
      menu.setAttribute('data-open', open ? 'false' : 'true');
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.setAttribute('data-open', 'false');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function bindReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    doc.classList.add('js-reveal-ready');
    var revealAll = function () { els.forEach(function (e) { e.classList.add('in'); }); };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches
        || !('IntersectionObserver' in window)) {
      revealAll();
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
    // Safety net: after 4s, ensure everything is shown even if observer missed it.
    setTimeout(revealAll, 4000);
    // Also reveal everything when user reaches end of page or when document height grows
    var onScroll = function () {
      var nearBottom = window.scrollY + window.innerHeight
        > document.documentElement.scrollHeight - 200;
      if (nearBottom) { revealAll(); window.removeEventListener('scroll', onScroll); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Card cursor glow ---------- */
  function bindCardGlow() {
    var cards = document.querySelectorAll('.card');
    cards.forEach(function (card) {
      // Add the glow element if missing
      if (!card.querySelector('.glow')) {
        var g = document.createElement('span');
        g.className = 'glow';
        card.prepend(g);
      }
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width) * 100;
        var y = ((e.clientY - r.top) / r.height) * 100;
        card.style.setProperty('--x', x + '%');
        card.style.setProperty('--y', y + '%');
      });
    });
  }

  /* ---------- Subtle hero parallax ---------- */
  function bindHeroParallax() {
    var img = document.querySelector('.hero-image');
    if (!img) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    window.addEventListener('scroll', function () {
      var y = Math.min(window.scrollY, 600);
      img.style.transform = 'translate3d(0, ' + (y * 0.08) + 'px, 0) scale(1.02)';
    }, { passive: true });
  }

  /* ---------- Spark burst on primary button hover ---------- */
  function bindSparks() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var btns = document.querySelectorAll('.btn-primary');
    btns.forEach(function (btn) {
      btn.addEventListener('mouseenter', function () {
        var burst = document.createElement('span');
        burst.style.cssText = 'position:absolute;pointer-events:none;width:6px;height:6px;background:#ffd58a;border-radius:50%;box-shadow:0 0 8px #ff6b35;left:0;top:50%;opacity:0;animation:spark-fly .9s ease-out forwards;';
        if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
        btn.appendChild(burst);
        setTimeout(function () { burst.remove(); }, 900);
      });
    });
  }
  // Inject keyframes
  (function () {
    var s = document.createElement('style');
    s.textContent = '@keyframes spark-fly { 0% { transform: translate(-4px, -50%) scale(0.5); opacity: 0; } 30% { opacity: 1; } 100% { transform: translate(40px, -180%) scale(0.2); opacity: 0; } }';
    document.head.appendChild(s);
  })();

  /* ---------- Year in footer ---------- */
  function setYear() {
    var els = document.querySelectorAll('[data-year]');
    var y = new Date().getFullYear();
    els.forEach(function (e) { e.textContent = y; });
  }

  /* ---------- Init ---------- */
  function init() {
    bindThemeToggles();
    bindHeader();
    bindMobileMenu();
    bindReveal();
    bindCardGlow();
    bindHeroParallax();
    bindSparks();
    setYear();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* PrivateForge marketing — small, focused JS.
   - theme toggle
   - scroll reveal via IntersectionObserver
   - ticker is CSS-only marquee; we just duplicate children once for seamless loop
   - footer build hash + last-updated stamp
*/
(function () {
  const root = document.documentElement;

  /* ---- Theme ----------------------------------------------------------- */
  // In-memory only (some hosting environments block localStorage).
  const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = root.getAttribute('data-theme') || (sysDark ? 'dark' : 'light');
  root.setAttribute('data-theme', initial);

  function setTheme(t) {
    root.setAttribute('data-theme', t);
    paintToggle(t);
  }

  const sun  = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
  const moon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function paintToggle(t) {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.innerHTML = t === 'dark' ? sun : moon;
      btn.setAttribute('aria-label', 'Switch to ' + (t === 'dark' ? 'light' : 'dark') + ' mode');
    });
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    const cur = root.getAttribute('data-theme') || 'light';
    setTheme(cur === 'dark' ? 'light' : 'dark');
  });

  /* ---- Reveal ---------------------------------------------------------- */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const allReveals = () => document.querySelectorAll('.reveal');
  function revealAll() { allReveals().forEach(el => el.classList.add('is-visible')); }
  if (reduce) {
    revealAll();
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.05 });
    allReveals().forEach(el => io.observe(el));
    // Safety net: any reveal still hidden after a moment is shown anyway —
    // this avoids blank sections in headless captures, print, or odd browsers.
    setTimeout(() => {
      allReveals().forEach(el => {
        if (!el.classList.contains('is-visible')) el.classList.add('is-visible');
      });
    }, 1200);
  } else {
    revealAll();
  }

  /* ---- Ticker: duplicate children once for seamless marquee ----------- */
  document.querySelectorAll('.ticker__track').forEach(track => {
    const html = track.innerHTML;
    track.innerHTML = html + html;
  });

  /* ---- Footer build stamp --------------------------------------------- */
  const issueEl = document.querySelector('[data-issue]');
  const dateEl  = document.querySelector('[data-stamp]');
  const hashEl  = document.querySelector('[data-build]');
  const now = new Date();

  // Issue number = days since 2024-01-01 (just a fun running counter)
  if (issueEl) {
    const start = new Date('2024-01-01T00:00:00Z').getTime();
    const days = Math.floor((now.getTime() - start) / (1000 * 60 * 60 * 24));
    issueEl.textContent = String(days).padStart(4, '0');
  }
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }
  if (hashEl) {
    // deterministic-looking pseudo hash from date — purely cosmetic
    const seed = now.toISOString().slice(0, 10).replace(/-/g, '');
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
    hashEl.textContent = (h >>> 0).toString(16).slice(0, 7);
  }

  // Initial paint
  paintToggle(initial);
})();

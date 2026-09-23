/* ═══════════════════════════════════════════════════════════════════════
   pages.js — the small amount of behaviour the content pages need:
   the phone menu, the header that tucks away on the way down, the
   Services dropdown on touch, reveal-on-scroll and the contact form.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Phone menu ─────────────────────────────────────────────────────── */
  const menuBtn = document.querySelector('.hd-menu');
  const menuLabel = menuBtn?.querySelector('.hd-menu-label');
  const menu = document.getElementById('pm');
  if (menuBtn && menu) {
    const setOpen = (open) => {
      menuBtn.setAttribute('aria-expanded', String(open));
      if (menuLabel) menuLabel.textContent = open ? 'Close' : 'Menu';
      document.body.classList.toggle('menu-open', open);
      document.documentElement.style.overflow = open ? 'hidden' : '';
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(() => menu.classList.add('is-open'));
      } else {
        menu.classList.remove('is-open');
        setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 550);
      }
    };
    menuBtn.addEventListener('click', () => setOpen(menuBtn.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setOpen(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 1100 && !menu.hidden) setOpen(false); });
  }

  /* ── Header: tucks away on the way down, returns on the way up ─────── */
  const hd = document.querySelector('.hd');
  if (hd) {
    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 4) return;
      const openSub = document.querySelector('.has-sub.is-open, .has-sub:focus-within');
      hd.classList.toggle('is-hidden', y > lastY && y > 240 && !openSub && !document.body.classList.contains('menu-open'));
      lastY = y;
    }, { passive: true });
  }

  /* ── The footer wordmark always spans the full width ────────────────── */
  const giant = document.querySelector('.ft-giant');
  const fitGiant = () => {
    const span = giant && giant.firstElementChild;
    if (!span) return;
    giant.style.fontSize = '';
    const cs = getComputedStyle(giant);
    const room = giant.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const w = span.getBoundingClientRect().width;
    if (w > 0) giant.style.fontSize = (parseFloat(cs.fontSize) * room) / w + 'px';
  };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(fitGiant);
  window.addEventListener('resize', fitGiant);

  /* ── Services dropdown: hover on desktop, tap to toggle elsewhere ──── */
  for (const item of document.querySelectorAll('.has-sub')) {
    const toggle = item.querySelector('.sub-toggle');
    toggle?.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => {
      if (!item.contains(e.target)) {
        item.classList.remove('is-open');
        toggle?.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Reveal on scroll ───────────────────────────────────────────────── */
  if (!reduced && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('.deliver-item, .step, .svc-rows > li, .wk, .member, .post-card, .faq, .sec-head, .prose > *, .launch-in > *');
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    targets.forEach((el, i) => {
      // only animate what starts below the fold — nothing above it flickers
      if (el.getBoundingClientRect().top > window.innerHeight * 0.9) {
        el.classList.add('reveal');
        el.style.transitionDelay = `${(i % 3) * 70}ms`;
        io.observe(el);
      }
    });
  }

  /* ── Contact form ───────────────────────────────────────────────────── */
  const form = document.querySelector('form[data-contact]');
  if (form) {
    const openedAt = performance.now();
    const status = form.querySelector('.form-status');
    const submit = form.querySelector('button[type="submit"]');
    const done = form.parentElement.querySelector('.form-done');
    const rules = {
      name: (v) => v.length >= 2,
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
      message: (v) => v.length >= 10,
    };
    const fieldOf = (name) => form.querySelector(`[name="${name}"]`)?.closest('.field');
    form.addEventListener('input', (e) => e.target.closest('.field')?.classList.remove('invalid'));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let ok = true;
      for (const [name, test] of Object.entries(rules)) {
        const valid = test(String(form.elements[name].value || '').trim());
        fieldOf(name)?.classList.toggle('invalid', !valid);
        if (!valid) ok = false;
      }
      if (!ok) return;
      const data = new FormData(form);
      const services = data.getAll('services');
      let message = String(data.get('message') || '').trim();
      if (services.length) message = `Interested in: ${services.join(', ')}\n\n${message}`;
      submit.disabled = true;
      status.textContent = 'Sending…';
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name: data.get('name'),
            email: data.get('email'),
            message,
            budget: data.get('budget') || 'Undecided',
            company: data.get('company') || '',
            elapsed: Math.round(performance.now() - openedAt),
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (res.status === 422 && body.errors) {
          for (const [name, msg] of Object.entries(body.errors)) {
            const f = fieldOf(name);
            if (f) {
              f.classList.add('invalid');
              const err = f.querySelector('.err');
              if (err) err.textContent = msg;
            }
          }
          status.textContent = 'Check the highlighted fields';
          return;
        }
        if (res.status === 429) {
          status.textContent = body.error || 'Too many attempts — try again shortly';
          return;
        }
        if (!res.ok || !body.ok) throw new Error(String(res.status));
        form.hidden = true;
        done.hidden = false;
        done.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      } catch {
        status.textContent = 'Could not send — please try again in a moment';
      } finally {
        submit.disabled = false;
      }
    });
  }
})();

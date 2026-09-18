/* ═══════════════════════════════════════════════════════════════════════
   pages.js — the small amount of behaviour the content pages need:
   the mobile menu, the Services dropdown on touch, reveal-on-scroll, the
   contact form, and pausing the hero orbit for reduced motion.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Mobile menu ────────────────────────────────────────────────────── */
  const menuBtn = document.querySelector('.ph-menu');
  const menu = document.getElementById('pm');
  if (menuBtn && menu) {
    const setOpen = (open) => {
      menuBtn.setAttribute('aria-expanded', String(open));
      document.documentElement.style.overflow = open ? 'hidden' : '';
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(() => menu.classList.add('is-open'));
      } else {
        menu.classList.remove('is-open');
        setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 300);
      }
    };
    menuBtn.addEventListener('click', () => setOpen(menuBtn.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setOpen(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 900 && !menu.hidden) setOpen(false); });
  }

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
    const targets = document.querySelectorAll('.cards, .step, .svc-card, .work-card, .member, .post-card, .faq, .band-head, .prose > *');
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

  /* ── The hero orbit (SVG animateMotion) respects reduced motion ────── */
  if (reduced) document.querySelectorAll('.hero-art svg').forEach((svg) => svg.pauseAnimations?.());

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

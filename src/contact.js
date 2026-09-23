/* ═══════════════════════════════════════════════════════════════════════
   contact.js — the "Book a launch" drawer.

   Slides in from the right over the page (Lenis is paused while it is
   open), validates inline, and POSTs to the studio's own backend —
   POST /api/contact (see server/). The backend stores every inquiry and
   emails it on once CONTACT_TO is configured; until then the visitor still
   gets a clean "received", because it *was* received.
   ═══════════════════════════════════════════════════════════════════════ */
const ENDPOINT = '/api/contact';

export function createContact({ lenis }) {
  const root = document.getElementById('contact');
  const panel = root.querySelector('.drawer-panel');
  const backdrop = root.querySelector('.drawer-backdrop');
  const closeBtn = root.querySelector('.drawer-close');
  const form = root.querySelector('.contact-form');
  const status = root.querySelector('.contact-status');
  const submitBtn = root.querySelector('.contact-submit');

  let open = false;
  let lastFocus = null;
  let openedAt = 0;
  let hideTimer = 0;

  function show() {
    if (open) return;
    open = true;
    clearTimeout(hideTimer);
    openedAt = performance.now();
    lastFocus = document.activeElement;
    root.hidden = false;
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      root.classList.add('is-open');
      const first = root.classList.contains('sent') ? closeBtn : form.querySelector('input[name="firstName"]');
      // wait for the slide before focusing, or the page jumps on iOS
      setTimeout(() => first.focus({ preventScroll: true }), 350);
    });
  }

  function hide() {
    if (!open) return;
    open = false;
    root.classList.remove('is-open');
    hideTimer = setTimeout(() => {
      root.hidden = true;
      lenis?.start();
      document.documentElement.style.overflow = '';
      lastFocus?.focus?.({ preventScroll: true });
      // a sent form resets once the drawer is away, ready for next time
      if (root.classList.contains('sent')) {
        root.classList.remove('sent');
        form.reset();
        status.textContent = '';
        status.classList.remove('err');
      }
    }, 600);
  }

  closeBtn.addEventListener('click', hide);
  backdrop.addEventListener('click', hide);
  window.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') hide();
    // keep Tab inside the drawer
    if (e.key === 'Tab') {
      const items = [...panel.querySelectorAll('button, input, select, textarea, a[href]')].filter(
        (el) => !el.disabled && el.offsetParent !== null && el.tabIndex !== -1
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* ── Validation + submit ────────────────────────────────────────────── */
  // every field is required (mirrors server/validate.js)
  const digits = (v) => v.replace(/\D/g, '').length;
  const rules = {
    firstName: (v) => v.length >= 1,
    lastName: (v) => v.length >= 1,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
    country: (v) => v.length > 0,
    phone: (v) => /^\+?[0-9\s().\-]{6,24}$/.test(v) && digits(v) >= 6 && digits(v) <= 15,
    message: (v) => v.length >= 10,
  };

  function setError(name, message) {
    const field = form.querySelector(`[name="${name}"]`)?.closest('.contact-field');
    if (!field) return;
    field.classList.add('invalid');
    if (message) field.querySelector('.contact-err').textContent = message;
  }

  function validate() {
    let ok = true;
    for (const [name, test] of Object.entries(rules)) {
      const input = form.querySelector(`[name="${name}"]`);
      const valid = test(input.value.trim());
      input.closest('.contact-field').classList.toggle('invalid', !valid);
      input.setAttribute('aria-invalid', String(!valid));
      if (!valid && ok) input.focus();
      if (!valid) ok = false;
    }
    return ok;
  }

  // clear the error as soon as the visitor fixes a field
  form.addEventListener('input', (e) => {
    const field = e.target.closest('.contact-field');
    if (field) {
      field.classList.remove('invalid');
      e.target.removeAttribute('aria-invalid');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    submitBtn.disabled = true;
    status.textContent = 'Sending…';
    status.classList.remove('err');

    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...data, elapsed: Math.round(performance.now() - openedAt) }),
      });
      const body = await res.json().catch(() => ({}));

      if (res.status === 422 && body.errors) {
        for (const [name, message] of Object.entries(body.errors)) setError(name, message);
        status.textContent = 'Check the highlighted fields';
        status.classList.add('err');
        return;
      }
      if (res.status === 429) {
        status.textContent = body.error || 'Too many attempts — try again shortly';
        status.classList.add('err');
        return;
      }
      if (!res.ok || !body.ok) throw new Error(`backend responded ${res.status}`);

      status.textContent = '';
      root.classList.add('sent');
      panel.scrollTop = 0;
      closeBtn.focus({ preventScroll: true });
    } catch {
      status.textContent = 'Could not send — please try again in a moment';
      status.classList.add('err');
    } finally {
      submitBtn.disabled = false;
    }
  });

  return { show, hide, isOpen: () => open };
}

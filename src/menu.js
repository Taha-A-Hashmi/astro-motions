/* ═══════════════════════════════════════════════════════════════════════
   menu.js — the phone menu on the 3D home page. The header's page links
   don't fit on a small screen, so a "Menu" button opens a full-screen
   list instead. Lenis is paused while it is open.
   ═══════════════════════════════════════════════════════════════════════ */
export function createMenu({ lenis }) {
  const btn = document.querySelector('.header-menu');
  const menu = document.getElementById('site-menu');
  if (!btn || !menu) return;

  const setOpen = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Close' : 'Menu';
    document.body.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      lenis.stop();
      requestAnimationFrame(() => menu.classList.add('is-open'));
    } else {
      menu.classList.remove('is-open');
      lenis.start();
      setTimeout(() => {
        if (!menu.classList.contains('is-open')) menu.hidden = true;
      }, 350);
    }
  };
  btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) setOpen(false);
  });
}

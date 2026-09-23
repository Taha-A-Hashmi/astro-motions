/* ═══════════════════════════════════════════════════════════════════════
   menu.js — the phone menu. Below 1100px the header's page links fold
   into a "Menu" button that drops a full-screen cobalt sheet. Lenis is
   paused while it is open.
   ═══════════════════════════════════════════════════════════════════════ */
export function createMenu({ lenis }) {
  const btn = document.querySelector('.hd-menu');
  const label = btn?.querySelector('.hd-menu-label');
  const menu = document.getElementById('menu');
  if (!btn || !menu) return { close() {} };

  const isOpen = () => btn.getAttribute('aria-expanded') === 'true';
  const setOpen = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Close' : 'Menu';
    document.body.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      lenis?.stop();
      document.documentElement.style.overflow = 'hidden';
      requestAnimationFrame(() => menu.classList.add('is-open'));
    } else {
      menu.classList.remove('is-open');
      lenis?.start();
      document.documentElement.style.overflow = '';
      setTimeout(() => {
        if (!menu.classList.contains('is-open')) menu.hidden = true;
      }, 550);
    }
  };
  btn.addEventListener('click', () => setOpen(!isOpen()));
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) setOpen(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1100 && isOpen()) setOpen(false);
  });
  return { close: () => isOpen() && setOpen(false) };
}

/* ═══════════════════════════════════════════════════════════════════════
   main.js — the home page's behaviour.

   The page is ordinary, crawlable HTML; this file only adds motion on top:
     · Lenis smooth scrolling + GSAP ScrollTrigger for scroll-linked bits
     · the header (solid once scrolled, hides on the way down)
     · the hero entrance, and the 3D layer (src/gl/*, loaded lazily): one
       WebGL stage drawing the planet, the manifesto morph, the services
       cloud, the orrery and the warp tunnel into their placeholders
     · the pinned manifesto: which line shows, and the morph position
     · reveal-on-scroll and the work-card pointer
     · the contact drawer and phone menu, routed through [data-open]
   Everything degrades to a static page if JS or WebGL are missing.
   ═══════════════════════════════════════════════════════════════════════ */
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { quality } from './quality.js';
import { createContact } from './contact.js';
import { createMenu } from './menu.js';

gsap.registerPlugin(ScrollTrigger);
const { reduced, coarse } = quality;
const root = document.documentElement;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ── The 3D layer loads straight away, in parallel with fonts ───────── */
// main.js owns the manifesto's scroll position; the 3D just reads it.
const manifestoState = { s: 0 };
import('./gl/home.js')
  .then(({ initHome }) => initHome({ quality, manifestoState }))
  .catch((err) => {
    console.warn('3D layer unavailable:', err);
    root.classList.add('no-gl');
  });

/* ── Smooth scroll ──────────────────────────────────────────────────── */
const lenis = reduced ? null : new Lenis({ lerp: 0.1, smoothWheel: true });
if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const scrollTo = (target) => {
  if (lenis) lenis.scrollTo(target, { duration: 1.6 });
  else (typeof target === 'number' ? window.scrollTo({ top: target }) : target.scrollIntoView());
};

/* ── Header: solid after the first few pixels, hides on the way down ── */
const hd = $('.hd');
let lastY = window.scrollY;
function onScroll() {
  const y = window.scrollY;
  hd.classList.toggle('is-solid', y > 12);
  const down = y > lastY;
  if (Math.abs(y - lastY) > 4) hd.classList.toggle('is-hidden', down && y > 240);
  lastY = y;
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ── Overlays and routing ───────────────────────────────────────────── */
const contact = createContact({ lenis });
const menu = createMenu({ lenis });

document.addEventListener('click', (e) => {
  const opener = e.target.closest('[data-open]');
  if (opener) {
    e.preventDefault();
    menu.close();
    if (opener.dataset.open === 'contact') contact.show();
    else if (opener.dataset.open === 'work') scrollTo($('#work'));
    return;
  }
  // in-page anchors ride the smooth scroll instead of jumping
  const a = e.target.closest('a[href^="#"]');
  if (a && a.getAttribute('href').length > 1) {
    const target = $(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      scrollTo(a.getAttribute('href') === '#top' ? 0 : target);
    }
  }
});

// Content pages link home with ?open=contact|work — honour it, then tidy
// the address bar so a reload doesn't reopen it.
const openParam = new URLSearchParams(location.search).get('open');
if (openParam) {
  const url = new URL(location.href);
  url.searchParams.delete('open');
  history.replaceState(null, '', url.pathname + url.search + url.hash);
}

/* ── Manifesto: the pinned section's progress picks the line on show ── */
const mf = $('.manifesto');
const mfRows = $$('.mf-row');
const mfTicks = $$('.mf-meter i');
function onManifesto() {
  if (!mf) return;
  const r = mf.getBoundingClientRect();
  const p = Math.min(Math.max(-r.top / Math.max(r.height - window.innerHeight, 1), 0), 1);
  // 0 → dust, 1 → ground, 2 → galaxy, 3 → the word; hold each shape a while
  const s = Math.min(Math.max(p * 3.6 - 0.25, 0), 3);
  manifestoState.s = s;
  const line = s < 0.55 ? 0 : Math.min(3, Math.round(s));
  mfRows.forEach((row, i) => row.classList.toggle('is-on', i + 1 === line));
  mfTicks.forEach((t, i) => t.classList.toggle('on', i < line));
}
window.addEventListener('scroll', onManifesto, { passive: true });
onManifesto();

/* ── Once the copy (and, briefly, the fonts) are in place ───────────── */
const fontsReady = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 1400))]);
// In production the server has already injected the dashboard copy (window.__CMS__);
// only Vite dev needs the client-side apply, so the schema stays out of the bundle.
const applied = window.__CMS__ ? Promise.resolve() : import('./content.js').then((m) => m.applyContent());
const contentReady = Promise.race([applied.catch(() => {}), new Promise((r) => setTimeout(r, 1400))]);

Promise.all([fontsReady, contentReady]).then(() => {
  // hero entrance
  requestAnimationFrame(() => root.classList.add('is-ready'));

  reveal();
  ScrollTrigger.refresh();

  if (openParam === 'contact') setTimeout(() => contact.show(), 500);
  else if (openParam === 'work') setTimeout(() => scrollTo($('#work')), 500);
});

/* ── Reveal on scroll ───────────────────────────────────────────────── */
function reveal() {
  if (reduced || !('IntersectionObserver' in window)) return;
  const groups = [
    '.sec-head > *',
    '.svc-rows > li',
    '.work-grid > .wk',
    '.work-foot',
    '.disciplines > li',
    '.launch-in > *',
    '.ft-cols > *',
  ];
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' }
  );
  for (const sel of groups) {
    $$(sel).forEach((el, i) => {
      // only what starts below the fold animates; nothing visible flickers
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
      el.setAttribute('data-reveal', '');
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
      io.observe(el);
    });
  }
}

/* ── Work cards: a lime "View" disc follows the pointer ─────────────── */
const peek = $('.peek');
if (peek && !coarse) {
  const x = gsap.quickTo(peek, 'x', { duration: 0.45, ease: 'power3' });
  const y = gsap.quickTo(peek, 'y', { duration: 0.45, ease: 'power3' });
  window.addEventListener('pointermove', (e) => {
    x(e.clientX);
    y(e.clientY);
  }, { passive: true });
  const host = $('.work-grid');
  host?.addEventListener('pointerover', (e) => peek.classList.toggle('is-on', !!e.target.closest('.wk-media')));
  host?.addEventListener('pointerleave', () => peek.classList.remove('is-on'));
}

/* ── The footer wordmark always spans the full width, whatever it says ─ */
const giant = $('.ft-giant');
function fitGiant() {
  const span = giant?.firstElementChild;
  if (!span) return;
  giant.style.fontSize = '';
  const cs = getComputedStyle(giant);
  const room = giant.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const w = span.getBoundingClientRect().width;
  if (w > 0) giant.style.fontSize = `${(parseFloat(cs.fontSize) * room) / w}px`;
}
fontsReady.then(fitGiant);
window.addEventListener('resize', fitGiant);

// Failsafe: whatever happens above, the hero never stays hidden.
setTimeout(() => root.classList.add('is-ready'), 2600);

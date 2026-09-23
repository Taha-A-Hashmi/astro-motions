/* ═══════════════════════════════════════════════════════════════════════
   gl/home.js — the home page's 3D: builds the stage and binds each
   [data-gl] placeholder to its view. Loaded lazily by src/main.js, which
   keeps owning the scroll state (the manifesto's `s`) so the page works
   the same with or without WebGL.
   ═══════════════════════════════════════════════════════════════════════ */
import { createStage } from './stage.js';
import * as V from './views.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

export async function initHome({ quality, manifestoState }) {
  const stage = createStage({ quality });
  if (!stage) return null;

  V.stars(stage, { quality });

  const planetEl = $('[data-gl="planet"]');
  if (planetEl) V.planet(stage, planetEl, { quality });

  // services: the cloud becomes whichever service is hovered / in view
  const svcEl = $('[data-gl="services"]');
  if (svcEl) {
    const view = V.services(stage, svcEl, { quality });
    const rows = $$('.svc-rows > li');
    rows.forEach((li, i) => {
      li.addEventListener('pointerenter', () => view.morph.goTo(i + 1));
      li.addEventListener('focusin', () => view.morph.goTo(i + 1));
    });
    $('.svc-rows')?.addEventListener('pointerleave', () => view.morph.goTo(0));
    // touch: no hover, so the cloud cycles through the services itself
    if (quality.coarse) {
      let k = 0;
      setInterval(() => {
        if (view.visible) view.morph.goTo((k = (k % rows.length) + 1));
      }, 2600);
    }
  }

  // process: the step in the middle of the screen lights its planet
  const orreryEl = $('[data-gl="orrery"]');
  if (orreryEl) {
    const steps = $$('.steps > .step');
    const view = V.orrery(stage, orreryEl, { quality, steps: Math.max(steps.length, 1) });
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          view.active = steps.indexOf(en.target);
          steps.forEach((s) => s.classList.toggle('is-active', s === en.target));
        }
      },
      { rootMargin: '-40% 0px -40% 0px' }
    );
    steps.forEach((s) => io.observe(s));
    // touch (stacked layout): the orrery cycles through the steps itself
    if (quality.coarse) {
      setInterval(() => {
        if (view.visible) view.active = (view.active + 1) % steps.length;
      }, 2200);
    }
  }

  const warpEl = $('[data-gl="warp"]');
  if (warpEl) V.warp(stage, warpEl, { quality, trigger: warpEl.parentElement.querySelector('.btn') });

  // the manifesto needs the brand face loaded to sample the word
  const mEl = $('[data-gl="manifesto"]');
  if (mEl) {
    try {
      await document.fonts.load('700 220px Unbounded');
    } catch {}
    const word = ($('[data-cms="hero.word"]')?.textContent || 'Astro').trim().toUpperCase();
    V.manifesto(stage, mEl, { quality, word, state: manifestoState });
  }
  return stage;
}

/* ═══════════════════════════════════════════════════════════════════════
   quality.js — one decision about how much the device can afford, made
   once at boot. Only the hero planet (src/globe.js) reads it: the rest of
   the page is plain HTML and CSS.

   Tiers:
     high  desktop with a real GPU: every dot, DPR 2
     mid   laptops with few cores, big tablets: ~60% of the dots, DPR 1.75
     low   phones: ~40% of the dots, DPR 1.5

   `?q=low|mid|high` on the URL forces a tier for testing.
   ═══════════════════════════════════════════════════════════════════════ */
const coarse = window.matchMedia('(pointer: coarse)').matches;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mem = navigator.deviceMemory ?? (coarse ? 4 : 8);
const cores = navigator.hardwareConcurrency ?? 4;
const small = Math.min(window.innerWidth, window.innerHeight) < 600;

let tier = 'high';
if (coarse || small) tier = mem <= 3 || cores <= 4 ? 'low' : 'mid';
else if (cores <= 4 || mem <= 4) tier = 'mid';

const forced = new URLSearchParams(location.search).get('q');
if (forced === 'low' || forced === 'mid' || forced === 'high') tier = forced;

const pick = (table) => table[tier];

export const quality = Object.freeze({
  tier,
  coarse,
  reduced,
  /** multiplier for the planet's dot counts */
  particles: pick({ high: 1, mid: 0.6, low: 0.42 }),
  /** hard cap on devicePixelRatio for the planet canvas */
  maxDpr: pick({ high: 2, mid: 1.75, low: 1.5 }),
});

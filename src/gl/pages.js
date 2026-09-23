/* ═══════════════════════════════════════════════════════════════════════
   gl/pages.js — the 3D for the server-rendered content pages. Built as
   its own entry (vite.config.js → dist/assets/pages-gl.js, a fixed name
   so server/pages.js can link it). The pages stay readable without it:
   everything here draws into transparent placeholders.

     [data-gl="shape"]  hero cloud; data-shape = browser | helix | bars |
                        network | cube | galaxy | sphere | torus | dust
     [data-gl="warp"]   the call-to-action star tunnel
   ═══════════════════════════════════════════════════════════════════════ */
import { quality } from '../quality.js';
import { createStage } from './stage.js';
import * as V from './views.js';

const stage = createStage({ quality });
if (stage) {
  V.stars(stage, { quality });
  for (const el of document.querySelectorAll('[data-gl="shape"]')) {
    V.shape(stage, el, { quality, name: el.dataset.shape });
  }
  const warpEl = document.querySelector('[data-gl="warp"]');
  if (warpEl) V.warp(stage, warpEl, { quality, trigger: warpEl.parentElement.querySelector('.btn') });
}

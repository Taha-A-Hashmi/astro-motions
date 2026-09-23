/* ═══════════════════════════════════════════════════════════════════════
   gl/stage.js — one WebGL context for the whole page.

   A fixed, full-viewport canvas sits behind the content. Each 3D element
   is a *view*: a DOM placeholder ([data-gl]) plus its own scene and
   camera. Every frame the stage asks each placeholder where it is and
   renders that view with scissor + viewport into exactly that rectangle,
   so the 3D scrolls with the page like an image would — but it is one
   context, one loop, and views that are off screen cost nothing.

   A view is { el, scene, camera, full?, update(dt, t, rect), onResize? }.
   `full` views (the starfield) cover the whole viewport and draw first.
   ═══════════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';

export function createStage({ quality }) {
  const canvas = document.createElement('canvas');
  canvas.className = 'gl-stage';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
  } catch {
    canvas.remove();
    document.documentElement.classList.add('no-gl');
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;
  let dpr = Math.min(window.devicePixelRatio, quality.maxDpr);
  renderer.setPixelRatio(dpr);

  const views = [];
  let W = 0, H = 0;
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    renderer.setSize(W, H, false);
  }
  resize();
  window.addEventListener('resize', resize);

  // Pixels per world unit at distance 1 for a camera drawn h CSS px tall.
  const scaleFor = (camera, h) => (h * dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));

  const clock = { t: 0, last: performance.now() };
  let raf = 0;
  const frameTimes = [];

  function frame(now) {
    raf = 0;
    const dt = Math.min((now - clock.last) / 1000, 0.05);
    clock.last = now;
    clock.t += dt;

    renderer.setScissorTest(false);
    renderer.clear();
    renderer.setScissorTest(true);

    for (const v of views) {
      let x = 0, y = 0, w = W, h = H;
      if (!v.full) {
        const r = v.el.getBoundingClientRect();
        if (r.bottom < -50 || r.top > H + 50 || r.width < 2 || r.height < 2 || v.el.offsetParent === null) {
          v.visible = false;
          continue;
        }
        x = r.left; y = r.top; w = r.width; h = r.height;
      }
      v.visible = true;
      if (v.camera.aspect !== w / h) {
        v.camera.aspect = w / h;
        v.camera.updateProjectionMatrix();
      }
      v.update?.(dt, clock.t, { x, y, w, h, scale: scaleFor(v.camera, h) });
      renderer.setViewport(x, H - y - h, w, h);
      renderer.setScissor(x, H - y - h, w, h);
      renderer.render(v.scene, v.camera);
    }

    // if frames keep missing, drop the resolution a notch (never back up)
    frameTimes.push(dt);
    if (frameTimes.length > 90) {
      const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      frameTimes.length = 0;
      if (avg > 0.026 && dpr > 0.75) {
        dpr = Math.max(0.75, dpr - 0.25);
        renderer.setPixelRatio(dpr);
        resize();
      }
    }

    if (!document.hidden) raf = requestAnimationFrame(frame);
  }
  const start = () => {
    if (!raf && !document.hidden) {
      clock.last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };
  document.addEventListener('visibilitychange', start);

  /** Pointer position over a view, in normalised device coords. */
  function trackPointer(view) {
    const state = { inside: false, ndc: new THREE.Vector2(), down: false, dx: 0 };
    const el = view.el;
    let lastX = 0;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      state.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      state.inside = true;
      if (state.down) {
        state.dx += e.clientX - lastX;
        lastX = e.clientX;
      }
    });
    el.addEventListener('pointerleave', () => { state.inside = false; });
    el.addEventListener('pointerdown', (e) => {
      state.down = true;
      lastX = e.clientX;
      el.setPointerCapture?.(e.pointerId);
    });
    const up = (e) => {
      state.down = false;
      if (e.pointerType !== 'mouse') state.inside = false;
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return state;
  }

  return {
    renderer,
    add(view) {
      views.push(view);
      views.sort((a, b) => (b.full ? 1 : 0) - (a.full ? 1 : 0));
      start();
      return view;
    },
    trackPointer,
    start,
  };
}

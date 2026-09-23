/* ═══════════════════════════════════════════════════════════════════════
   globe.js — the hero planet: a halftone globe printed in cobalt dots.

   A Fibonacci sphere of points; value noise decides "land" (big dots) from
   "sea" (small dots), so the planet reads like a screen-printed poster
   rather than a render. A tilted ring of ink dots and a small ink moon orbit
   it. An invisible depth-only sphere hides everything behind the planet.

   Interaction: the dots under the pointer swell outward and turn ink;
   dragging spins the planet with inertia (touch-action stays pan-y, so a
   vertical swipe still scrolls the page). Scrolling the hero away spins
   it a little further. Rendering pauses whenever the canvas is off screen.
   ═══════════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';

const COBALT = [0x2b / 255, 0x3b / 255, 0xff / 255];
const INK = [0x0d / 255, 0x0d / 255, 0x12 / 255];

/* ── A small 3D value noise (enough for continents) ─────────────────── */
function hash(x, y, z) {
  let h = x * 374761393 + y * 668265263 + z * 2147483647;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
const fade = (t) => t * t * (3 - 2 * t);
function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi);
  const l = (a, b, t) => a + (b - a) * t;
  const c = (dx, dy, dz) => hash(xi + dx, yi + dy, zi + dz);
  return l(
    l(l(c(0, 0, 0), c(1, 0, 0), xf), l(c(0, 1, 0), c(1, 1, 0), xf), yf),
    l(l(c(0, 0, 1), c(1, 0, 1), xf), l(c(0, 1, 1), c(1, 1, 1), xf), yf),
    zf
  );
}
const fbm = (x, y, z) =>
  noise3(x, y, z) * 0.55 + noise3(x * 2.03, y * 2.03, z * 2.03) * 0.3 + noise3(x * 4.1, y * 4.1, z * 4.1) * 0.15;

/* ── Shaders ────────────────────────────────────────────────────────── */
const vertexShader = /* glsl */ `
  uniform float uScale;
  uniform float uIntro;
  uniform float uHover;
  uniform vec3 uMouse;
  attribute float aSize;
  attribute vec3 aScatter;
  varying float vHot;
  varying float vAlpha;
  void main() {
    float d = distance(position, uMouse);
    float hot = (1.0 - smoothstep(0.0, 0.5, d)) * uHover;
    vec3 p = position * (1.0 + hot * 0.16);
    float t = clamp(uIntro, 0.0, 1.0);
    p = mix(aScatter, p, t);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vHot = hot;
    vAlpha = t;
    gl_PointSize = aSize * (1.0 + hot * 1.1) * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHotColor;
  varying float vHot;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.4, r);
    if (a < 0.02) discard;
    gl_FragColor = vec4(mix(uColor, uHotColor, vHot), a * vAlpha);
  }
`;

function dotsMaterial(uniforms) {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
  });
}

export function createGlobe(canvas, { quality }) {
  const { reduced } = quality;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
  } catch {
    canvas.remove();
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.maxDpr));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 6.4);

  // Everything tilts together; the planet spins inside it.
  const tilt = new THREE.Group();
  tilt.rotation.set(0.32, 0, -0.18);
  scene.add(tilt);
  const planet = new THREE.Group();
  tilt.add(planet);

  // Shared uniforms: the pointer and hover belong to the planet's dots only.
  const uScale = { value: 1 };
  const uIntro = { value: reduced ? 1 : 0 };

  /* ── Planet dots ──────────────────────────────────────────────────── */
  const count = Math.round(8200 * quality.particles);
  const pos = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    const x = Math.cos(th) * r;
    const z = Math.sin(th) * r;
    pos.set([x, y, z], i * 3);
    const n = fbm(x * 1.7 + 3.1, y * 1.7 + 1.3, z * 1.7 + 7.7);
    // halftone: dot size follows the noise, with a hard-ish coast
    const land = THREE.MathUtils.smoothstep(n, 0.47, 0.53);
    const polar = Math.abs(y) > 0.9 ? 0.35 : 0;
    size[i] = 0.011 + (land * 0.024 + polar * 0.012) * (0.85 + Math.random() * 0.3);
    const s = 2.2 + Math.random() * 3.2;
    scatter.set([x * s + (Math.random() - 0.5), y * s + (Math.random() - 0.5), z * s + (Math.random() - 0.5)], i * 3);
  }
  const planetGeo = new THREE.BufferGeometry();
  planetGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  planetGeo.setAttribute('aScatter', new THREE.BufferAttribute(scatter, 3));
  planetGeo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  const planetUniforms = {
    uScale,
    uIntro,
    uHover: { value: 0 },
    uMouse: { value: new THREE.Vector3(9, 9, 9) },
    uColor: { value: new THREE.Vector3(...COBALT) },
    uHotColor: { value: new THREE.Vector3(...INK) },
  };
  planet.add(new THREE.Points(planetGeo, dotsMaterial(planetUniforms)));

  // Depth-only occluder: the far side of the planet and the ring behind
  // it stay hidden, so the globe reads as a solid printed disc.
  const occluder = new THREE.Mesh(
    new THREE.SphereGeometry(0.985, 48, 32),
    new THREE.MeshBasicMaterial({ colorWrite: false })
  );
  occluder.renderOrder = -1;
  tilt.add(occluder);

  /* ── Ring ─────────────────────────────────────────────────────────── */
  const ring = new THREE.Group();
  ring.rotation.x = Math.PI / 2 - 0.5;
  tilt.add(ring);
  const ringCount = Math.round(1500 * quality.particles);
  const rPos = new Float32Array(ringCount * 3);
  const rScatter = new Float32Array(ringCount * 3);
  const rSize = new Float32Array(ringCount);
  // evenly spaced rows of dots, like a printed dot screen: four inner rows,
  // a gap (a Cassini division), one fine outer row
  const rows = [
    { r: 1.4, s: 0.017 },
    { r: 1.46, s: 0.019 },
    { r: 1.52, s: 0.016 },
    { r: 1.58, s: 0.012 },
    { r: 1.74, s: 0.009 },
  ];
  const perRow = Math.floor(ringCount / rows.length);
  for (let i = 0; i < ringCount; i++) {
    const row = rows[i % rows.length];
    const k = Math.floor(i / rows.length);
    const a = (k / perRow) * Math.PI * 2 + (i % rows.length) * 0.37;
    const x = Math.cos(a) * row.r;
    const y = Math.sin(a) * row.r;
    rPos.set([x, y, 0], i * 3);
    rScatter.set([x * 3, y * 3, (Math.random() - 0.5) * 4], i * 3);
    rSize[i] = row.s;
  }
  const ringGeo = new THREE.BufferGeometry();
  ringGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
  ringGeo.setAttribute('aScatter', new THREE.BufferAttribute(rScatter, 3));
  ringGeo.setAttribute('aSize', new THREE.BufferAttribute(rSize, 1));
  const ringUniforms = {
    uScale,
    uIntro,
    uHover: { value: 0 },
    uMouse: { value: new THREE.Vector3(9, 9, 9) },
    uColor: { value: new THREE.Vector3(...INK) },
    uHotColor: { value: new THREE.Vector3(...INK) },
  };
  ring.add(new THREE.Points(ringGeo, dotsMaterial(ringUniforms)));

  /* ── Moon ─────────────────────────────────────────────────────────── */
  const moonOrbit = new THREE.Group();
  moonOrbit.rotation.x = Math.PI / 2 - 0.5;
  tilt.add(moonOrbit);
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 24, 16),
    new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(...INK, THREE.SRGBColorSpace) })
  );
  moon.position.set(1.98, 0, 0);
  moonOrbit.add(moon);
  moon.scale.setScalar(reduced ? 1 : 0.001);

  /* ── Sizing ───────────────────────────────────────────────────────── */
  function resize() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const buf = renderer.getDrawingBufferSize(new THREE.Vector2());
    uScale.value = buf.y / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  /* ── Pointer: hover swell + drag spin ─────────────────────────────── */
  const ndc = new THREE.Vector2();
  const ray = new THREE.Raycaster();
  const sphere = new THREE.Sphere(new THREE.Vector3(), 1);
  const hit = new THREE.Vector3();
  const inv = new THREE.Matrix4();
  let hovering = false;
  let dragging = false;
  let lastX = 0;
  let spinVel = 0;
  let spin = 0;
  const lean = { x: 0, y: 0, tx: 0, ty: 0 };

  function pick(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectSphere(sphere, hit)) {
      planet.updateMatrixWorld();
      inv.copy(planet.matrixWorld).invert();
      planetUniforms.uMouse.value.copy(hit).applyMatrix4(inv);
      hovering = true;
    } else hovering = false;
  }
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse' || dragging) pick(e);
    if (dragging) {
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      spinVel = dx * 0.006;
      spin += spinVel;
    }
  });
  canvas.addEventListener('pointerleave', () => {
    hovering = false;
  });
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastX = e.clientX;
    pick(e);
    canvas.setPointerCapture?.(e.pointerId);
  });
  const release = (e) => {
    dragging = false;
    if (e.pointerType !== 'mouse') hovering = false;
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  // the whole window leans the planet a touch toward the pointer
  window.addEventListener(
    'pointermove',
    (e) => {
      lean.tx = (e.clientY / window.innerHeight - 0.5) * 0.18;
      lean.ty = (e.clientX / window.innerWidth - 0.5) * 0.24;
    },
    { passive: true }
  );

  /* ── Scroll: spin a little more as the hero leaves ────────────────── */
  let scrollSpin = 0;
  const hero = canvas.closest('.hero');
  const onScroll = () => {
    const h = hero ? hero.offsetHeight : window.innerHeight;
    scrollSpin = Math.min(window.scrollY / h, 1.2) * 1.4;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Loop (only while visible) ────────────────────────────────────── */
  let visible = true;
  let raf = 0;
  let last = performance.now();
  let introT = reduced ? 1 : 0;
  const clock = { t: 0 };

  function frame(now) {
    raf = 0;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    clock.t += dt;

    if (introT < 1) {
      introT = Math.min(introT + dt / 2.2, 1);
      const e = 1 - Math.pow(1 - introT, 4);
      uIntro.value = e;
      moon.scale.setScalar(Math.max(e, 0.001));
    }

    if (!dragging) {
      spinVel *= 0.95;
      spin += spinVel;
    }
    const auto = reduced ? 0 : clock.t * 0.07;
    planet.rotation.y = auto + spin + scrollSpin;
    ring.rotation.z = -(reduced ? 0 : clock.t * 0.05) - scrollSpin * 0.4;
    moonOrbit.rotation.z = (reduced ? 0.6 : clock.t * 0.35) + scrollSpin;

    lean.x += (lean.tx - lean.x) * 0.05;
    lean.y += (lean.ty - lean.y) * 0.05;
    tilt.rotation.x = 0.32 + lean.x;
    tilt.rotation.y = lean.y;

    const target = hovering ? 1 : 0;
    planetUniforms.uHover.value += (target - planetUniforms.uHover.value) * 0.12;

    renderer.render(scene, camera);
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  const start = () => {
    if (!raf && visible && !document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };
  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    start();
  }).observe(canvas);
  document.addEventListener('visibilitychange', start);
  start();

  return { renderer };
}

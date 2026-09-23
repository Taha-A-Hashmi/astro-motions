/* ═══════════════════════════════════════════════════════════════════════
   gl/dots.js — the one material every 3D element on the site is made of:
   soft, additive, twinkling dots. Plus the shape library (point clouds
   of the same size that can morph into each other) and Morph, which
   blends a cloud between two shapes on the GPU.

   Colours are passed as raw display values (the shader applies no colour
   management), so what is written here is what lands on screen.
   ═══════════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';

const hex = (h) => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];
export const C = {
  cobalt: hex(0x3346ff),
  blue: hex(0x7d88ff),
  ice: hex(0xcfd4ff),
  paper: hex(0xeeece6),
  lime: hex(0xd4ff3f),
};

/* ── Noise (value noise + fbm) for halftone "continents" ────────────── */
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
export const fbm = (x, y, z) =>
  noise3(x, y, z) * 0.55 + noise3(x * 2.03, y * 2.03, z * 2.03) * 0.3 + noise3(x * 4.1, y * 4.1, z * 4.1) * 0.15;
export const smooth = (e0, e1, x) => {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
};

/* ── The dot material ───────────────────────────────────────────────── */
const vertexShader = /* glsl */ `
  attribute vec3 aTo;
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aSeed;
  uniform float uT;
  uniform float uScale;
  uniform float uTime;
  uniform float uAlpha;
  uniform float uSwirl;
  uniform float uHover;
  uniform float uReach;
  uniform vec3 uPointer;
  uniform vec3 uHot;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 p = mix(position, aTo, uT);
    // particles loosen into a swirl mid-morph, then settle
    float k = sin(uT * 3.14159) * uSwirl;
    p += vec3(sin(aSeed * 12.0 + uTime), cos(aSeed * 7.0 + uTime * 1.3), sin(aSeed * 3.0 + uTime * 0.7)) * k * 0.3;
    // idle shimmer
    p += vec3(sin(uTime * 0.8 + aSeed * 20.0), cos(uTime * 0.7 + aSeed * 13.0), sin(uTime * 0.6 + aSeed * 5.0)) * 0.012;
    // the pointer pushes dots away and lights them up
    vec3 d = p - uPointer;
    float push = uHover * (1.0 - smoothstep(0.0, uReach, length(d)));
    p += normalize(d + 1e-5) * push * 0.3;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = max(aSize * uScale * (1.0 + push * 1.4) / -mv.z, 1.0);
    gl_Position = projectionMatrix * mv;
    float tw = 0.78 + 0.22 * sin(uTime * 2.2 + aSeed * 40.0);
    vColor = mix(aColor, uHot, push);
    vAlpha = uAlpha * tw;
  }
`;
const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.12, r);
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

export function dotMaterial(extra = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uT: { value: 0 },
      uScale: { value: 400 },
      uTime: { value: 0 },
      uAlpha: { value: 1 },
      uSwirl: { value: 1 },
      uHover: { value: 0 },
      uReach: { value: 0.55 },
      uPointer: { value: new THREE.Vector3(99, 99, 99) },
      uHot: { value: new THREE.Vector3(...C.lime) },
      ...extra,
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

/** A static cloud of dots: positions, sizes, colours. */
export function dotCloud(pos, { sizes, colors, material } = {}) {
  const n = pos.length / 3;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aTo', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aSize', new THREE.BufferAttribute(sizes || new Float32Array(n).fill(0.02), 1));
  g.setAttribute('aColor', new THREE.BufferAttribute(colors || paint(n, [[C.blue, 1]]), 3));
  const seed = new Float32Array(n);
  for (let i = 0; i < n; i++) seed[i] = Math.random();
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  return new THREE.Points(g, material || dotMaterial());
}

/** Colours by weighted palette: [[rgb, weight], …]. */
export function paint(n, palette) {
  const out = new Float32Array(n * 3);
  const total = palette.reduce((s, [, w]) => s + w, 0);
  for (let i = 0; i < n; i++) {
    let r = Math.random() * total;
    let c = palette[0][0];
    for (const [col, w] of palette) {
      if ((r -= w) <= 0) {
        c = col;
        break;
      }
    }
    out.set(c, i * 3);
  }
  return out;
}

/* ── Shapes: each returns n points (Float32Array n*3) ───────────────── */
const rnd = (a, b) => a + Math.random() * (b - a);
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

export const shapes = {
  dust(n, r = 3.6) {
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = Math.random() * 2 - 1, t = Math.random() * Math.PI * 2, rr = r * Math.cbrt(Math.random());
      const s = Math.sqrt(1 - u * u);
      p.set([Math.cos(t) * s * rr, u * rr, Math.sin(t) * s * rr], i * 3);
    }
    return p;
  },
  sphere(n, r = 1.35) {
    const p = new Float32Array(n * 3);
    const g = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2, rr = Math.sqrt(1 - y * y), th = g * i;
      p.set([Math.cos(th) * rr * r, y * r, Math.sin(th) * rr * r], i * 3);
    }
    return p;
  },
  // "never leave the ground": a wide dotted floor with a slow swell
  ground(n) {
    const p = new Float32Array(n * 3);
    const cols = Math.round(Math.sqrt(n * 1.6));
    const rows = Math.ceil(n / cols);
    for (let i = 0; i < n; i++) {
      const cx = (i % cols) / (cols - 1), cz = Math.floor(i / cols) / (rows - 1);
      const x = (cx - 0.5) * 7.5, z = (cz - 0.5) * 5 - 0.5;
      const y = -0.9 + Math.sin(x * 1.3) * 0.08 + Math.cos(z * 1.7) * 0.08;
      p.set([x, y, z], i * 3);
    }
    return p;
  },
  // "pull people in": a three-armed spiral galaxy
  galaxy(n) {
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const arm = i % 3;
      const r = Math.pow(Math.random(), 0.7) * 2.6;
      const a = (arm / 3) * Math.PI * 2 + r * 2.1 + gauss() * 0.35 / (0.4 + r);
      const y = gauss() * 0.14 * (1.4 - Math.min(r, 1.3));
      p.set([Math.cos(a) * r, y, Math.sin(a) * r], i * 3);
    }
    return p;
  },
  torus(n, R = 1.5, r = 0.18) {
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = Math.random() * Math.PI * 2, v = Math.random() * Math.PI * 2;
      p.set([(R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u)], i * 3);
    }
    return p;
  },
  // web design: a browser window, drawn in dots
  browser(n) {
    const p = new Float32Array(n * 3);
    const W = 3.2, H = 2.2;
    const prims = [
      // [weight, sampler]
      [0.26, () => { // frame outline
        const t = Math.random() * 2 * (W + H);
        if (t < W) return [t - W / 2, H / 2];
        if (t < W + H) return [W / 2, H / 2 - (t - W)];
        if (t < 2 * W + H) return [W / 2 - (t - W - H), -H / 2];
        return [-W / 2, -H / 2 + (t - 2 * W - H)];
      }],
      [0.08, () => [rnd(-W / 2, W / 2), H / 2 - 0.3]], // toolbar line
      [0.05, () => { const k = Math.floor(Math.random() * 3); const a = Math.random() * Math.PI * 2, r = 0.06 * Math.sqrt(Math.random()); return [-W / 2 + 0.2 + k * 0.17 + Math.cos(a) * r, H / 2 - 0.15 + Math.sin(a) * r]; }],
      [0.22, () => [rnd(-W / 2 + 0.2, W / 2 - 0.2), rnd(0.1, H / 2 - 0.45)]], // hero block
      [0.07, () => [rnd(-W / 2 + 0.2, 0.6), rnd(-0.08, 0.0)]], // headline
      [0.32, () => { const k = Math.floor(Math.random() * 3); const cw = (W - 0.6) / 3; const x0 = -W / 2 + 0.2 + k * (cw + 0.1); return [rnd(x0, x0 + cw), rnd(-H / 2 + 0.2, -0.3)]; }], // cards
    ];
    for (let i = 0; i < n; i++) {
      let r = Math.random(), s = prims[0][1];
      for (const [w, f] of prims) { if ((r -= w) <= 0) { s = f; break; } }
      const [x, y] = s();
      p.set([x, y, gauss() * 0.03], i * 3);
    }
    return p;
  },
  // organic SEO: a rising, widening helix — growth that compounds
  helix(n) {
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const t = Math.random();
      const strand = i % 2;
      const a = t * Math.PI * 7 + strand * Math.PI;
      const r = 0.35 + t * 1.05;
      const y = -1.5 + t * 3;
      const j = gauss() * 0.04;
      p.set([Math.cos(a) * r + j, y + j, Math.sin(a) * r + j], i * 3);
    }
    return p;
  },
  // PPC: rising bars on a baseline
  bars(n) {
    const p = new Float32Array(n * 3);
    const hs = [0.7, 1.1, 1.55, 2.1, 2.8];
    for (let i = 0; i < n; i++) {
      if (Math.random() < 0.1) { p.set([rnd(-1.9, 1.9), -1.4, rnd(-0.35, 0.35)], i * 3); continue; }
      const k = Math.floor(Math.random() * 5);
      const x0 = -1.6 + k * 0.8, h = hs[k];
      // a point on the box surface
      const face = Math.random();
      let x = rnd(-0.25, 0.25), y = rnd(0, h), z = rnd(-0.25, 0.25);
      if (face < 0.3) z = Math.sign(z || 1) * 0.25; else if (face < 0.6) x = Math.sign(x || 1) * 0.25; else if (face < 0.75) y = h;
      p.set([x0 + x, -1.4 + y, z], i * 3);
    }
    return p;
  },
  // social: nodes and the links between them
  network(n) {
    const p = new Float32Array(n * 3);
    const nodes = shapes.sphere(11, 1.5);
    for (let i = 0; i < nodes.length; i += 3) {
      nodes[i] += gauss() * 0.3; nodes[i + 1] += gauss() * 0.3; nodes[i + 2] += gauss() * 0.3;
    }
    const N = nodes.length / 3;
    const edges = [];
    for (let a = 0; a < N; a++) {
      const d = [];
      for (let b = 0; b < N; b++) if (a !== b) d.push([Math.hypot(nodes[a * 3] - nodes[b * 3], nodes[a * 3 + 1] - nodes[b * 3 + 1], nodes[a * 3 + 2] - nodes[b * 3 + 2]), b]);
      d.sort((x, y) => x[0] - y[0]);
      for (const [, b] of d.slice(0, 3)) if (a < b) edges.push([a, b]);
    }
    edges.push(...Array.from({ length: N }, (_, a) => [a, N]));
    const hub = [0, 0, 0];
    const at = (k) => (k === N ? hub : [nodes[k * 3], nodes[k * 3 + 1], nodes[k * 3 + 2]]);
    for (let i = 0; i < n; i++) {
      if (Math.random() < 0.45) {
        const k = Math.floor(Math.random() * (N + 1));
        const c = at(k), rr = (k === N ? 0.3 : 0.16) * Math.cbrt(Math.random());
        const u = Math.random() * 2 - 1, t = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
        p.set([c[0] + Math.cos(t) * s * rr, c[1] + u * rr, c[2] + Math.sin(t) * s * rr], i * 3);
      } else {
        const [a, b] = edges[Math.floor(Math.random() * edges.length)];
        const A = at(a), B = at(b), t = Math.random();
        p.set([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t], i * 3);
      }
    }
    return p;
  },
  // a lattice cube: grid lines on every face
  cube(n, s = 1.25) {
    const p = new Float32Array(n * 3);
    const grid = 5;
    for (let i = 0; i < n; i++) {
      const axis = Math.floor(Math.random() * 3), side = Math.random() < 0.5 ? -s : s;
      let a = rnd(-s, s), b = rnd(-s, s);
      if (Math.random() < 0.5) a = -s + (Math.round(((a + s) / (2 * s)) * grid) / grid) * 2 * s;
      else b = -s + (Math.round(((b + s) / (2 * s)) * grid) / grid) * 2 * s;
      const v = axis === 0 ? [side, a, b] : axis === 1 ? [a, side, b] : [a, b, side];
      p.set(v, i * 3);
    }
    return p;
  },
  // a word, sampled from the brand face on a 2D canvas
  text(n, word, font = '700 220px Unbounded') {
    const cv = document.createElement('canvas');
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.font = font;
    const w = Math.ceil(ctx.measureText(word).width) + 40, h = 300;
    cv.width = w; cv.height = h;
    ctx.font = font;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(word, 20, h / 2);
    const data = ctx.getImageData(0, 0, w, h).data;
    const filled = [];
    for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (data[(y * w + x) * 4 + 3] > 128) filled.push(x, y);
    const p = new Float32Array(n * 3);
    const scale = 5.4 / w;
    for (let i = 0; i < n; i++) {
      const k = Math.floor(Math.random() * (filled.length / 2)) * 2;
      const x = filled[k] + Math.random() * 2, y = filled[k + 1] + Math.random() * 2;
      p.set([(x - w / 2) * scale, -(y - h / 2) * scale, gauss() * 0.08], i * 3);
    }
    return p;
  },
};

/* ── Morph: one cloud that blends between shapes ────────────────────── */
export class Morph {
  constructor(n, shapeList, { sizes, colors, material } = {}) {
    this.n = n;
    this.shapes = shapeList;
    this.points = dotCloud(new Float32Array(shapeList[0]), { sizes, colors, material });
    this.geo = this.points.geometry;
    this.from = this.geo.attributes.position;
    this.to = this.geo.attributes.aTo;
    this.to.array = new Float32Array(shapeList[0]);
    this.u = this.points.material.uniforms;
    this.pair = [0, 0];
    this.anim = null;
    this.index = 0;
  }
  setPair(i, j) {
    if (this.pair[0] === i && this.pair[1] === j) return;
    this.from.array.set(this.shapes[i]);
    this.to.array.set(this.shapes[j]);
    this.from.needsUpdate = this.to.needsUpdate = true;
    this.pair = [i, j];
  }
  /** Continuous position along the shape list (scroll-scrubbed). */
  scrub(s) {
    const max = this.shapes.length - 1;
    s = Math.min(Math.max(s, 0), max);
    const i = Math.min(Math.floor(s), max - 1);
    this.setPair(i, i + 1);
    const t = s - i;
    this.u.uT.value = t * t * (3 - 2 * t);
  }
  /** Animate from wherever the dots are now to shape j. */
  goTo(j, dur = 1.1) {
    if (j === this.index && !this.anim) return;
    const t = this.u.uT.value, a = this.from.array, b = this.to.array;
    for (let k = 0; k < a.length; k++) a[k] = a[k] + (b[k] - a[k]) * t;
    b.set(this.shapes[j]);
    this.from.needsUpdate = this.to.needsUpdate = true;
    this.u.uT.value = 0;
    this.pair = [-1, -1];
    this.anim = { t: 0, dur };
    this.index = j;
  }
  tick(dt) {
    if (!this.anim) return;
    this.anim.t = Math.min(this.anim.t + dt / this.anim.dur, 1);
    const e = this.anim.t;
    this.u.uT.value = e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2;
    if (this.anim.t >= 1) this.anim = null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   gl/views.js — every 3D element on the site, as stage views.

     stars     full-viewport starfield, drifts with the scroll
     planet    the hero: halftone dot planet, lime ring, two dot moons
     manifesto scroll-scrubbed morph: dust → ground → galaxy → the word
     services  morphs to the hovered service (browser/helix/bars/network)
     orrery    the process: a sun and four planets, one per step
     warp      the call to action: a star tunnel that speeds up on hover
     shape     content-page heroes: dust that settles into one shape

   All of them are dots (gl/dots.js) — one material, additive on the dark
   ground, so the whole site reads as one printed-in-light system.
   ═══════════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { C, fbm, smooth, dotCloud, dotMaterial, paint, shapes, Morph } from './dots.js';

const cam = (fov = 35, z = 7) => {
  const c = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
  c.position.set(0, 0, z);
  return c;
};

/* Pointer → a point in an object's local space (on a plane through its
   origin facing the camera), for the dot-push effect. */
const ray = new THREE.Raycaster();
const plane = new THREE.Plane();
const hitV = new THREE.Vector3();
function pointerLocal(state, camera, object, out) {
  ray.setFromCamera(state.ndc, camera);
  const n = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
  plane.setFromNormalAndCoplanarPoint(n, object.getWorldPosition(hitV));
  if (!ray.ray.intersectPlane(plane, hitV)) return false;
  object.updateMatrixWorld();
  out.copy(hitV).applyMatrix4(object.matrixWorld.clone().invert());
  return true;
}

/* ── Starfield ──────────────────────────────────────────────────────── */
export function stars(stage, { quality }) {
  const n = Math.round(2600 * quality.particles);
  const pos = new Float32Array(n * 3);
  const sizes = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    pos.set([(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20, -Math.random() * 18 - 2], i * 3);
    sizes[i] = Math.random() < 0.04 ? 0.09 : 0.025 + Math.random() * 0.03;
  }
  const colors = paint(n, [[C.ice, 5], [C.blue, 3], [C.cobalt, 2], [C.lime, 0.25]]);
  const mat = dotMaterial({ uScroll: { value: 0 } });
  // wrap vertically so the field never runs out while scrolling
  mat.vertexShader = mat.vertexShader.replace(
    'vec3 p = mix(position, aTo, uT);',
    'vec3 p = position; p.y = mod(p.y + uScroll * (0.25 + 0.05 * -position.z) + 10.0, 20.0) - 10.0;'
  ).replace('uniform float uT;', 'uniform float uT;\n  uniform float uScroll;');
  const pts = dotCloud(pos, { sizes, colors, material: mat });
  pts.material.uniforms.uAlpha.value = 0.75;
  const scene = new THREE.Scene();
  scene.add(pts);
  const camera = cam(60, 5);
  return stage.add({
    full: true,
    scene,
    camera,
    update(dt, t, r) {
      mat.uniforms.uTime.value = t;
      mat.uniforms.uScale.value = r.scale;
      mat.uniforms.uScroll.value = window.scrollY * 0.004;
    },
  });
}

/* ── Hero planet ────────────────────────────────────────────────────── */
export function planet(stage, el, { quality }) {
  const { reduced } = quality;
  const scene = new THREE.Scene();
  const camera = cam(30, 6.6);
  const tilt = new THREE.Group();
  tilt.rotation.set(0.32, 0, -0.18);
  scene.add(tilt);
  const body = new THREE.Group();
  tilt.add(body);

  // halftone planet: dot size follows the continents
  const n = Math.round(9000 * quality.particles);
  const pos = shapes.sphere(n, 1);
  const sizes = new Float32Array(n);
  const colors = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
    const land = smooth(0.47, 0.53, fbm(x * 1.7 + 3.1, y * 1.7 + 1.3, z * 1.7 + 7.7));
    sizes[i] = 0.012 + land * 0.03;
    colors.set(land > 0.5 ? (Math.random() < 0.12 ? C.ice : C.blue) : C.cobalt, i * 3);
  }
  const dots = dotCloud(pos, { sizes, colors });
  dots.material.uniforms.uReach.value = 0.5;
  body.add(dots);

  // depth-only occluder hides the far side and the ring behind
  const occ = new THREE.Mesh(new THREE.SphereGeometry(0.98, 48, 32), new THREE.MeshBasicMaterial({ colorWrite: false }));
  occ.renderOrder = -1;
  tilt.add(occ);

  // the ring: five rows of lime/paper dots
  const ring = new THREE.Group();
  ring.rotation.x = Math.PI / 2 - 0.5;
  tilt.add(ring);
  const rows = [[1.4, 0.02], [1.46, 0.024], [1.52, 0.02], [1.58, 0.015], [1.76, 0.012]];
  const rn = Math.round(1800 * quality.particles);
  const rpos = new Float32Array(rn * 3), rsz = new Float32Array(rn), rcol = new Float32Array(rn * 3);
  const per = Math.floor(rn / rows.length);
  for (let i = 0; i < rn; i++) {
    const [R, s] = rows[i % rows.length];
    const a = (Math.floor(i / rows.length) / per) * Math.PI * 2 + (i % rows.length) * 0.37;
    rpos.set([Math.cos(a) * R, Math.sin(a) * R, 0], i * 3);
    rsz[i] = s;
    rcol.set(i % rows.length === 1 ? C.lime : i % 3 ? C.paper : C.lime, i * 3);
  }
  const ringDots = dotCloud(rpos, { sizes: rsz, colors: rcol });
  ringDots.material.uniforms.uAlpha.value = 0.85;
  ring.add(ringDots);

  // two small dot moons on their own orbits
  const moons = [];
  for (const [R, r, tiltX, speed, col] of [[2.05, 0.13, 1.1, 0.35, C.paper], [2.5, 0.08, 1.35, -0.22, C.lime]]) {
    const orbit = new THREE.Group();
    orbit.rotation.x = tiltX;
    tilt.add(orbit);
    const mn = Math.round(500 * quality.particles);
    const m = dotCloud(shapes.sphere(mn, r), { sizes: new Float32Array(mn).fill(0.018), colors: paint(mn, [[col, 1]]) });
    m.position.x = R;
    orbit.add(m);
    // a faint dotted orbit path
    const on = 220;
    const op = new Float32Array(on * 3);
    for (let i = 0; i < on; i++) op.set([Math.cos((i / on) * Math.PI * 2) * R, Math.sin((i / on) * Math.PI * 2) * R, 0], i * 3);
    const path = dotCloud(op, { sizes: new Float32Array(on).fill(0.01), colors: paint(on, [[C.blue, 1]]) });
    path.material.uniforms.uAlpha.value = 0.35;
    const pathHolder = new THREE.Group();
    pathHolder.rotation.x = Math.PI / 2;
    pathHolder.add(path);
    orbit.add(pathHolder);
    // moon travels in the orbit plane (x/z of the tilted group)
    m.position.set(R, 0, 0);
    const holder = new THREE.Group();
    holder.add(m);
    holder.rotation.x = 0;
    orbit.add(holder);
    moons.push({ holder, speed, m });
  }
  moons.forEach((mo) => { mo.holder.rotation.set(Math.PI / 2, 0, 0); });

  const mats = [dots.material, ringDots.material, ...moons.map((m) => m.m.material)];
  scene.traverse((o) => { if (o.isPoints && !mats.includes(o.material)) mats.push(o.material); });
  const baseAlpha = new Map(mats.map((m) => [m, m.uniforms.uAlpha.value]));

  const ptr = stage.trackPointer({ el });
  const local = new THREE.Vector3();
  let spin = 0, vel = 0, lastDx = 0, hover = 0;
  const lean = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => {
    lean.tx = (e.clientY / window.innerHeight - 0.5) * 0.2;
    lean.ty = (e.clientX / window.innerWidth - 0.5) * 0.3;
  }, { passive: true });
  let intro = reduced ? 1 : 0;

  return stage.add({
    el,
    scene,
    camera,
    update(dt, t, r) {
      for (const m of mats) {
        m.uniforms.uTime.value = t;
        m.uniforms.uScale.value = r.scale;
      }
      // entrance: the planet condenses out of a larger shell
      if (intro < 1) {
        intro = Math.min(intro + dt / 2.4, 1);
        const e = 1 - Math.pow(1 - intro, 4);
        tilt.scale.setScalar(0.55 + 0.45 * e);
        for (const m of mats) m.uniforms.uAlpha.value = baseAlpha.get(m) * e;
      }
      // drag to spin, with inertia
      const d = ptr.dx - lastDx;
      lastDx = ptr.dx;
      if (ptr.down) vel = d * 0.006;
      else vel *= 0.95;
      spin += vel;
      const scroll = Math.min(window.scrollY / window.innerHeight, 1.2);
      body.rotation.y = (reduced ? 0 : t * 0.07) + spin + scroll * 1.4;
      ring.rotation.z = -(reduced ? 0 : t * 0.05) - scroll * 0.5;
      moons.forEach((mo, i) => { mo.holder.rotation.z = (reduced ? i : t * mo.speed) + scroll; });
      lean.x += (lean.tx - lean.x) * 0.05;
      lean.y += (lean.ty - lean.y) * 0.05;
      tilt.rotation.x = 0.32 + lean.x;
      tilt.rotation.y = lean.y;
      camera.position.y = -scroll * 0.6;
      camera.lookAt(0, -scroll * 0.3, 0);
      // pointer swell
      hover += ((ptr.inside ? 1 : 0) - hover) * 0.12;
      dots.material.uniforms.uHover.value = hover;
      if (ptr.inside && pointerLocal(ptr, camera, body, local)) {
        // project onto the sphere surface so the swell hugs the planet
        dots.material.uniforms.uPointer.value.copy(local.lengthSq() > 1 ? local.normalize() : local.setLength(1));
      }
    },
  });
}

/* ── Manifesto: dust → ground → galaxy → word ──────────────────────── */
export function manifesto(stage, el, { quality, word = 'ASTRO', state = { s: 0 } }) {
  const n = Math.round(12000 * quality.particles);
  const list = [shapes.dust(n, 4.5), shapes.ground(n), shapes.galaxy(n), shapes.text(n, word)];
  const sizes = new Float32Array(n);
  for (let i = 0; i < n; i++) sizes[i] = 0.018 + Math.random() * 0.02;
  const colors = paint(n, [[C.blue, 5], [C.cobalt, 4], [C.ice, 2], [C.lime, 0.6]]);
  const morph = new Morph(n, list, { sizes, colors });
  morph.u.uSwirl.value = 0.8;
  const scene = new THREE.Scene();
  const group = new THREE.Group();
  group.add(morph.points);
  scene.add(group);
  const camera = cam(40, 6.5);
  camera.position.set(0, 1.2, 6.5);
  camera.lookAt(0, -0.1, 0);
  const ptr = stage.trackPointer({ el });
  const local = new THREE.Vector3();
  let hover = 0;
  const view = stage.add({
    el,
    scene,
    camera,
    update(dt, t, r) {
      const u = morph.u;
      u.uTime.value = t;
      u.uScale.value = r.scale;
      morph.scrub(state.s);
      // the galaxy turns; the word faces the camera
      const g = Math.max(0, 1 - Math.abs(state.s - 2));
      group.rotation.y = g * t * 0.12 + Math.sin(t * 0.25) * 0.12 * (1 - g);
      hover += ((ptr.inside ? 1 : 0) - hover) * 0.1;
      u.uHover.value = hover;
      if (ptr.inside && pointerLocal(ptr, camera, group, local)) u.uPointer.value.copy(local);
    },
  });
  return view;
}

/* ── Services: morphs to the hovered service ───────────────────────── */
export function services(stage, el, { quality }) {
  const n = Math.round(7000 * quality.particles);
  const list = [shapes.cube(n), shapes.browser(n), shapes.helix(n), shapes.bars(n), shapes.network(n)];
  const sizes = new Float32Array(n);
  for (let i = 0; i < n; i++) sizes[i] = 0.02 + Math.random() * 0.018;
  const colors = paint(n, [[C.blue, 5], [C.cobalt, 3], [C.ice, 2], [C.lime, 0.7]]);
  const morph = new Morph(n, list, { sizes, colors });
  const scene = new THREE.Scene();
  const group = new THREE.Group();
  group.add(morph.points);
  scene.add(group);
  const camera = cam(38, 7);
  const ptr = stage.trackPointer({ el });
  const local = new THREE.Vector3();
  let hover = 0;
  return stage.add({
    el,
    scene,
    camera,
    morph,
    update(dt, t, r) {
      const u = morph.u;
      u.uTime.value = t;
      u.uScale.value = r.scale;
      morph.tick(dt);
      // flat shapes (the browser) face forward; the rest turn slowly
      const flat = morph.index === 1 ? 1 : 0;
      group.rotation.y += ((flat ? Math.sin(t * 0.4) * 0.35 : group.rotation.y + dt * 0.25) - group.rotation.y) * (flat ? 0.05 : 1);
      group.rotation.x = 0.18 + Math.sin(t * 0.3) * 0.06;
      hover += ((ptr.inside ? 1 : 0) - hover) * 0.1;
      u.uHover.value = hover;
      if (ptr.inside && pointerLocal(ptr, camera, group, local)) u.uPointer.value.copy(local);
    },
  });
}

/* ── Orrery: the process, one planet per step ──────────────────────── */
export function orrery(stage, el, { quality, steps = 4 }) {
  const scene = new THREE.Scene();
  const camera = cam(36, 7.5);
  camera.position.set(0, 4.2, 6.2);
  camera.lookAt(0, -0.2, 0);
  const sys = new THREE.Group();
  scene.add(sys);
  const mats = [];
  const q = quality.particles;

  // the sun: a dense bright sphere with a loose corona
  const sn = Math.round(2600 * q);
  const sunPos = shapes.sphere(sn, 0.42);
  const sun = dotCloud(sunPos, { sizes: new Float32Array(sn).fill(0.028), colors: paint(sn, [[C.paper, 3], [C.lime, 2], [C.ice, 1]]) });
  sys.add(sun);
  mats.push(sun.material);
  const cn = Math.round(900 * q);
  const corona = dotCloud(shapes.dust(cn, 0.85), { sizes: new Float32Array(cn).fill(0.014), colors: paint(cn, [[C.lime, 1], [C.ice, 1]]) });
  corona.material.uniforms.uAlpha.value = 0.4;
  sys.add(corona);
  mats.push(corona.material);

  const planets = [];
  const radii = [1.05, 1.6, 2.15, 2.7];
  for (let k = 0; k < steps; k++) {
    const R = radii[k % radii.length] + Math.floor(k / radii.length) * 0.5;
    const on = Math.round(420 * q);
    const op = new Float32Array(on * 3);
    for (let i = 0; i < on; i++) op.set([Math.cos((i / on) * Math.PI * 2) * R, 0, Math.sin((i / on) * Math.PI * 2) * R], i * 3);
    const path = dotCloud(op, { sizes: new Float32Array(on).fill(0.012), colors: paint(on, [[C.blue, 1]]) });
    path.material.uniforms.uAlpha.value = 0.45;
    sys.add(path);
    mats.push(path.material);
    const pr = 0.12 + (k % 3) * 0.05;
    const pn = Math.round(700 * q);
    const pl = dotCloud(shapes.sphere(pn, pr), { sizes: new Float32Array(pn).fill(0.02), colors: paint(pn, [[C.blue, 2], [C.cobalt, 1]]) });
    const holder = new THREE.Group();
    holder.add(pl);
    pl.position.x = R;
    holder.rotation.y = k * 1.7;
    sys.add(holder);
    mats.push(pl.material);
    // a halo ring that shows when the step is active
    const hn = 160;
    const hp = new Float32Array(hn * 3);
    for (let i = 0; i < hn; i++) hp.set([Math.cos((i / hn) * Math.PI * 2) * (pr + 0.14), Math.sin((i / hn) * Math.PI * 2) * (pr + 0.14), 0], i * 3);
    const halo = dotCloud(hp, { sizes: new Float32Array(hn).fill(0.016), colors: paint(hn, [[C.lime, 1]]) });
    halo.material.uniforms.uAlpha.value = 0;
    pl.add(halo);
    mats.push(halo.material);
    planets.push({ holder, pl, halo, speed: 0.22 / (1 + k * 0.6), glow: 0 });
  }
  const view = stage.add({
    el,
    scene,
    camera,
    active: 0,
    update(dt, t, r) {
      for (const m of mats) {
        m.uniforms.uTime.value = t;
        m.uniforms.uScale.value = r.scale;
      }
      sys.rotation.y = t * 0.03;
      planets.forEach((p, k) => {
        p.holder.rotation.y += dt * p.speed;
        p.glow += ((k === view.active ? 1 : 0) - p.glow) * 0.08;
        p.halo.material.uniforms.uAlpha.value = p.glow;
        p.halo.lookAt(camera.position);
        p.pl.scale.setScalar(1 + p.glow * 0.45);
        p.pl.material.uniforms.uHover.value = p.glow * 0.45;
        p.pl.material.uniforms.uReach.value = 5;
        p.pl.material.uniforms.uPointer.value.set(0, 0, 0);
      });
    },
  });
  return view;
}

/* ── Warp: the call to action ──────────────────────────────────────── */
export function warp(stage, el, { quality, trigger }) {
  const n = Math.round(900 * quality.particles);
  const pos = new Float32Array(n * 6);
  const col = new Float32Array(n * 6);
  const stars = [];
  const DEPTH = 40;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, r = 0.6 + Math.pow(Math.random(), 0.6) * 5;
    stars.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: -Math.random() * DEPTH });
    const c = Math.random() < 0.18 ? C.lime : Math.random() < 0.5 ? C.ice : C.blue;
    col.set(c, i * 6);
    col.set([0, 0, 0], i * 6 + 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  const scene = new THREE.Scene();
  scene.add(lines);
  const camera = cam(70, 0.5);
  let speed = 6, target = 6;
  if (trigger) {
    trigger.addEventListener('pointerenter', () => { target = 42; });
    trigger.addEventListener('pointerleave', () => { target = 6; });
    trigger.addEventListener('focus', () => { target = 42; });
    trigger.addEventListener('blur', () => { target = 6; });
  }
  const reduced = quality.reduced;
  return stage.add({
    el,
    scene,
    camera,
    update(dt, t) {
      speed += (target - speed) * 0.05;
      const len = 0.15 + speed * 0.06;
      for (let i = 0; i < n; i++) {
        const s = stars[i];
        if (!reduced) s.z += speed * dt;
        if (s.z > 0.5) s.z -= DEPTH;
        pos.set([s.x, s.y, s.z, s.x, s.y, s.z - len], i * 6);
      }
      geo.attributes.position.needsUpdate = true;
      camera.rotation.z = t * 0.05;
    },
  });
}

/* ── Shape: content-page heroes ────────────────────────────────────── */
export function shape(stage, el, { quality, name = 'sphere' }) {
  const n = Math.round(6000 * quality.particles);
  const make = shapes[name] || shapes.sphere;
  const list = [shapes.dust(n, 4), make(n)];
  const sizes = new Float32Array(n);
  for (let i = 0; i < n; i++) sizes[i] = 0.02 + Math.random() * 0.018;
  const colors = paint(n, [[C.blue, 5], [C.cobalt, 3], [C.ice, 2], [C.lime, 0.7]]);
  const morph = new Morph(n, list, { sizes, colors });
  const scene = new THREE.Scene();
  const group = new THREE.Group();
  group.add(morph.points);
  scene.add(group);
  const camera = cam(38, 7);
  const ptr = stage.trackPointer({ el });
  const local = new THREE.Vector3();
  let hover = 0;
  const flat = name === 'browser';
  if (quality.reduced) morph.scrub(1);
  else morph.goTo(1, 2.2);
  return stage.add({
    el,
    scene,
    camera,
    update(dt, t, r) {
      const u = morph.u;
      u.uTime.value = t;
      u.uScale.value = r.scale;
      morph.tick(dt);
      const scroll = window.scrollY * 0.002;
      group.rotation.y = flat ? Math.sin(t * 0.4) * 0.35 - 0.2 : t * 0.2 + scroll;
      group.rotation.x = 0.2 + Math.sin(t * 0.3) * 0.06;
      hover += ((ptr.inside ? 1 : 0) - hover) * 0.1;
      u.uHover.value = hover;
      if (ptr.inside && pointerLocal(ptr, camera, group, local)) u.uPointer.value.copy(local);
    },
  });
}

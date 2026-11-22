import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { CULL_MARGIN, LIGHT_STRIDE, MOTION_CODE, packLight, patchMotionShader, patchWaterShader, resolveMotion, type LightKind, type MotionOpts } from './motion';
import { PALETTE, type PaletteColor } from './palette';

export interface Part { geometry: THREE.BufferGeometry; glow: boolean }
export type Vec3 = [number, number, number];
/**
 * Options every primitive takes. A part is built around its own centre (the bounding-box centre;
 * the ring centre of a torus, the base centre of a dome), then scaled, then rotated, then moved
 * so that centre lands on `at`.
 */
export interface PartOpts {
  /** Euler XYZ angles in radians. */
  rotate?: Vec3;
  /**
   * Stretch along x, y, z before `rotate`: a sphere becomes an ellipsoid, a cylinder an oval
   * drum. Non-zero; a negative component mirrors the part (its faces still point outwards).
   */
  scale?: Vec3;
  /**
   * Lights up at dusk and night. `true` emits the part's own colour; a palette colour makes the
   * surface use `color` by day and emit that colour at night (glass-blue windows, warm glow).
   */
  glow?: boolean | PaletteColor;
  /**
   * Glow parts only: how the light behaves when it is on (dusk and night). `steady` (default),
   * `breathe` (0.65..1.0 over ~3 s), `blink` (on/off under 1 Hz) or `window` (steady, each pane
   * ±15 % in brightness). Reduced motion holds every pattern at 1.0. See motion.ts.
   */
  light?: LightKind;
  /**
   * Animate the part on the GPU (no extra draw calls): `sway` leans it downwind from `pivot` (its
   * base by default), `wave` ripples cloth out along `axis` from the pole at `pivot`, `spin` turns
   * it about `axis` through `pivot`, `swing` rocks it about `axis` through `pivot`; `water` marks a
   * water surface that stays put and is drawn in the fragment shader: slow highlight bands by day,
   * moonlight glints on a `pond` (default) and a soft cyan glow on a `pool` at night (body parts
   * only: no `glow`). `pivot` and `axis` are in item space, like `at`. See MotionOpts and WATER
   * (motion.ts) for the defaults.
   */
  motion?: MotionOpts;
}

export interface StyleKit {
  materials: { body: THREE.MeshStandardMaterial; glow: THREE.MeshStandardMaterial };
  setGlowStrength(v: number): void;
  getGlowStrength(): number;
  box(size: Vec3, at: Vec3, color: PaletteColor, opts?: PartOpts & { round?: number }): Part;
  cylinder(rTop: number, rBottom: number, h: number, at: Vec3, color: PaletteColor, opts?: PartOpts & { segments?: number }): Part;
  cone(r: number, h: number, at: Vec3, color: PaletteColor, opts?: PartOpts & { segments?: number }): Part;
  sphere(r: number, at: Vec3, color: PaletteColor, opts?: PartOpts & { detail?: number }): Part;
  /**
   * Ring (hoop, tyre, wheel, handle, life ring): `radius` from `at` to the middle of the tube,
   * `tube` the tube's radius. It stands in the x-y plane (axis along z, like a wheel rolling
   * along x); `rotate: [Math.PI / 2, 0, 0]` lays it flat. `arc` < 2π keeps only the part from +x
   * round over the top: `arc: Math.PI` is an arch whose open ends stand flat on y = at[1].
   * Defaults: 6 radial x 12 tubular segments (144 triangles), fewer tubular for a shorter arc.
   */
  torus(radius: number, tube: number, at: Vec3, color: PaletteColor,
    opts?: PartOpts & { radialSegments?: number; tubularSegments?: number; arc?: number }): Part;
  /**
   * Closed half sphere, flat base down: `at` is the centre of its base, so it sits on y = at[1]
   * (rounded roofs, observatories, igloos, habitats). `segments` around (default 12), with
   * segments / 4 rings from base to top (min 2): 72 triangles by default. A `scale` keeps the base
   * on at[1].
   */
  dome(radius: number, at: Vec3, color: PaletteColor, opts?: PartOpts & { segments?: number }): Part;
  /**
   * Triangular prism (gable roof, ramp, slide, tent): base `size[0]` wide along x, `size[1]` tall,
   * `size[2]` long along z; `at` is its bounding-box centre. `apex` moves the ridge across the
   * base, from -0.5 (straight up from the -x edge: a ramp) to 0.5; default 0 (centred). 8 triangles.
   */
  wedge(size: Vec3, at: Vec3, color: PaletteColor, opts?: PartOpts & { apex?: number }): Part;
  finish(parts: Part[]): THREE.Group;
}

/**
 * Non-indexed geometry with exactly position, normal, color, anim, pivot, axis (+ glowColor on glow
 * parts); transformed and coloured. Every part has the motion attributes (zeros when still) so any
 * two parts, and any two placed items, always merge.
 */
function prepare(src: THREE.BufferGeometry, at: Vec3, color: PaletteColor, opts?: PartOpts): Part {
  let g = src.index ? src.toNonIndexed() : src;
  if (g !== src) src.dispose();
  for (const name of Object.keys(g.attributes)) {
    if (name !== 'position' && name !== 'normal') g.deleteAttribute(name);
  }
  if (opts?.scale) scaleGeometry(g, opts.scale);
  if (opts?.rotate) {
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...opts.rotate)));
  }
  g.translate(at[0], at[1], at[2]);
  const n = g.attributes.position.count;
  const fill = (name: string, key: PaletteColor) => {
    const c = new THREE.Color(PALETTE[key]);
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
    g.setAttribute(name, new THREE.BufferAttribute(arr, 3));
  };
  fill('color', color);
  const glow = opts?.glow;
  if (glow) fill('glowColor', glow === true ? color : glow);
  const m = opts?.motion ? resolveMotion(opts.motion, at, lowestY(g)) : null;
  if (opts?.light && !glow) throw new Error('style kit: light only applies to glow parts (set glow too)');
  if (glow && opts?.motion?.kind === 'water') {
    throw new Error('style kit: water is drawn by the body material (its night look is built in): drop glow');
  }
  let anim: readonly number[] | null = m?.anim ?? null;
  let pivot: readonly number[] | null = m?.pivot ?? null;
  if (opts?.light && opts.light !== 'steady') {
    // the pattern code rides in anim.x; a window pane's brightness comes from a hash of its own position
    const base = m?.anim ?? [0, 0, 0, 0];
    const pane = opts.light === 'window' ? 6.2831853 * hash2(at[0] * 12.9898 + at[2] * 78.233, at[1] * 37.719) : 0;
    anim = [packLight(base[0], opts.light), base[1], base[2], base[3] + pane];
    // the shader hashes the world position of the pivot for each light's own phase; a light-only part has no
    // motion pivot, so give it one (harmless: movement is gated by the motion kind)
    if (!m) pivot = at;
  }
  const repeat = (name: string, v: readonly number[] | null, size: number) => {
    const arr = new Float32Array(n * size);
    if (v) for (let i = 0; i < n; i++) arr.set(v, i * size);
    g.setAttribute(name, new THREE.BufferAttribute(arr, size));
  };
  repeat('anim', anim, 4);
  repeat('pivot', pivot, 3);
  repeat('axis', m?.axis ?? null, 3);
  return { geometry: g, glow: !!glow };
}

/** Deterministic 0..1 hash of two numbers (item-local, so a rebuilt item looks the same). */
function hash2(a: number, b: number): number {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function lowestY(g: THREE.BufferGeometry): number {
  const pos = g.attributes.position;
  let y = Infinity;
  for (let i = 0; i < pos.count; i++) y = Math.min(y, pos.getY(i));
  return y;
}

/** Whether any vertex of a merged geometry moves (sway, wave, spin, swing). */
function moves(g: THREE.BufferGeometry): boolean {
  const anim = g.attributes.anim;
  for (let i = 0; i < anim.count; i++) {
    const k = Math.round(anim.getX(i)) % LIGHT_STRIDE;
    if (k >= MOTION_CODE.sway && k <= MOTION_CODE.swing) return true;
  }
  return false;
}

/** Scale a non-indexed geometry; a mirroring scale also reverses each triangle so it still faces out. */
function scaleGeometry(g: THREE.BufferGeometry, [x, y, z]: Vec3): void {
  if (![x, y, z].every((v) => Number.isFinite(v) && v !== 0)) {
    throw new Error(`style kit: scale must be three non-zero numbers (got ${x}, ${y}, ${z})`);
  }
  g.scale(x, y, z); // normals go through the normal matrix and are renormalised
  if (x * y * z > 0) return;
  for (const attr of Object.values(g.attributes)) {
    const a = attr.array;
    const n = attr.itemSize;
    for (let t = 0; t < attr.count; t += 3) {
      for (let k = 0; k < n; k++) {
        const i = (t + 1) * n + k;
        const j = (t + 2) * n + k;
        const tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
      }
    }
  }
}

/** Half sphere of radius r on y = 0 with a flat base: `n` segments around, rings from the top. */
function domeGeometry(r: number, n: number): THREE.BufferGeometry {
  const rings = Math.max(2, Math.round(n / 4));
  const pos: number[] = [];
  const nrm: number[] = [];
  // unit point on ring k (0 = top, rings = base edge) at segment j; the base edge is exactly y = 0
  const pt = (k: number, j: number): Vec3 => {
    const theta = (k / rings) * (Math.PI / 2);
    const phi = (j / n) * Math.PI * 2;
    const s = k === rings ? 1 : Math.sin(theta);
    const c = k === rings ? 0 : Math.cos(theta);
    return [s * Math.cos(phi), c, -s * Math.sin(phi)];
  };
  const tri = (...vs: Array<[Vec3, Vec3]>) => { // [unit point, normal] pairs, counter-clockwise from outside
    for (const [p, nv] of vs) { pos.push(p[0] * r, p[1] * r, p[2] * r); nrm.push(...nv); }
  };
  const down: Vec3 = [0, -1, 0];
  const centre: Vec3 = [0, 0, 0];
  for (let j = 0; j < n; j++) {
    const top: Vec3 = [0, 1, 0];
    tri([top, top], [pt(1, j), pt(1, j)], [pt(1, j + 1), pt(1, j + 1)]);
    for (let k = 1; k < rings; k++) {
      const a = pt(k, j), b = pt(k, j + 1), c = pt(k + 1, j), d = pt(k + 1, j + 1);
      tri([a, a], [c, c], [d, d]);
      tri([a, a], [d, d], [b, b]);
    }
    tri([centre, down], [pt(rings, j + 1), down], [pt(rings, j), down]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  return g;
}

function wedgeGeometry([w, h, d]: Vec3, apex: number): THREE.BufferGeometry {
  const x0 = -w / 2, x1 = w / 2, xa = Math.max(-0.5, Math.min(0.5, apex)) * w;
  const y0 = -h / 2, y1 = h / 2, z0 = -d / 2, z1 = d / 2;
  const A = [x0, y0, z1], B = [x1, y0, z1], C = [xa, y1, z1]; // front (+z) end
  const D = [x0, y0, z0], E = [x1, y0, z0], F = [xa, y1, z0]; // back (-z) end
  const tris = [A, B, C, E, D, F, D, E, B, D, B, A, A, C, F, A, F, D, B, E, F, B, F, C]; // CCW from outside
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(tris.flat(), 3));
  g.computeVertexNormals(); // non-indexed: one flat normal per face
  return g;
}

function createKit(): StyleKit {
  const glowUniform = { value: 0 };
  const body = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85, metalness: 0 });
  const glow = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85, metalness: 0 });
  // Both read the motion attributes (motion.ts). Explicit cache keys: the two must never share a program.
  body.onBeforeCompile = (s) => {
    patchMotionShader(s);
    patchWaterShader(s); // pond and pool surfaces (motion kind water)
  };
  body.customProgramCacheKey = () => 'kit-body';
  glow.customProgramCacheKey = () => 'kit-glow';
  glow.onBeforeCompile = (s) => {
    patchMotionShader(s);
    s.uniforms.glowStrength = glowUniform;
    s.vertexShader = ('attribute vec3 glowColor;\nvarying vec3 vGlowColor;\n' + s.vertexShader)
      .replace(/void main\(\) ?\{/, 'void main() {\n  vGlowColor = glowColor;');
    s.fragmentShader = 'uniform float glowStrength;\nvarying vec3 vGlowColor;\n' + s.fragmentShader.replace(
      'vec3 totalEmissiveRadiance = emissive;',
      'vec3 totalEmissiveRadiance = vGlowColor * glowStrength * vLight * 1.5;');
  };

  const merge = (parts: Part[], material: THREE.Material): THREE.Mesh | null => {
    if (parts.length === 0) return null;
    const merged = mergeGeometries(parts.map((p) => p.geometry), false);
    for (const p of parts) p.geometry.dispose();
    if (!merged) throw new Error('style kit: mergeGeometries failed');
    if (moves(merged)) { // never culled while part of it is swayed or swung out of its rest bounds
      merged.computeBoundingSphere();
      merged.boundingSphere!.radius += CULL_MARGIN;
    }
    const mesh = new THREE.Mesh(merged, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  return {
    materials: { body, glow },
    setGlowStrength(v) { glowUniform.value = v; },
    getGlowStrength: () => glowUniform.value,
    box(size, at, color, opts) {
      const r = opts?.round ?? 0;
      const geo = r > 0
        ? new RoundedBoxGeometry(size[0], size[1], size[2], 2, Math.min(r, Math.min(...size) / 2))
        : new THREE.BoxGeometry(size[0], size[1], size[2]);
      return prepare(geo, at, color, opts);
    },
    cylinder(rTop, rBottom, h, at, color, opts) {
      return prepare(new THREE.CylinderGeometry(rTop, rBottom, h, opts?.segments ?? 12), at, color, opts);
    },
    cone(r, h, at, color, opts) {
      return prepare(new THREE.ConeGeometry(r, h, opts?.segments ?? 12), at, color, opts);
    },
    sphere(r, at, color, opts) {
      return prepare(new THREE.IcosahedronGeometry(r, opts?.detail ?? 1), at, color, opts);
    },
    wedge(size, at, color, opts) {
      return prepare(wedgeGeometry(size, opts?.apex ?? 0), at, color, opts);
    },
    torus(radius, tube, at, color, opts) {
      const arc = opts?.arc ?? Math.PI * 2;
      const tubular = opts?.tubularSegments ?? Math.max(3, Math.round((12 * arc) / (Math.PI * 2)));
      return prepare(new THREE.TorusGeometry(radius, tube, opts?.radialSegments ?? 6, tubular, arc), at, color, opts);
    },
    dome(radius, at, color, opts) {
      return prepare(domeGeometry(radius, opts?.segments ?? 12), at, color, opts);
    },
    finish(parts) {
      const group = new THREE.Group();
      const bodyMesh = merge(parts.filter((p) => !p.glow), body);
      const glowMesh = merge(parts.filter((p) => p.glow), glow);
      if (bodyMesh) group.add(bodyMesh);
      if (glowMesh) group.add(glowMesh);
      return group;
    },
  };
}

let instance: StyleKit | undefined;
export function getStyleKit(): StyleKit {
  return (instance ??= createKit());
}

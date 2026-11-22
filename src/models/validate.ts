import * as THREE from 'three';
import type { ThemeDef } from '../themes/types';
import { CATEGORIES, type ItemModel } from './contract';
import type { StyleKit } from './kit';
import { PALETTE } from './palette';

const FOOTPRINTS = ['1x1', '1x2', '2x1', '2x2', '2x3', '3x2'];
const TOL = 0.001;
/** On a footprint axis of n >= 2 tiles the model must span at least n - COVERAGE_GAP (catches wrong-scale models). */
const COVERAGE_GAP = 0.6;
const COLOR_TOL = 1e-3;

/** Palette colours in linear space, the space the kit writes vertex colours in. */
const PALETTE_LINEAR = Object.values(PALETTE).map((hex) => {
  const c = new THREE.Color(hex);
  return [c.r, c.g, c.b] as const;
});

function offPaletteColor(g: THREE.BufferGeometry, attr: 'color' | 'glowColor'): boolean {
  const c = g.attributes[attr];
  const seen = new Set<string>();
  for (let i = 0; i < c.count; i++) {
    const r = c.getX(i), gg = c.getY(i), b = c.getZ(i);
    const key = `${r},${gg},${b}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!PALETTE_LINEAR.some(([pr, pg, pb]) => Math.abs(pr - r) < COLOR_TOL && Math.abs(pg - gg) < COLOR_TOL && Math.abs(pb - b) < COLOR_TOL)) return true;
  }
  return false;
}

function positionsOf(obj: THREE.Object3D): number[][] {
  const out: number[][] = [];
  obj.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) out.push(Array.from((o as THREE.Mesh).geometry.attributes.position?.array ?? []));
  });
  return out;
}

export function validateItemModel(m: ItemModel, kit: StyleKit): string[] {
  const errs: string[] = [];
  const tag = `item "${m.id}"`;
  if (!/^[a-z0-9-]+$/.test(m.id)) errs.push(`${tag}: id must match /^[a-z0-9-]+$/`);
  if (!m.name || m.name.trim() === '') errs.push(`${tag}: name is empty`);
  const { w, d } = m.footprint;
  if (!FOOTPRINTS.includes(`${w}x${d}`)) errs.push(`${tag}: footprint ${w}x${d} not allowed`);
  if (!CATEGORIES.includes(m.category)) errs.push(`${tag}: unknown category "${m.category}"`);

  let obj: THREE.Object3D;
  try {
    obj = m.build(kit);
  } catch (e) {
    errs.push(`${tag}: build() threw: ${e instanceof Error ? e.message : String(e)}`);
    return errs;
  }
  if (obj.position.lengthSq() > 0 || obj.rotation.x !== 0 || obj.rotation.y !== 0 || obj.rotation.z !== 0
    || obj.scale.x !== 1 || obj.scale.y !== 1 || obj.scale.z !== 1) {
    errs.push(`${tag}: transform the parts, not the returned group (root position, rotation and scale must be identity)`);
  }
  const meshes: THREE.Mesh[] = [];
  obj.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh); });
  if (meshes.length === 0) errs.push(`${tag}: model has no meshes (empty group)`);
  if (meshes.length > 2) errs.push(`${tag}: ${meshes.length} meshes (max 2)`);
  let triangles = 0;
  for (const mesh of meshes) {
    if (mesh.material !== kit.materials.body && mesh.material !== kit.materials.glow) {
      errs.push(`${tag}: mesh does not use a kit material`);
    }
    const g = mesh.geometry;
    const isGlow = mesh.material === kit.materials.glow;
    const names = Object.keys(g.attributes).sort().join(',');
    if (names !== (isGlow ? 'color,glowColor,normal,position' : 'color,normal,position')) {
      errs.push(`${tag}: ${isGlow ? 'glow' : 'body'} geometry must have exactly ${isGlow ? 'position, normal, color and glowColor' : 'position, normal and color'} attributes (has ${names || 'none'}); build parts with the kit`);
    } else {
      if (offPaletteColor(g, 'color')) errs.push(`${tag}: vertex colour is not a palette colour`);
      if (isGlow && offPaletteColor(g, 'glowColor')) errs.push(`${tag}: glow colour is not a palette colour`);
    }
    triangles += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
  }
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  const finite = [box.min.x, box.min.y, box.min.z, box.max.x, box.max.y, box.max.z].every(Number.isFinite);
  if (!finite) errs.push(`${tag}: non-finite geometry (NaN or Infinity in a bounding box)`);
  if (finite && !box.isEmpty()) {
    if (box.min.x < -w / 2 - TOL || box.max.x > w / 2 + TOL || box.min.z < -d / 2 - TOL || box.max.z > d / 2 + TOL) {
      errs.push(`${tag}: bounding box exceeds footprint ${w}x${d}`);
    }
    if (box.min.y < -TOL || box.max.y > 5 + TOL) errs.push(`${tag}: height outside [0, 5]`);
    if (Math.abs(box.min.y) > TOL) errs.push(`${tag}: origin must be on the ground (lowest point y=${box.min.y.toFixed(3)}, expected 0)`);
    for (const [axis, n, span] of [['x', w, box.max.x - box.min.x], ['z', d, box.max.z - box.min.z]] as const) {
      if (n >= 2 && span < n - COVERAGE_GAP - TOL) {
        errs.push(`${tag}: model spans ${span.toFixed(2)} of its ${n} tiles along ${axis} (needs at least ${(n - COVERAGE_GAP).toFixed(2)}): build it to fill its footprint`);
      }
    }
  }
  try {
    if (JSON.stringify(positionsOf(obj)) !== JSON.stringify(positionsOf(m.build(kit)))) errs.push(`${tag}: build() must be deterministic (two builds differ)`);
  } catch {
    errs.push(`${tag}: build() must be deterministic (second build threw)`);
  }
  const budget = 800 + 400 * w * d;
  if (triangles > budget) errs.push(`${tag}: ${triangles} triangles exceeds budget ${budget}`);
  return errs;
}

export function validateTheme(t: ThemeDef, kit: StyleKit, opts: { minItems: number }): string[] {
  const errs: string[] = [];
  if (t.items.length < opts.minItems) errs.push(`theme "${t.id}": ${t.items.length} items, need at least ${opts.minItems}`);
  const ids = new Set<string>();
  const names = new Set<string>();
  for (const it of t.items) {
    if (ids.has(it.id)) errs.push(`theme "${t.id}": duplicate id "${it.id}"`);
    ids.add(it.id);
    if (names.has(it.name)) errs.push(`theme "${t.id}": duplicate name "${it.name}"`);
    names.add(it.name);
    errs.push(...validateItemModel(it, kit));
  }
  return errs;
}

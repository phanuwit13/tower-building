import * as THREE from 'three';
import type { ThemeDef } from '../themes/types';
import { CATEGORIES, type ItemModel } from './contract';
import type { StyleKit } from './kit';

const FOOTPRINTS = ['1x1', '1x2', '2x1', '2x2', '2x3', '3x2'];
const TOL = 0.001;

export function validateItemModel(m: ItemModel, kit: StyleKit): string[] {
  const errs: string[] = [];
  const tag = `item "${m.id}"`;
  if (!/^[a-z0-9-]+$/.test(m.id)) errs.push(`${tag}: id must match /^[a-z0-9-]+$/`);
  if (!m.name || m.name.trim() === '') errs.push(`${tag}: name is empty`);
  const { w, d } = m.footprint;
  if (!FOOTPRINTS.includes(`${w}x${d}`)) errs.push(`${tag}: footprint ${w}x${d} not allowed`);
  if (!CATEGORIES.includes(m.category)) errs.push(`${tag}: unknown category "${m.category}"`);

  const obj = m.build(kit);
  const meshes: THREE.Mesh[] = [];
  obj.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh); });
  if (meshes.length > 2) errs.push(`${tag}: ${meshes.length} meshes (max 2)`);
  let triangles = 0;
  for (const mesh of meshes) {
    if (mesh.material !== kit.materials.body && mesh.material !== kit.materials.glow) {
      errs.push(`${tag}: mesh does not use a kit material`);
    }
    const g = mesh.geometry;
    triangles += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
  }
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  if (!box.isEmpty()) {
    if (box.min.x < -w / 2 - TOL || box.max.x > w / 2 + TOL || box.min.z < -d / 2 - TOL || box.max.z > d / 2 + TOL) {
      errs.push(`${tag}: bounding box exceeds footprint ${w}x${d}`);
    }
    if (box.min.y < -TOL || box.max.y > 5 + TOL) errs.push(`${tag}: height outside [0, 5]`);
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

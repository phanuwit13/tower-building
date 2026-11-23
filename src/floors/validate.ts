import * as THREE from 'three';
import type { ItemModel } from '../models/contract';
import type { StyleKit } from '../models/kit';
import { validateItemModel } from '../models/validate';
import { FLOOR_GROUPS, type FloorTile } from './types';

/** Tiles lie on the ground: nothing taller than this (relief included). */
export const MAX_TILE_TOP = 0.05;
export const MAX_TILE_TRIANGLES = 160;
const TOL = 0.001;

const triangles = (obj: THREE.Object3D): number => {
  let n = 0;
  obj.traverse((o) => {
    const g = (o as THREE.Mesh).isMesh ? (o as THREE.Mesh).geometry : null;
    if (g) n += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
  });
  return n;
};

/**
 * Checks a floor tile. The model checks are the items' (validateItemModel: kit materials and
 * attributes, palette colours, finite values, identity root, deterministic build, footprint 1 x 1,
 * on the ground); this adds the tile-only rules: group, no glow, tops, triangles.
 */
export function validateFloorTile(t: FloorTile, kit: StyleKit): string[] {
  const asItem: ItemModel = { id: t.id, name: t.name, category: 'decoration', footprint: { w: 1, d: 1 }, build: t.build };
  const errs = validateItemModel(asItem, kit).map((e) => e.replace(/^item "/, 'floor tile "'));
  const tag = `floor tile "${t.id}"`;
  if (!FLOOR_GROUPS.some((g) => g.id === t.group)) errs.push(`${tag}: unknown group "${t.group}"`);
  let obj: THREE.Object3D;
  try {
    obj = t.build(kit);
  } catch {
    return errs; // validateItemModel already reported it
  }
  let glows = false;
  obj.traverse((o) => { if ((o as THREE.Mesh).isMesh && (o as THREE.Mesh).material === kit.materials.glow) glows = true; });
  if (glows) errs.push(`${tag}: floor tiles do not glow (body material only)`);
  obj.updateMatrixWorld(true);
  const top = new THREE.Box3().setFromObject(obj).max.y;
  if (top > MAX_TILE_TOP + TOL) errs.push(`${tag}: top is ${top.toFixed(3)} high, at most ${MAX_TILE_TOP}`);
  const n = triangles(obj);
  if (n > MAX_TILE_TRIANGLES) errs.push(`${tag}: ${n} triangles exceeds budget ${MAX_TILE_TRIANGLES}`);
  return errs;
}

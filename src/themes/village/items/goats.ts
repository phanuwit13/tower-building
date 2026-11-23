import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { quadruped, type QuadSpec } from './cow-pen';

const FLOOR_H = 0.03;
const GOAT: Omit<QuadSpec, 'x' | 'z' | 'yaw' | 'color'> = {
  len: 0.5, wid: 0.24, hgt: 0.22, leg: 0.15, head: 0.11, muzzle: 'cream', snout: 1,
  ear: 'flop', horn: 'up', hornColor: 'cream', tail: undefined,
};

/** แพะ: a small fenced pen (1×2) with a white goat, a brown goat and a feed box. */
export const item: ItemModel = {
  id: 'goats',
  name: 'แพะ',
  category: 'animal',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.98, FLOOR_H, 1.98], [0, FLOOR_H / 2, 0], 'sand'), kit.box([0.7, 0.045, 0.8], [0.0, 0.0225, 0.2], 'sunYellow')];
    const X = 0.45;
    const Z = 0.94;
    for (const a of [-X, X]) {
      for (const b of [-Z, -0.31, 0.31, Z]) parts.push(kit.box([0.06, 0.36, 0.06], [a, FLOOR_H + 0.18, b], 'woodDark'));
    }
    for (const a of [0]) parts.push(kit.box([0.06, 0.36, 0.06], [a, FLOOR_H + 0.18, -Z], 'woodDark'), kit.box([0.06, 0.36, 0.06], [a, FLOOR_H + 0.18, Z], 'woodDark'));
    for (const y of [0.18, 0.32]) {
      for (const a of [-X, X]) parts.push(kit.box([0.035, 0.035, 2 * Z], [a, FLOOR_H + y, 0], 'wood'));
      for (const b of [-Z, Z]) parts.push(kit.box([2 * X, 0.035, 0.035], [0, FLOOR_H + y, b], 'wood'));
    }
    // feed box with hay, and a hay bale
    parts.push(
      kit.box([0.22, 0.12, 0.5], [-0.28, FLOOR_H + 0.06, -0.62], 'wood'),
      kit.box([0.16, 0.04, 0.42], [-0.28, FLOOR_H + 0.12, -0.62], 'sunYellow'),
      kit.box([0.26, 0.16, 0.3], [0.24, FLOOR_H + 0.08, 0.72], 'sunYellow'),
      kit.sphere(0.17, [-0.2, FLOOR_H + 0.08, 0.72], 'sunYellow', { detail: 0, scale: [1.3, 0.7, 1.1] }),
      kit.box([0.27, 0.02, 0.05], [0.24, FLOOR_H + 0.1, 0.72], 'brass'),
    );
    parts.push(
      ...quadruped(kit, FLOOR_H, { ...GOAT, color: 'white', beard: 'white', x: 0.0, z: 0.2, yaw: -0.5 }),
      ...quadruped(kit, FLOOR_H, { ...GOAT, color: 'terracotta', beard: 'woodDark', earColor: 'woodDark', hornColor: 'cream', legColor: 'woodDark', x: 0.0, z: -0.3, yaw: 0.6 }),
    );
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// 2x2. Dense tall bamboo with a stepping-stone path winding through. All stalks, nodes and leaves share ONE sway pivot at the soil line.
const SOIL_H = 0.05;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, SOIL_H, 0], amount: 0.03 };
const PATH_Z = (x: number): number => 0.15 + 0.25 * Math.sin(x * 2.2); // the path's centre line along x
const PATH_HALF = 0.28;

/** A deterministic 0..1 hash, so the grove is the same every build. */
const hash = (i: number, j: number): number => {
  const v = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** ป่าไผ่: dense tall green bamboo with a path through it. */
export const item: ItemModel = {
  id: 'bamboo-grove',
  name: 'ป่าไผ่',
  category: 'nature',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.96, SOIL_H, 1.96], [0, SOIL_H / 2, 0], 'lime')];
    // stepping stones down the path (low, so they read from above)
    for (let k = 0; k < 7; k++) {
      const x = -0.78 + k * 0.26;
      parts.push(kit.cylinder(0.13, 0.15, 0.03, [x, SOIL_H + 0.015, PATH_Z(x)], 'stone', { segments: 7 }));
    }
    let n = 0;
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        const x = -0.72 + i * 0.29 + (hash(i, j) - 0.5) * 0.1;
        const z = -0.72 + j * 0.29 + (hash(j, i + 9) - 0.5) * 0.1;
        if (Math.abs(z - PATH_Z(x)) < PATH_HALF) continue;
        const h = 1.4 + hash(i + 3, j + 5) * 0.8;
        const r = 0.04 + hash(i, j + 7) * 0.01;
        parts.push(kit.cylinder(r * 0.8, r, h, [x, SOIL_H + h / 2, z], n % 2 === 0 ? 'leaf' : 'lime', { segments: 5, motion: SWAY }));
        parts.push(kit.cylinder(r * 1.2, r * 1.2, 0.03, [x, SOIL_H + h * 0.5, z], 'leafDark', { segments: 5, motion: SWAY }));
        // a leafy tuft at the top
        parts.push(kit.cone(0.1, 0.3, [x, SOIL_H + h - 0.05, z], n % 3 === 0 ? 'leafDark' : 'leaf', { segments: 5, scale: [1, 1, 0.8], motion: SWAY }));
        n++;
      }
    }
    return kit.finish(parts);
  },
};

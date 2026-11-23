import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// 1x2, long side along z. A strip of canal runs the full length (z) between two grass banks, so several
// can be lined up into a canal; an arched wooden footbridge crosses it in the middle (along x).
const BANK_TOP = 0.14;
const CANAL = 0.5; // water width (x)
const WATER_TOP = 0.05;
const END_Y = 0.17; // deck height at the bank
const RISE = 0.17;
const HALF_W = 0.34; // half the bridge width (z)
const SEGS = 5;

const deckY = (x: number): number => END_Y + RISE * (1 - (x / 0.5) ** 2);

/** สะพานไม้ข้ามคลอง: an arched wooden footbridge over a strip of canal. */
export const item: ItemModel = {
  id: 'footbridge',
  name: 'สะพานไม้ข้ามคลอง',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const bankW = (1 - CANAL) / 2 - 0.002;
    const bx = CANAL / 2 + bankW / 2 + 0.001;
    const parts: Part[] = [
      kit.box([CANAL, WATER_TOP, 1.996], [0, WATER_TOP / 2, 0], 'navy', { motion: { kind: 'water', water: 'pond' } }),
    ];
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([bankW, 0.1, 1.996], [s * bx, 0.05, 0], 'stone'), // retaining wall
        kit.box([bankW, BANK_TOP - 0.1, 1.996], [s * bx, 0.1 + (BANK_TOP - 0.1) / 2, 0], 'lime'),
      );
    }
    // arched deck: tilted planks along the arc, a darker arch beam under each
    const step = 0.92 / SEGS;
    for (let i = 0; i < SEGS; i++) {
      const x = -0.46 + step * (i + 0.5);
      const slope = (deckY(x + step / 2) - deckY(x - step / 2)) / step;
      const tilt = Math.atan(slope);
      const len = step / Math.cos(tilt) + 0.02;
      parts.push(kit.box([len, 0.05, HALF_W * 2], [x, deckY(x), 0], 'wood', { rotate: [0, 0, tilt] }));
      for (const sz of [-1, 1]) {
        parts.push(kit.box([len, 0.07, 0.05], [x, deckY(x) - 0.06, sz * (HALF_W - 0.04)], 'woodDark', { rotate: [0, 0, tilt] }));
      }
      // cross-plank lines
      parts.push(kit.box([0.02, 0.012, HALF_W * 2], [x, deckY(x) + 0.028, 0], 'woodDark', { rotate: [0, 0, tilt] }));
    }
    // rails: a post at each segment joint (and the ends) and a handrail on top
    for (const sz of [-1, 1]) {
      const z = sz * (HALF_W - 0.02);
      const xs: number[] = [];
      for (let i = 0; i <= SEGS; i++) xs.push(-0.44 + (0.88 * i) / SEGS);
      xs.forEach((x) => {
        parts.push(kit.cylinder(0.025, 0.025, 0.22, [x, deckY(x) + 0.025 + 0.11, z], 'wood', { segments: 6 }));
      });
      for (let i = 0; i < SEGS; i++) {
        parts.push(rod(kit, [xs[i], deckY(xs[i]) + 0.25, z], [xs[i + 1], deckY(xs[i + 1]) + 0.25, z], 0.022, 'woodDark', { segments: 6 }));
      }
    }
    // a bush and a flower tuft on the banks
    parts.push(
      kit.sphere(0.13, [0.34, BANK_TOP + 0.08, 0.8], 'leaf', { detail: 0, scale: [1.1, 0.8, 1] }),
      kit.sphere(0.06, [0.36, BANK_TOP + 0.16, 0.8], 'pink', { detail: 0 }),
      kit.sphere(0.12, [-0.34, BANK_TOP + 0.07, -0.78], 'leafDark', { detail: 0, scale: [1.1, 0.8, 1] }),
      kit.sphere(0.05, [-0.36, BANK_TOP + 0.13, -0.78], 'sunYellow', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};

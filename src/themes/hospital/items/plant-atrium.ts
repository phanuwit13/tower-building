import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A big indoor planter (2×2) with small, bright, friendly trees and a wooden bench round three sides. Nothing moves.
const PLANTER = { s: 1.1, h: 0.3, wall: 0.08 };
const SEAT_Y = 0.31;

/** สวนในอาคาร: an indoor planter with small bright trees and a bench round it. */
export const item: ItemModel = {
  id: 'plant-atrium',
  name: 'สวนในอาคาร',
  category: 'nature',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.9, 0.03, 1.9], [0, 0.015, 0], 'mint')];
    const { s, h, wall } = PLANTER;
    parts.push(
      kit.box([s, h, wall], [0, h / 2, s / 2 - wall / 2], 'terracotta'),
      kit.box([s, h, wall], [0, h / 2, -s / 2 + wall / 2], 'terracotta'),
      kit.box([wall, h, s - 2 * wall], [s / 2 - wall / 2, h / 2, 0], 'terracotta'),
      kit.box([wall, h, s - 2 * wall], [-s / 2 + wall / 2, h / 2, 0], 'terracotta'),
      kit.box([s, 0.04, s], [0, h + 0.02, 0], 'terracotta'), // rim cap hidden by soil inset below
      kit.box([s - 2 * wall, 0.03, s - 2 * wall], [0, h + 0.045, 0], 'bark'),
    );
    // lawn patches and small flowers on the soil
    parts.push(kit.box([0.5, 0.02, 0.4], [0.2, h + 0.07, 0.15], 'lime'));
    for (const [x, z, c] of [[0.3, 0.38, 'pink'], [-0.15, 0.4, 'sunYellow'], [0.4, -0.15, 'purple'], [-0.35, 0.1, 'orange']] as const) {
      parts.push(kit.sphere(0.04, [x, h + 0.11, z], c, { detail: 0 }));
    }
    // small friendly trees: [x, z, trunk height, crown radius, crown colour]
    const trees = [
      [-0.2, -0.2, 0.35, 0.25, 'leaf'],
      [0.2, -0.28, 0.25, 0.2, 'lime'],
      [0.0, 0.2, 0.2, 0.17, 'leafDark'],
      [-0.3, 0.3, 0.15, 0.14, 'lime'],
    ] as const;
    const base = h + 0.06;
    for (const [x, z, th, cr, c] of trees) {
      parts.push(
        kit.cylinder(0.04, 0.055, th, [x, base + th / 2, z], 'woodDark', { segments: 8 }),
        kit.sphere(cr, [x, base + th + cr * 0.7, z], c, { detail: 1 }),
      );
    }
    // a pink-blossom tree
    parts.push(
      kit.cylinder(0.035, 0.05, 0.2, [0.3, base + 0.1, 0.3], 'woodDark', { segments: 8 }),
      kit.sphere(0.15, [0.3, base + 0.3, 0.3], 'pink', { detail: 1 }),
    );
    // bench round the -x, +z and -z sides: seat plank, legs, a little cushion
    const bench = (cx: number, cz: number, lx: number, lz: number): void => {
      parts.push(kit.box([lx, 0.05, lz], [cx, SEAT_Y - 0.025, cz], 'wood'));
      const long = lx > lz;
      for (const e of [-1, 1]) {
        const px = long ? cx + e * (lx / 2 - 0.1) : cx;
        const pz = long ? cz : cz + e * (lz / 2 - 0.1);
        parts.push(kit.box([long ? 0.06 : lx - 0.06, SEAT_Y - 0.05, long ? lz - 0.06 : 0.06], [px, (SEAT_Y - 0.05) / 2, pz], 'woodDark'));
      }
    };
    bench(0, 0.72, 1.7, 0.3);
    bench(0, -0.72, 1.7, 0.3);
    bench(-0.72, 0, 0.3, 1.14);
    for (const [x, z, c] of [[-0.4, 0.72, 'sunYellow'], [0.4, -0.72, 'blue'], [-0.72, -0.25, 'pink']] as const) {
      parts.push(kit.box([0.22, 0.05, 0.22], [x, SEAT_Y + 0.025, z], c));
    }
    return kit.finish(parts);
  },
};

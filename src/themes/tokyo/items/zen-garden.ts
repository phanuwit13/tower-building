import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// 2x2. A raked-gravel bed with three rocks, each ringed by shallow raised lines, inside a low wooden fence.
const BED_H = 0.04; // the gravel's top
const RING_Y = BED_H + 0.002;
const HALF = 0.94; // the fence line
/** [x, z, rock size, big?]: rocks and the rings round them. */
const ROCKS: Array<[number, number, number]> = [
  [0.35, 0.3, 0.24],
  [-0.45, -0.2, 0.19],
  [0.25, -0.5, 0.15],
];
const RING_SCALE = [1.7, 2.5]; // ring radii as multiples of the rock size

/** สวนหินเซน: raked gravel in wave rings round three rocks, with a low fence. */
export const item: ItemModel = {
  id: 'zen-garden',
  name: 'สวนหินเซน',
  category: 'nature',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.96, BED_H, 1.96], [0, BED_H / 2, 0], 'sand')];
    for (const [x, z, s] of ROCKS) {
      for (const k of RING_SCALE) {
        parts.push(kit.torus(s * k, 0.02, [x, RING_Y, z], 'white', { rotate: [Math.PI / 2, 0, 0], radialSegments: 4, tubularSegments: 24 }));
      }
      // the rock: a big grey lump, a smaller one beside it and a cap of moss
      parts.push(
        kit.sphere(s, [x, BED_H + s * 0.8, z], 'stoneDark', { detail: 1, scale: [1, 0.8, 0.9] }),
        kit.sphere(s * 0.55, [x + s * 0.8, BED_H + s * 0.45, z + s * 0.3], 'stone', { detail: 0, scale: [1, 0.8, 1] }),
        kit.sphere(s * 0.4, [x - s * 0.1, BED_H + s * 1.5, z], 'leaf', { detail: 0, scale: [1.2, 0.45, 1.2] }),
      );
    }
    // the low fence: posts every 0.47 and two rails per side
    const posts = [-HALF, -0.47, 0, 0.47, HALF];
    for (const p of posts) {
      for (const edge of [-HALF, HALF]) {
        parts.push(kit.box([0.07, 0.24, 0.07], [p, BED_H + 0.12, edge], 'woodDark'));
        if (Math.abs(p) !== HALF) parts.push(kit.box([0.07, 0.24, 0.07], [edge, BED_H + 0.12, p], 'woodDark'));
      }
    }
    for (const y of [0.13, 0.22]) {
      for (const edge of [-HALF, HALF]) {
        parts.push(
          kit.box([2 * HALF, 0.035, 0.03], [0, BED_H + y, edge], 'wood'),
          kit.box([0.03, 0.035, 2 * HALF], [edge, BED_H + y, 0], 'wood'),
        );
      }
    }
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { rod } from '../../../models/parts';

// A huge umbrella-shaped rain tree (2×2): a thick trunk, a wide flat crown about 2.9 high that sways from the
// top of the trunk, and a round eight-sided bench round the trunk (seat 0.31).
const TRUNK_TOP = 2.0;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, TRUNK_TOP, 0], amount: 0.04 };
const SEAT_Y = 0.31;
const BENCH_R = 0.5; // centre radius of the ring
const SEGMENTS = 8;
/** Crown puffs: [x, y, z, radius, colour]; all flattened to 0.36 of their height. */
const CROWN: Array<[number, number, number, number, 'leaf' | 'leafDark' | 'lime']> = [
  [0, 2.3, 0, 0.8, 'leaf'],
  [0.35, 2.4, 0.15, 0.6, 'lime'],
  [-0.4, 2.38, -0.2, 0.55, 'leafDark'],
  [-0.15, 2.45, 0.4, 0.5, 'leaf'],
  [0.15, 2.5, -0.4, 0.5, 'lime'],
];
const FLOWERS: Array<[number, number, number]> = [[0.5, 2.68, 0.2], [-0.2, 2.78, 0.1], [0.1, 2.72, -0.5], [-0.55, 2.55, -0.25], [0.2, 2.7, 0.55], [-0.35, 2.6, 0.45], [0.7, 2.5, -0.1]];

/** ต้นจามจุรี: a huge umbrella shade tree with a round bench round its trunk. */
export const item: ItemModel = {
  id: 'rain-tree',
  name: 'ต้นจามจุรี',
  category: 'nature',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.14, 0.2, 0.2, [0, 0.1, 0], 'woodDark', { segments: 8 }),
      kit.cylinder(0.1, 0.14, TRUNK_TOP - 0.1, [0, 0.1 + (TRUNK_TOP - 0.1) / 2, 0], 'wood', { segments: 8 }),
      rod(kit, [0, TRUNK_TOP - 0.2, 0], [0.45, TRUNK_TOP + 0.15, 0.1], 0.04, 'wood', { segments: 5 }),
      rod(kit, [0, TRUNK_TOP - 0.2, 0], [-0.4, TRUNK_TOP + 0.15, -0.15], 0.04, 'wood', { segments: 5 }),
    ];
    for (const [x, y, z, r, color] of CROWN) parts.push(kit.sphere(r, [x, y, z], color, { scale: [1, 0.36, 1], motion: SWAY }));
    for (const [x, y, z] of FLOWERS) parts.push(kit.sphere(0.06, [x, y, z], 'pink', { detail: 0, motion: SWAY }));
    // The bench: an octagon of seat slabs on short legs, every slab turned to face the trunk.
    const side = 2 * BENCH_R * Math.tan(Math.PI / SEGMENTS);
    for (let i = 0; i < SEGMENTS; i++) {
      const a = (i / SEGMENTS) * Math.PI * 2 + Math.PI / SEGMENTS;
      const c = Math.cos(a);
      const s = -Math.sin(a);
      parts.push(
        kit.box([0.24, 0.05, side + 0.03], [BENCH_R * c, SEAT_Y - 0.025, BENCH_R * s], i % 2 === 0 ? 'wood' : 'sand', { rotate: [0, a, 0] }),
        kit.box([0.06, SEAT_Y - 0.05, 0.06], [(BENCH_R + 0.05) * c, (SEAT_Y - 0.05) / 2, (BENCH_R + 0.05) * s], 'woodDark', { rotate: [0, a, 0] }),
      );
    }
    return kit.finish(parts);
  },
};

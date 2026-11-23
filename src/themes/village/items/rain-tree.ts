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
/** Crown: stacked flat discs, all centred on the trunk: [y, radius, colour]. Each is flattened to 0.28 of its height. */
const CROWN: Array<[number, number, 'leaf' | 'leafDark' | 'lime']> = [
  [2.25, 0.9, 'leafDark'],
  [2.42, 0.78, 'leaf'],
  [2.58, 0.55, 'lime'],
  [2.72, 0.3, 'leaf'],
];
const FLOWER_RING = 0.62; // pink blossoms in a symmetric ring on the top disc
/** ต้นจามจุรี: a huge umbrella shade tree with a round bench round its trunk. */
export const item: ItemModel = {
  id: 'rain-tree',
  name: 'ต้นจามจุรี',
  category: 'nature',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.17, 0.26, 0.2, [0, 0.1, 0], 'woodDark', { segments: 8 }),
      kit.cylinder(0.13, 0.18, TRUNK_TOP - 0.1, [0, 0.1 + (TRUNK_TOP - 0.1) / 2, 0], 'wood', { segments: 8 }),
    ];
    // The trunk splits into four branches that fan out under the crown.
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      parts.push(rod(kit, [0, TRUNK_TOP - 0.15, 0], [0.55 * Math.cos(a), 2.3, -0.55 * Math.sin(a)], 0.06, 'wood', { segments: 6 }));
    }
    for (const [y, r, color] of CROWN) parts.push(kit.sphere(r, [0, y, 0], color, { scale: [1, 0.28, 1], motion: SWAY }));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      parts.push(kit.sphere(0.06, [FLOWER_RING * Math.cos(a), 2.6, FLOWER_RING * Math.sin(a)], 'pink', { detail: 0, motion: SWAY }));
    }
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

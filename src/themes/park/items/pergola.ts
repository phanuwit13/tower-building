import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import type { MotionOpts } from '../../../models/motion';

// 1 wide (x) by 2 long (z). Four posts, beams along z, rafters across x, vines and flowers on top and hanging
// down; a bench under it with its back to -x. Only the vine clumps on the roof sway (pivot on the rafters).
const POST = { x: 0.4, z: 0.85, h: 1.15 };
const TOP = POST.h; // underside of the beams
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, TOP + 0.1, 0], amount: 0.12 };
const SEAT_Y = 0.31;

/** ซุ้มไม้เลื้อย: a wooden pergola with flowering vines and a bench under it. */
export const item: ItemModel = {
  id: 'pergola',
  name: 'ซุ้มไม้เลื้อย',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) parts.push(kit.box([0.1, POST.h, 0.1], [sx * POST.x, POST.h / 2, sz * POST.z], 'wood'));
      parts.push(kit.box([0.1, 0.1, 1.9], [sx * POST.x, TOP + 0.05, 0], 'woodDark')); // beams along z
    }
    for (const z of [-0.8, -0.4, 0, 0.4, 0.8]) parts.push(kit.box([0.96, 0.06, 0.07], [0, TOP + 0.13, z], 'wood')); // rafters
    // vine clumps on the roof, in leaf and flower colours
    const CLUMPS: Array<[number, number, number, PaletteColor]> = [
      [0.15, -0.7, 0.14, 'leaf'], [-0.18, -0.35, 0.15, 'leafDark'], [0.1, 0, 0.14, 'leaf'],
      [-0.12, 0.38, 0.15, 'leaf'], [0.17, 0.72, 0.14, 'leafDark'],
    ];
    for (const [x, z, r, c] of CLUMPS) parts.push(kit.sphere(r, [x, TOP + 0.22, z], c, { detail: 0, scale: [1, 0.7, 1], motion: SWAY }));
    const BLOOMS: Array<[number, number, PaletteColor]> = [
      [0.18, -0.62, 'pink'], [-0.2, -0.45, 'sunYellow'], [0.05, -0.08, 'purple'], [0.2, 0.1, 'pink'],
      [-0.15, 0.45, 'pink'], [0.1, 0.62, 'sunYellow'], [-0.2, 0.8, 'purple'],
    ];
    for (const [x, z, c] of BLOOMS) parts.push(kit.sphere(0.055, [x, TOP + 0.33, z], c, { detail: 0, motion: SWAY }));
    // vines hanging off the beams and climbing the front posts (still: below the pivot)
    for (const [x, z, h] of [[0.4, -0.45, 0.3], [0.4, 0.3, 0.25], [-0.4, -0.1, 0.28], [-0.4, 0.55, 0.22], [0.4, 0.85, 0.5], [0.4, -0.85, 0.45]] as const) {
      parts.push(
        kit.sphere(0.08, [x, TOP - h / 2, z], 'leaf', { detail: 0, scale: [0.9, h / 0.16, 0.9] }),
        kit.sphere(0.04, [x + 0.04, TOP - h, z], z > 0 ? 'pink' : 'sunYellow', { detail: 0 }),
      );
    }
    // bench, back to -x
    parts.push(
      kit.box([0.3, 0.05, 1.1], [0.02, SEAT_Y - 0.025, 0], 'woodDark'),
      kit.box([0.05, 0.31, 1.1], [-0.16, 0.465, 0], 'woodDark'),
    );
    for (const z of [-0.45, 0.45]) {
      parts.push(kit.box([0.26, 0.26, 0.06], [0.02, 0.13, z], 'wood'));
    }
    // a path stone and a flower pot
    parts.push(kit.box([0.5, 0.025, 1.7], [0.05, 0.0125 + 0.0075, 0], 'stone'));
    return kit.finish(parts);
  },
};

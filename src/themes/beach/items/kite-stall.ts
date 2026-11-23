import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { gableRoof } from '../../../models/parts';

// A small timber stall (1×2, long side along z) with a striped roof; two tall poles behind it fly four kites that sway.
const BASE = 0.03;
const STALL = { x: -0.02, w: 0.7, d: 1.7, post: 0.88 }; // the roof sits on top of the posts
const POLE = { x: -0.45, h: 2.2, z: 0.7 };
const SWAY: MotionOpts = { kind: 'sway', pivot: [-0.3, 1.1, 0], amount: 0.08 }; // the kites, cords and tails swing from the roof line
const KITE = { halfH: 0.17, halfW: 0.12, x: -0.2 };
/** [pole side (z sign), centre y, colour, tail colours] */
const KITES: Array<[number, number, PaletteColor, [PaletteColor, PaletteColor]]> = [
  [-1, 1.5, 'red', ['white', 'sunYellow']],
  [-1, 1.95, 'sunYellow', ['pink', 'blue']],
  [1, 1.5, 'blue', ['orange', 'white']],
  [1, 1.95, 'pink', ['purple', 'sunYellow']],
];

/** แผงขายว่าว: a stall with a striped roof and kites flying on poles above it. */
export const item: ItemModel = {
  id: 'kite-stall',
  name: 'แผงขายว่าว',
  category: 'building',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.98, BASE, 1.96], [0, BASE / 2, 0], 'sand'),
      // back wall, counter, posts
      kit.box([0.04, 0.58, 1.6], [STALL.x - STALL.w / 2 + 0.04, BASE + 0.29, 0], 'sunYellow'),
      kit.box([0.26, 0.3, 1.6], [STALL.x + 0.2, BASE + 0.15, 0], 'wood'),
      kit.box([0.3, 0.04, 1.64], [STALL.x + 0.2, BASE + 0.32, 0], 'woodDark'),
      ...[-0.8, 0.8].flatMap((z) => [
        kit.cylinder(0.035, 0.035, STALL.post, [STALL.x + STALL.w / 2 - 0.06, BASE + STALL.post / 2, z], 'woodDark', { segments: 6 }),
        kit.cylinder(0.035, 0.035, STALL.post, [STALL.x - STALL.w / 2 + 0.06, BASE + STALL.post / 2, z], 'woodDark', { segments: 6 }),
      ]),
      ...gableRoof(kit, { at: [STALL.x, BASE + STALL.post, 0], length: 1.84, width: STALL.w - 0.04, rise: 0.16, eave: 0.04, color: 'red', ridge: 'redDark' }),
      // flat kites for sale on the counter
      kit.cylinder(1, 1, 0.02, [STALL.x + 0.2, BASE + 0.35, -0.45], 'orange', { segments: 4, scale: [0.1, 1, 0.14], rotate: [0, 0.3, 0] }),
      kit.cylinder(1, 1, 0.02, [STALL.x + 0.2, BASE + 0.37, -0.1], 'purple', { segments: 4, scale: [0.1, 1, 0.14], rotate: [0, -0.3, 0] }),
      kit.cylinder(1, 1, 0.02, [STALL.x + 0.2, BASE + 0.35, 0.3], 'lime', { segments: 4, scale: [0.1, 1, 0.14], rotate: [0, 0.2, 0] }),
      kit.cylinder(1, 1, 0.02, [STALL.x + 0.22, BASE + 0.37, 0.62], 'mint', { segments: 4, scale: [0.1, 1, 0.14], rotate: [0, -0.4, 0] }),
    ];
    // the tall kite poles at the back corners
    for (const sz of [-1, 1]) {
      parts.push(kit.cylinder(0.025, 0.03, POLE.h, [POLE.x, BASE + POLE.h / 2, sz * POLE.z], 'wood', { segments: 6 }));
    }
    for (const [sz, cy, color, tail] of KITES) {
      const z = sz * POLE.z;
      parts.push(
        // diamond kite standing in the y-z plane, facing +x
        kit.cylinder(1, 1, 0.025, [KITE.x, cy, z], color, { segments: 4, scale: [KITE.halfH, 1, KITE.halfW], rotate: [0, 0, Math.PI / 2], motion: SWAY }),
        kit.box([0.012, KITE.halfH * 1.6, 0.012], [KITE.x + 0.016, cy, z], 'white', { motion: SWAY }),
        // cord to the pole
        kit.box([KITE.x - POLE.x - 0.05, 0.016, 0.016], [(KITE.x + POLE.x) / 2, cy, z], 'white', { motion: SWAY }),
        kit.box([0.04, 0.05, 0.05], [KITE.x, cy - KITE.halfH - 0.05, z], tail[0], { motion: SWAY }),
        kit.box([0.04, 0.05, 0.05], [KITE.x, cy - KITE.halfH - 0.13, z], tail[1], { motion: SWAY }),
      );
    }
    return kit.finish(parts);
  },
};

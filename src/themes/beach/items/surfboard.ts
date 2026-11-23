import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A colourful surfboard (a long ellipsoid, orange with white and blue stripes) planted upright in a mound of sand,
// its flat face towards +x.
const MOUND = { r: 0.42, h: 0.18 };
const BOARD = { half: [0.04, 0.8, 0.17] as const, cy: 0.9 }; // ellipsoid radii (x, y, z) and centre height
const STRIPES: Array<{ y: number; h: number; color: 'white' | 'blue' | 'sunYellow' }> = [
  { y: 0.7, h: 0.1, color: 'white' },
  { y: 0.95, h: 0.1, color: 'blue' },
  { y: 1.2, h: 0.1, color: 'sunYellow' },
];

/** กระดานโต้คลื่นปักทราย: a colourful surfboard standing upright in the sand. */
export const item: ItemModel = {
  id: 'surfboard',
  name: 'กระดานโต้คลื่นปักทราย',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.dome(MOUND.r, [0, 0, 0], 'sand', { scale: [1, MOUND.h / MOUND.r, 1] }),
      kit.sphere(1, [0, BOARD.cy, 0], 'orange', { detail: 1, scale: [...BOARD.half] }),
      // a small fin showing at the back and a few shells on the mound
      kit.wedge([0.1, 0.18, 0.04], [-0.07, 0.45, 0], 'blue'),
      kit.sphere(0.05, [0.28, 0.07, 0.15], 'pink', { detail: 0 }),
      kit.sphere(0.04, [0.22, 0.06, -0.24], 'white', { detail: 0 }),
    ];
    for (const s of STRIPES) {
      // widest stripe the board's width allows at that height
      const t = (s.y - BOARD.cy) / BOARD.half[1];
      const w = 2 * BOARD.half[2] * Math.sqrt(1 - t * t) * 0.7;
      parts.push(kit.box([0.086, s.h, w], [0, s.y, 0], s.color));
    }
    return kit.finish(parts);
  },
};

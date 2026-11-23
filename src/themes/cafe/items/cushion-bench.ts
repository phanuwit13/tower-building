import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const SEAT_Y = 0.31; // seat top (before cushions)
const LEN = 1.9; // bench length along z
const CUSHIONS = [
  { z: -0.7, c: 'red' },
  { z: -0.23, c: 'sunYellow' },
  { z: 0.23, c: 'teal' },
  { z: 0.7, c: 'pink' },
] as const;
const PILLOWS = [
  { z: -0.55, c: 'mint', tilt: 0.25 },
  { z: 0.05, c: 'orange', tilt: -0.2 },
  { z: 0.6, c: 'purple', tilt: 0.15 },
] as const;

/** ม้านั่งยาวมีเบาะ: a long wooden bench with colourful cushions, seat on the +x side facing +x. */
export const item: ItemModel = {
  id: 'cushion-bench',
  name: 'ม้านั่งยาวมีเบาะ',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.5, 0.05, LEN], [0, SEAT_Y - 0.025, 0], 'wood'),
      kit.box([0.5, 0.025, 0.04], [0, 0.2, LEN / 2 - 0.12], 'woodDark'), // seat rails
      kit.box([0.04, 0.1, LEN], [-0.2, 0.2, 0], 'woodDark'),
      // backrest: two posts-wide board with a top rail
      kit.box([0.05, 0.22, LEN], [-0.22, 0.45, 0], 'wood'),
      kit.box([0.07, 0.05, LEN + 0.04], [-0.22, 0.6, 0], 'woodDark'),
    ];
    for (const z of [-LEN / 2 + 0.1, 0, LEN / 2 - 0.1]) {
      for (const x of [-0.2, 0.2]) parts.push(kit.box([0.06, SEAT_Y - 0.05, 0.06], [x, (SEAT_Y - 0.05) / 2, z], 'woodDark'));
    }
    for (const c of CUSHIONS) parts.push(kit.box([0.36, 0.07, 0.4], [0.04, SEAT_Y + 0.035, c.z], c.c));
    // small pillows leaning on the backrest
    for (const p of PILLOWS) {
      parts.push(kit.box([0.08, 0.2, 0.22], [-0.14, SEAT_Y + 0.17, p.z], p.c, { rotate: [p.tilt, 0, 0.12] }));
    }
    return kit.finish(parts);
  },
};

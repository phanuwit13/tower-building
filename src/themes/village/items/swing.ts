import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { rod } from '../../../models/parts';

const TOP = 1.15; // top bar height
const LEG_X = 0.36;
const SPREAD = 0.38; // A-frame feet at z = ±SPREAD
const SEAT_Y = 0.36;
// ropes and seat rock together about the top bar (x axis)
const SWING: MotionOpts = { kind: 'swing', pivot: [0, TOP, 0], axis: [1, 0, 0], amount: 0.25 };

/** ชิงช้าไม้: a wooden A-frame swing with a plank seat; it swings gently from the top bar. */
export const item: ItemModel = {
  id: 'swing',
  name: 'ชิงช้าไม้',
  category: 'play',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const x of [-LEG_X, LEG_X]) {
      for (const s of [-1, 1]) {
        parts.push(
          rod(kit, [x, TOP - 0.02, 0], [x, 0.04, s * SPREAD], 0.04, 'wood', { segments: 6 }),
          kit.box([0.14, 0.06, 0.14], [x, 0.03, s * SPREAD], 'woodDark'),
        );
      }
    }
    parts.push(
      kit.cylinder(0.045, 0.045, 2 * LEG_X + 0.1, [0, TOP, 0], 'woodDark', { rotate: [0, 0, Math.PI / 2], segments: 8 }),
      kit.sphere(0.05, [-LEG_X - 0.05, TOP, 0], 'red', { detail: 0 }),
      kit.sphere(0.05, [LEG_X + 0.05, TOP, 0], 'red', { detail: 0 }),
    );
    for (const dx of [-0.16, 0.16]) {
      parts.push(kit.cylinder(0.015, 0.015, TOP - SEAT_Y, [dx, (TOP + SEAT_Y) / 2, 0], 'stoneDark', { segments: 4, motion: SWING }));
    }
    parts.push(kit.box([0.4, 0.05, 0.18], [0, SEAT_Y, 0], 'orange', { motion: SWING }));
    return kit.finish(parts);
  },
};

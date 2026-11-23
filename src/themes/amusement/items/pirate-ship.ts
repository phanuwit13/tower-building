import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { rod } from '../../../models/parts';

// A big boat hanging from a top bar between two A-frames. The A-frames stand at x = ±FRAME_X, the bar runs along x,
// and the boat (long side along z) swings about the bar, so it rocks along its length.
const TOP = 2.0; // height of the bar
const FRAME_X = 0.8;
const SPREAD = 1.2; // A-frame feet at z = ±SPREAD
const LEG_R = 0.06;
const DECK_Y = 0.84; // top of the boat's deck
const BASE = { w: 1.9, d: 2.9, h: 0.05 }; // stone ride platform
const SWING: MotionOpts = { kind: 'swing', pivot: [0, TOP, 0], axis: [1, 0, 0], amount: 0.28 };
const HORN = { z: 0.93, y: 0.95, tilt: 0.55 };

/** เรือไวกิ้ง: a big red boat with dragon heads, hanging from an A-frame and rocking along its length. */
export const item: ItemModel = {
  id: 'pirate-ship',
  name: 'เรือไวกิ้ง',
  category: 'ride',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'stone')];
    // two A-frames
    for (const x of [-FRAME_X, FRAME_X]) {
      for (const s of [-1, 1]) {
        parts.push(
          rod(kit, [x, BASE.h + 0.05, s * SPREAD], [x, TOP, 0], LEG_R, 'blue', { segments: 8 }),
          kit.box([0.26, 0.05, 0.3], [x, BASE.h + 0.025, s * (SPREAD + 0.02)], 'charcoal'),
        );
      }
      parts.push(kit.box([0.16, 0.16, 0.2], [x, TOP, 0], 'sunYellow'));
    }
    parts.push(kit.cylinder(0.06, 0.06, FRAME_X * 2 + 0.12, [0, TOP, 0], 'red', { rotate: [0, 0, Math.PI / 2], segments: 8 }));
    for (const x of [-FRAME_X - 0.06, FRAME_X + 0.06]) parts.push(kit.sphere(0.08, [x, TOP, 0], 'red', { detail: 0 }));

    // the boat: arms, hull, rails, deck, upturned dragon-head ends, shields and little crew heads: all swing together
    for (const x of [-0.22, 0.22]) parts.push(kit.cylinder(0.035, 0.035, TOP - DECK_Y, [x, (TOP + DECK_Y) / 2, 0], 'stoneDark', { segments: 6, motion: SWING }));
    parts.push(
      kit.box([0.5, 0.14, 1.5], [0, 0.57, 0], 'woodDark', { motion: SWING }),
      kit.box([0.8, 0.2, 1.8], [0, 0.74, 0], 'red', { motion: SWING }),
      kit.box([0.7, 0.02, 1.7], [0, DECK_Y + 0.01, 0], 'wood', { motion: SWING }),
    );
    for (const x of [-0.39, 0.39]) parts.push(kit.box([0.06, 0.07, 1.84], [x, DECK_Y + 0.035, 0], 'sunYellow', { motion: SWING }));
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([0.84, 0.07, 0.06], [0, DECK_Y + 0.035, s * 0.9], 'sunYellow', { motion: SWING }),
        kit.box([0.5, 0.34, 0.1], [0, HORN.y, s * HORN.z], 'red', { rotate: [s * HORN.tilt, 0, 0], motion: SWING }),
        kit.sphere(0.13, [0, HORN.y + 0.17, s * (HORN.z + 0.09)], 'sunYellow', { detail: 0, motion: SWING }),
      );
      for (const x of [-0.2, 0.2]) {
        parts.push(kit.sphere(0.075, [x, DECK_Y + 0.12, s * 0.45], s > 0 ? 'pink' : 'lime', { detail: 0, motion: SWING }));
        parts.push(kit.sphere(0.075, [x, DECK_Y + 0.12, s * 0.72], s > 0 ? 'orange' : 'purple', { detail: 0, motion: SWING }));
      }
    }
    for (const x of [-1, 1]) {
      [-0.65, -0.25, 0.25, 0.65].forEach((z, i) => {
        parts.push(kit.cylinder(0.1, 0.1, 0.04, [x * 0.41, 0.74, z], i % 2 === 0 ? 'sunYellow' : 'blue', { rotate: [0, 0, Math.PI / 2], segments: 10, motion: SWING }));
      });
    }
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { aim } from '../../../models/parts';

const BASE = { w: 0.68, h: 0.22, d: 0.44 }; // blue pedestal with a yellow top plate
const PLATE = { w: 0.78, h: 0.05, d: 0.52 };
const POLE_TOP = 0.56; // the horse rocks about the top of its pole
const BODY = { y: 0.64, rx: 0.26, ry: 0.15, rz: 0.12 };

// The horse (everything above the pole) rocks gently about a pin through its belly, along z.
const ROCK: MotionOpts = { kind: 'swing', pivot: [0, POLE_TOP, 0], axis: [0, 0, 1], amount: 0.1, speed: 1.6 };

/** ม้าโยกหยอดเหรียญ: a small coin-operated rocking horse on a pedestal, with a coin slot on the front. */
export const item: ItemModel = {
  id: 'coin-horse',
  name: 'ม้าโยกหยอดเหรียญ',
  category: 'ride',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const m = { motion: ROCK };
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'blue'),
      kit.box([PLATE.w, PLATE.h, PLATE.d], [0, BASE.h + PLATE.h / 2, 0], 'sunYellow'),
      // coin box on the front
      kit.box([0.04, 0.12, 0.14], [BASE.w / 2 + 0.02, 0.12, 0], 'red'),
      kit.box([0.012, 0.05, 0.015], [BASE.w / 2 + 0.046, 0.14, 0], 'charcoal'),
      kit.cylinder(0.025, 0.025, POLE_TOP - BASE.h - PLATE.h, [0, (BASE.h + PLATE.h + POLE_TOP) / 2, 0], 'chrome', { segments: 8 }),
      // body, saddle and the four legs
      kit.sphere(1, [0, BODY.y, 0], 'white', { detail: 1, scale: [BODY.rx, BODY.ry, BODY.rz], ...m }),
      kit.box([0.14, 0.04, 0.2], [0, BODY.y + BODY.ry - 0.01, 0], 'red', m),
      // head, neck and snout
      kit.sphere(0.1, [0.34, 0.88, 0], 'white', { detail: 0, scale: [1.1, 0.85, 0.85], ...m }),
      kit.box([0.09, 0.07, 0.08], [0.41, 0.84, 0], 'pink', { rotate: [0, 0, -0.3], ...m }),
      kit.sphere(0.015, [0.37, 0.92, 0.075], 'charcoal', { detail: 0, ...m }),
      kit.sphere(0.015, [0.37, 0.92, -0.075], 'charcoal', { detail: 0, ...m }),
      kit.cylinder(0.07, 0.08, 0.22, [0.25, 0.77, 0], 'white', { segments: 6, rotate: aim([0.16, 0.15, 0]), ...m }),
      // mane and tail
      kit.box([0.04, 0.2, 0.05], [0.25, 0.86, 0], 'pink', { rotate: [0, 0, -0.7], ...m }),
      kit.cone(0.05, 0.14, [-0.28, 0.82, 0], 'pink', { segments: 6, rotate: [0, 0, 0.7], ...m }),
      kit.cylinder(0.03, 0.02, 0.2, [-0.31, 0.56, 0], 'pink', { segments: 6, rotate: [0, 0, 0.3], ...m }),
    ];
    for (const s of [-1, 1]) {
      const ear: Vec3 = [0.35, 0.97, s * 0.05];
      parts.push(kit.cone(0.03, 0.08, ear, 'pink', { segments: 4, ...m }));
      for (const x of [-0.17, 0.17]) {
        parts.push(kit.cylinder(0.035, 0.03, 0.2, [x, 0.55, s * 0.07], 'white', { segments: 6, ...m }));
      }
    }
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// A street tree (1×1) in a square cast-iron grate, with a round layered crown that sways from the top of the trunk.
const GRATE = { w: 0.9, h: 0.04 };
const TRUNK = { r: 0.07, h: 0.8 };
const TRUNK_TOP = GRATE.h + TRUNK.h;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, TRUNK_TOP, 0], amount: 0.06 };

/** ต้นไม้ริมทาง: a street tree in a square grate. */
export const item: ItemModel = {
  id: 'street-tree',
  name: 'ต้นไม้ริมทาง',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([GRATE.w, GRATE.h, GRATE.w], [0, GRATE.h / 2, 0], 'charcoal'),
      kit.box([0.5, 0.01, 0.5], [0, GRATE.h + 0.005, 0], 'bark'), // soil opening
      kit.cylinder(TRUNK.r * 0.8, TRUNK.r, TRUNK.h, [0, GRATE.h + TRUNK.h / 2, 0], 'bark', { segments: 8 }),
      kit.sphere(0.36, [0, TRUNK_TOP + 0.3, 0], 'leaf', { motion: SWAY }),
      kit.sphere(0.27, [0.2, TRUNK_TOP + 0.18, 0.12], 'leafDark', { motion: SWAY }),
      kit.sphere(0.25, [-0.17, TRUNK_TOP + 0.2, -0.14], 'leafDark', { motion: SWAY }),
      kit.sphere(0.24, [0.0, TRUNK_TOP + 0.55, 0.0], 'lime', { motion: SWAY }),
    ];
    // fairy lights wound round the crown (still: the crown sways, so they sit on the trunk and low branches)
    const cols = ['sunYellow', 'pink', 'lime', 'orange'] as const;
    for (let i = 0; i < 8; i++) {
      const a = i * 0.8;
      parts.push(kit.sphere(0.04, [0.4 * Math.cos(a) * (i % 2 ? 0.8 : 1), TRUNK_TOP + 0.12 + (i % 3) * 0.14, 0.4 * Math.sin(a) * (i % 2 ? 0.8 : 1)], cols[i % 4], { detail: 0, glow: true, light: 'breathe', motion: SWAY }));
    }
    // slots of the grate: pale bars across the frame
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([GRATE.w - 0.08, 0.012, 0.04], [0, GRATE.h + 0.006, s * 0.34], 'stoneDark'),
        kit.box([0.04, 0.012, GRATE.w - 0.08], [s * 0.34, GRATE.h + 0.006, 0], 'stoneDark'),
      );
    }
    return kit.finish(parts);
  },
};

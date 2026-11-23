import type { ItemModel } from '../../../models/contract';
import type { MotionOpts } from '../../../models/motion';

// The crown sways about the top of the trunk; every leaf ball shares the pivot so they bend together.
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, 0.65, 0], amount: 0.06 };

/** ต้นไม้: a round cartoon tree, brown trunk and three overlapping leaf balls. */
export const item: ItemModel = {
  id: 'tree',
  name: 'ต้นไม้',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => kit.finish([
    kit.cylinder(0.08, 0.12, 0.7, [0, 0.35, 0], 'wood', { segments: 7 }),
    kit.sphere(0.29, [-0.15, 0.9, -0.12], 'leafDark', { motion: SWAY }),
    kit.sphere(0.41, [0.03, 1.07, 0.04], 'leaf', { motion: SWAY }),
    kit.sphere(0.3, [0.1, 1.4, 0.1], 'leaf', { motion: SWAY }),
  ]),
};

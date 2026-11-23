import type { ItemModel } from '../../../models/contract';
import type { MotionOpts } from '../../../models/motion';

// A broad, shady tree: a sturdy trunk and a wide round dark-green crown. The crown sways about the top of the trunk.
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, 0.7, 0], amount: 0.05 };

/** ต้นไม้ร่มใหญ่: a broad shady tree with a round dark-green crown. */
export const item: ItemModel = {
  id: 'shade-tree',
  name: 'ต้นไม้ร่มใหญ่',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => kit.finish([
    kit.cylinder(0.1, 0.16, 0.78, [0, 0.39, 0], 'wood', { segments: 8 }),
    kit.cone(0.2, 0.12, [0, 0.06, 0], 'woodDark', { segments: 8 }), // root flare
    kit.sphere(0.3, [-0.17, 0.98, 0.1], 'leafDark', { motion: SWAY }),
    kit.sphere(0.3, [0.14, 0.96, -0.15], 'leafDark', { motion: SWAY }),
    kit.sphere(0.32, [0.12, 1.0, 0.16], 'leafDark', { motion: SWAY }),
    kit.sphere(0.4, [-0.02, 1.2, 0], 'leafDark', { motion: SWAY }),
    kit.sphere(0.24, [0.16, 1.4, 0.04], 'leaf', { motion: SWAY }),
    kit.sphere(0.2, [-0.2, 1.36, -0.08], 'leaf', { motion: SWAY }),
  ]),
};

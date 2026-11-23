import type { ItemModel } from '../../../models/contract';
import type { MotionOpts } from '../../../models/motion';
import { rod } from '../../../models/parts';

// A savanna acacia: a thin leaning trunk forking into branches under a flat, wide umbrella crown. The
// crown sways about the fork.
const FORK_Y = 0.85;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0.04, FORK_Y, 0], amount: 0.07 };

/** ต้นอะคาเซีย: a savanna tree with a flat, wide umbrella crown on a thin trunk. */
export const item: ItemModel = {
  id: 'acacia-tree',
  name: 'ต้นอะคาเซีย',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => kit.finish([
    rod(kit, [-0.02, 0.012, 0], [0.04, FORK_Y, 0], 0.05, 'wood', { segments: 7 }),
    kit.cylinder(0.07, 0.1, 0.12, [-0.02, 0.06, 0], 'woodDark', { segments: 7 }),
    rod(kit, [0.04, FORK_Y - 0.05, 0], [0.26, FORK_Y + 0.28, 0.1], 0.03, 'wood', { segments: 5 }),
    rod(kit, [0.04, FORK_Y - 0.05, 0], [-0.2, FORK_Y + 0.25, -0.1], 0.03, 'wood', { segments: 5 }),
    kit.sphere(0.45, [0.04, FORK_Y + 0.4, 0], 'leaf', { scale: [1, 0.3, 1], motion: SWAY }),
    kit.sphere(0.28, [0.14, FORK_Y + 0.52, 0.06], 'lime', { scale: [1, 0.3, 1], motion: SWAY }),
    kit.sphere(0.26, [-0.16, FORK_Y + 0.5, -0.06], 'leafDark', { scale: [1, 0.32, 1], motion: SWAY }),
  ]),
};

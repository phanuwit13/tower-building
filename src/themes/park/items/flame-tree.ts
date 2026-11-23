import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import type { MotionOpts } from '../../../models/motion';
import { rod } from '../../../models/parts';

// A wide umbrella crown of red-orange flowers; the whole crown sways about the top of the trunk.
const TRUNK_TOP = 1.5;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, TRUNK_TOP, 0], amount: 0.04 };

// [x, y, z, radius, flatten, colour]: keeps |x| + r under 0.9 so the sway stays in the 2x2 footprint
const CROWN: Array<[number, number, number, number, number, PaletteColor]> = [
  [0, 2.1, 0, 0.72, 0.6, 'red'],
  [0.42, 2.0, 0.3, 0.44, 0.6, 'orange'],
  [-0.42, 2.02, 0.32, 0.42, 0.6, 'red'],
  [0.15, 2.0, -0.5, 0.4, 0.6, 'orange'],
  [-0.48, 1.98, -0.3, 0.38, 0.6, 'redDark'],
  [0.05, 2.5, 0.05, 0.42, 0.8, 'red'],
  [0.3, 2.42, -0.2, 0.3, 0.8, 'orange'],
  [-0.28, 2.4, 0.2, 0.28, 0.8, 'orange'],
  [0.5, 1.85, -0.3, 0.3, 0.7, 'red'],
];

/** ต้นหางนกยูง: a big shade tree covered in red-orange flowers. */
export const item: ItemModel = {
  id: 'flame-tree',
  name: 'ต้นหางนกยูง',
  category: 'nature',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.1, 0.2, TRUNK_TOP, [0, TRUNK_TOP / 2, 0], 'wood', { segments: 8 }),
      rod(kit, [0, 1.25, 0], [0.5, 1.9, 0.2], 0.05, 'wood'),
      rod(kit, [0, 1.25, 0], [-0.45, 1.85, 0.25], 0.05, 'wood'),
      rod(kit, [0, 1.3, 0], [0.1, 1.85, -0.45], 0.05, 'wood'),
    ];
    for (const [x, y, z, r, flat, colour] of CROWN) {
      parts.push(kit.sphere(r, [x, y, z], colour, { detail: 2, scale: [1, flat, 1], motion: SWAY }));
    }
    // a few green leaflets and yellow-orange blossoms on top
    parts.push(
      kit.sphere(0.2, [0.2, 1.78, 0.5], 'leaf', { detail: 0, scale: [1, 0.5, 1], motion: SWAY }),
      kit.sphere(0.18, [-0.55, 1.8, -0.1], 'leafDark', { detail: 0, scale: [1, 0.5, 1], motion: SWAY }),
      kit.sphere(0.07, [0.1, 2.72, 0.2], 'sunYellow', { detail: 0, motion: SWAY }),
      kit.sphere(0.07, [-0.4, 2.45, 0.5], 'sunYellow', { detail: 0, motion: SWAY }),
      kit.sphere(0.07, [0.62, 2.2, 0.2], 'sunYellow', { detail: 0, motion: SWAY }),
    );
    // a few fallen petals on the ground
    for (const [x, z] of [[0.5, 0.5], [-0.4, 0.55], [0.35, -0.45], [-0.55, -0.2]] as const) {
      parts.push(kit.cylinder(0.05, 0.05, 0.02, [x, 0.01, z], 'orange', { segments: 6 }));
    }
    return kit.finish(parts);
  },
};

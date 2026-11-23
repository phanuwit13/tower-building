import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import type { MotionOpts } from '../../../models/motion';
import { rod } from '../../../models/parts';

// 1x1. A cherry tree in full bloom. The crown is a cloud of pink balls on ONE sway pivot at the top of the trunk.
const TRUNK_TOP = 0.85;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, TRUNK_TOP, 0], amount: 0.05 };

/** [x, y, z, radius, colour, detail]: |x| + r stays under 0.42 so the sway stays inside the 1x1 footprint. */
const BLOSSOMS: Array<[number, number, number, number, PaletteColor, 0 | 1]> = [
  [0, 1.45, 0, 0.3, 'pink', 1],
  [0.17, 1.15, 0.1, 0.24, 'pink', 1],
  [-0.17, 1.2, -0.08, 0.24, 'pink', 1],
  [-0.08, 1.15, 0.18, 0.2, 'white', 0],
  [0.06, 1.75, -0.04, 0.2, 'pink', 1],
  [0.15, 1.5, -0.15, 0.17, 'white', 0],
  [-0.16, 1.55, 0.1, 0.2, 'pink', 0],
  [0.14, 1.52, 0.16, 0.16, 'pink', 0],
];

/** ต้นซากุระ: a cherry tree in full pink bloom, with petals on the ground. */
export const item: ItemModel = {
  id: 'sakura-tree',
  name: 'ต้นซากุระ',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.07, 0.12, TRUNK_TOP, [0, TRUNK_TOP / 2, 0], 'bark', { segments: 7 }),
      rod(kit, [0, 0.6, 0], [0.13, 0.84, 0.06], 0.035, 'bark', { segments: 5 }),
      rod(kit, [0, 0.6, 0], [-0.12, 0.84, -0.05], 0.035, 'bark', { segments: 5 }),
    ];
    for (const [x, y, z, r, colour, detail] of BLOSSOMS) parts.push(kit.sphere(r, [x, y, z], colour, { detail, motion: SWAY }));
    for (const [x, z] of [[0.3, 0.25], [-0.3, 0.3], [0.2, -0.32], [-0.26, -0.22], [0.36, -0.05]] as const) {
      parts.push(kit.cylinder(0.045, 0.045, 0.02, [x, 0.01, z], 'pink', { segments: 6 }));
    }
    return kit.finish(parts);
  },
};

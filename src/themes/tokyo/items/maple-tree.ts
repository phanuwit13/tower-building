import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import type { MotionOpts } from '../../../models/motion';
import { rod } from '../../../models/parts';

// 1x1. A Japanese maple: slim trunk, a layered crown of bright red leaves on ONE sway pivot at the top of the trunk.
const TRUNK_TOP = 0.8;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, TRUNK_TOP, 0], amount: 0.05 };

/** [x, y, z, radius, colour, detail]: |x| + r stays under 0.42. */
const LEAVES: Array<[number, number, number, number, PaletteColor, 0 | 1]> = [
  [0, 1.3, 0, 0.3, 'red', 1],
  [0.18, 1.05, 0.08, 0.22, 'red', 1],
  [-0.18, 1.08, -0.06, 0.22, 'redDark', 1],
  [-0.06, 1.0, 0.2, 0.18, 'red', 0],
  [0.05, 1.62, -0.03, 0.2, 'red', 1],
  [-0.15, 1.45, 0.12, 0.17, 'orange', 0],
  [0.15, 1.42, -0.14, 0.17, 'redDark', 0],
  [0.12, 1.4, 0.17, 0.14, 'orange', 0],
];

/** ต้นเมเปิลแดง: a Japanese maple with bright red leaves and a few fallen leaves. */
export const item: ItemModel = {
  id: 'maple-tree',
  name: 'ต้นเมเปิลแดง',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.05, 0.1, TRUNK_TOP, [0, TRUNK_TOP / 2, 0], 'bark', { segments: 7 }),
      rod(kit, [0, 0.55, 0], [0.14, 0.79, 0.05], 0.03, 'bark', { segments: 5 }),
      rod(kit, [0, 0.55, 0], [-0.13, 0.79, -0.05], 0.03, 'bark', { segments: 5 }),
    ];
    for (const [x, y, z, r, colour, detail] of LEAVES) parts.push(kit.sphere(r, [x, y, z], colour, { detail, motion: SWAY }));
    const fallen: Array<[number, number, PaletteColor]> = [[0.3, 0.26, 'red'], [-0.3, 0.28, 'orange'], [0.22, -0.32, 'redDark'], [-0.26, -0.2, 'red']];
    for (const [x, z, c] of fallen) parts.push(kit.cylinder(0.04, 0.04, 0.02, [x, 0.01, z], c, { segments: 5 }));
    return kit.finish(parts);
  },
};

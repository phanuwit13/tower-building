import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A round mango tree (1×1): a short trunk, a rounded crown that sways from the top of the trunk, and yellow,
// orange and green mangoes hanging from the crown.
const TRUNK_TOP = 0.72;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, TRUNK_TOP, 0], amount: 0.07 };
/** Crown puffs: [x, y, z, radius, colour]. */
const CROWN: Array<[number, number, number, number, PaletteColor]> = [
  [0, 1.1, 0, 0.36, 'leaf'],
  [0.12, 1.2, 0.1, 0.3, 'leafDark'],
  [-0.14, 1.0, 0.1, 0.27, 'leafDark'],
  [0.05, 1.0, -0.15, 0.27, 'leaf'],
  [0, 1.48, 0, 0.22, 'lime'],
];
/** Mangoes hang on the outside of the crown, most of them on the camera side (+x+z): [azimuth, y, colour]. */
const MANGOES: Array<[number, number, PaletteColor]> = [
  [-0.9, 0.95, 'sunYellow'], [-0.5, 0.88, 'orange'], [-0.1, 0.96, 'sunYellow'], [-0.7, 1.18, 'orange'],
  [-0.3, 1.2, 'sunYellow'], [0.3, 0.95, 'sunYellow'], [0.1, 1.15, 'orange'], [-1.3, 1.05, 'sunYellow'],
  [0.7, 1.05, 'orange'], [-1.6, 0.9, 'lime'], [1.4, 1.0, 'sunYellow'], [-2.2, 1.0, 'orange'],
];
const MANGO_R = 0.09;
const MANGO_RING = 0.37; // how far from the trunk axis the mangoes hang
/** ต้นมะม่วง: a round mango tree with yellow mangoes. */
export const item: ItemModel = {
  id: 'mango-tree',
  name: 'ต้นมะม่วง',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.1, 0.16, 0.18, [0, 0.09, 0], 'woodDark', { segments: 8 }),
      kit.cylinder(0.07, 0.1, TRUNK_TOP - 0.1, [0, 0.1 + (TRUNK_TOP - 0.1) / 2, 0], 'wood', { segments: 8 }),
    ];
    for (const [x, y, z, r, color] of CROWN) parts.push(kit.sphere(r, [x, y, z], color, { motion: SWAY }));
    for (const [a, y, color] of MANGOES) parts.push(kit.sphere(MANGO_R, [MANGO_RING * Math.cos(a), y, -MANGO_RING * Math.sin(a)], color, { detail: 0, scale: [1, 1.25, 1], motion: SWAY }));
    return kit.finish(parts);
  },
};

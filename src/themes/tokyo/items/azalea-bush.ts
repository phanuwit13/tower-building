import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import type { MotionOpts } from '../../../models/motion';

// 1x1. A round azalea bush covered in pink flowers; one sway pivot at the soil line, a small lean.
const SOIL_H = 0.05;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, SOIL_H, 0], amount: 0.1 };

/** [x, y, z, radius, colour]: the bush stays inside |x|,|z| < 0.42 even when it leans. */
const MASS: Array<[number, number, number, number, PaletteColor]> = [
  [0, 0.4, 0, 0.3, 'leafDark'],
  [0.12, 0.3, 0.14, 0.2, 'leafDark'],
  [-0.14, 0.3, -0.1, 0.2, 'leafDark'],
];
/** Flower clusters over the mass. */
const FLOWERS: Array<[number, number, number, number, PaletteColor]> = [
  [0, 0.68, 0, 0.14, 'pink'],
  [0.17, 0.56, 0.02, 0.13, 'pink'],
  [-0.17, 0.54, 0.05, 0.13, 'pink'],
  [0.04, 0.54, 0.2, 0.13, 'pink'],
  [-0.06, 0.52, -0.2, 0.13, 'pink'],
  [0.2, 0.4, 0.2, 0.11, 'pink'],
  [-0.22, 0.38, -0.15, 0.11, 'pink'],
  [0.22, 0.38, -0.18, 0.11, 'white'],
  [-0.2, 0.4, 0.2, 0.11, 'white'],
  [0.08, 0.62, -0.1, 0.1, 'white'],
];

/** พุ่มอาซาเลีย: a round azalea bush covered in pink flowers. */
export const item: ItemModel = {
  id: 'azalea-bush',
  name: 'พุ่มอาซาเลีย',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.6, SOIL_H, 0.6], [0, SOIL_H / 2, 0], 'bark')];
    for (const [x, y, z, r, c] of MASS) parts.push(kit.sphere(r, [x, y, z], c, { motion: SWAY }));
    for (const [x, y, z, r, c] of FLOWERS) parts.push(kit.sphere(r, [x, y, z], c, { detail: 0, motion: SWAY }));
    for (const [x, z] of [[0.36, 0.3], [-0.34, 0.34], [0.3, -0.36]] as const) {
      parts.push(kit.cylinder(0.04, 0.04, 0.02, [x, 0.01, z], 'pink', { segments: 6 }));
    }
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import type { MotionOpts } from '../../../models/motion';

// 2x2. Three cherry trees on a grass patch with fallen petals. Each tree sways on its own pivot at its trunk top.
const TRUNK_TOP = 0.8;
const GRASS_H = 0.03;
/** Tree base positions and a size factor. Crown reach (0.34 * size) plus the sway lean stays well inside +-1. */
const TREES: Array<{ x: number; z: number; s: number }> = [
  { x: 0.4, z: 0.38, s: 1 },
  { x: -0.45, z: -0.25, s: 1.1 },
  { x: 0.35, z: -0.55, s: 0.9 },
];
/** Crown balls relative to the trunk top: [dx, dy, dz, radius, colour, detail]. */
const CROWN: Array<[number, number, number, number, PaletteColor, 0 | 1]> = [
  [0, 0.55, 0, 0.3, 'pink', 1],
  [0.17, 0.28, 0.08, 0.22, 'pink', 1],
  [-0.17, 0.3, -0.06, 0.22, 'pink', 1],
  [-0.06, 0.26, 0.18, 0.17, 'white', 0],
  [0.06, 0.85, -0.04, 0.18, 'pink', 0],
  [0.14, 0.6, -0.15, 0.15, 'white', 0],
  [-0.15, 0.62, 0.1, 0.17, 'pink', 0],
];
const PETALS: Array<[number, number]> = [
  [0.85, 0.7], [0.0, 0.7], [-0.8, 0.5], [-0.15, -0.65], [0.85, -0.2], [-0.2, 0.2], [0.05, -0.1], [-0.85, -0.8], [0.8, -0.9], [0.15, 0.95],
];

/** สวนซากุระ: three cherry trees in pink bloom with petals on the grass. */
export const item: ItemModel = {
  id: 'sakura-grove',
  name: 'สวนซากุระ',
  category: 'nature',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.96, GRASS_H, 1.96], [0, GRASS_H / 2, 0], 'lime')];
    for (const { x, z, s } of TREES) {
      const top = TRUNK_TOP * s;
      const sway: MotionOpts = { kind: 'sway', pivot: [x, top, z], amount: 0.05 };
      parts.push(kit.cylinder(0.06 * s, 0.11 * s, top, [x, top / 2, z], 'bark', { segments: 7 }));
      for (const [dx, dy, dz, r, c, detail] of CROWN) {
        parts.push(kit.sphere(r * s, [x + dx * s, top + dy * s, z + dz * s], c, { detail, motion: sway }));
      }
    }
    for (const [x, z] of PETALS) parts.push(kit.cylinder(0.05, 0.05, 0.015, [x, GRASS_H + 0.0075, z], 'pink', { segments: 6 }));
    return kit.finish(parts);
  },
};

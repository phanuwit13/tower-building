import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import type { MotionOpts } from '../../../models/motion';
import { rod } from '../../../models/parts';

const TRUNK_TOP = 0.9;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, TRUNK_TOP, 0], amount: 0.06 };

// [x, y, z, radius, colour]: |x| + r stays under 0.42 so the sway stays in the 1x1 footprint
const BLOSSOMS: Array<[number, number, number, number, PaletteColor]> = [
  [0, 1.5, 0, 0.3, 'pink'],
  [0.14, 1.2, 0.12, 0.24, 'pink'],
  [-0.14, 1.25, -0.1, 0.24, 'pink'],
  [-0.1, 1.2, 0.15, 0.2, 'white'],
  [0.08, 1.78, -0.04, 0.2, 'pink'],
  [0.15, 1.5, -0.14, 0.18, 'white'],
  [-0.16, 1.55, 0.1, 0.2, 'pink'],
];

/** ต้นชมพูพันธุ์ทิพย์: a tree covered in pink blossoms. */
export const item: ItemModel = {
  id: 'pink-trumpet-tree',
  name: 'ต้นชมพูพันธุ์ทิพย์',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.07, 0.11, TRUNK_TOP, [0, TRUNK_TOP / 2, 0], 'woodDark', { segments: 7 }),
      rod(kit, [0, 0.75, 0], [0.14, 1.15, 0.08], 0.04, 'woodDark', { segments: 5 }),
      rod(kit, [0, 0.75, 0], [-0.12, 1.1, -0.06], 0.04, 'woodDark', { segments: 5 }),
    ];
    for (const [x, y, z, r, colour] of BLOSSOMS) parts.push(kit.sphere(r, [x, y, z], colour, { motion: SWAY }));
    parts.push(
      kit.sphere(0.12, [0.2, 1.05, -0.1], 'leaf', { detail: 0, motion: SWAY }),
      kit.sphere(0.1, [-0.22, 1.0, 0.04], 'leafDark', { detail: 0, motion: SWAY }),
    );
    // fallen petals
    for (const [x, z] of [[0.3, 0.25], [-0.3, 0.3], [0.2, -0.32]] as const) {
      parts.push(kit.cylinder(0.04, 0.04, 0.02, [x, 0.01, z], 'pink', { segments: 6 }));
    }
    return kit.finish(parts);
  },
};

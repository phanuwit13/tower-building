import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// 1 wide (x) by 2 long (z). A neatly clipped hedge with small flowers along its foot.
const HEDGE = { w: 0.5, d: 1.9, h: 0.46 };
const HX = -0.12; // hedge centre x
const FLOWERS: Array<[number, number, PaletteColor]> = [
  [0.3, -0.75, 'pink'], [0.32, -0.45, 'sunYellow'], [0.3, -0.15, 'white'], [0.32, 0.15, 'pink'], [0.3, 0.45, 'sunYellow'], [0.32, 0.75, 'white'],
  [-0.4, -0.5, 'sunYellow'], [-0.4, 0.0, 'pink'], [-0.4, 0.55, 'white'],
];

/** แนวพุ่มไม้ตัด: a neatly trimmed hedge with small flowers at its foot. */
export const item: ItemModel = {
  id: 'hedge-row',
  name: 'แนวพุ่มไม้ตัด',
  category: 'nature',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.96, 0.04, 1.96], [0, 0.02, 0], 'lime'),
      kit.box([HEDGE.w, 0.1, HEDGE.d], [HX, 0.09, 0], 'bark'),
      kit.box([HEDGE.w, HEDGE.h, HEDGE.d - 0.06], [HX, 0.04 + HEDGE.h / 2, 0], 'leafDark'),
      kit.box([HEDGE.w - 0.06, 0.06, HEDGE.d - 0.12], [HX, 0.04 + HEDGE.h + 0.02, 0], 'leaf'),
    ];
    // clipped bumps along the top
    for (const z of [-0.65, 0, 0.65]) {
      parts.push(kit.sphere(0.2, [HX, 0.04 + HEDGE.h + 0.06, z], 'leaf', { detail: 0, scale: [1, 0.5, 1.6] }));
    }
    for (const [x, z, c] of FLOWERS) {
      parts.push(
        kit.sphere(0.06, [x, 0.08, z], 'leaf', { detail: 0, scale: [1, 0.8, 1] }),
        kit.sphere(0.05, [x, 0.15, z], c, { detail: 0 }),
      );
    }
    return kit.finish(parts);
  },
};

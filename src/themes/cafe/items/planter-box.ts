import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A long wooden planter (long side along z) with herbs, and flowers on tall stems.
const BOX = { w: 0.8, l: 1.8, h: 0.36 };
const SOIL_Y = BOX.h - 0.02;
const HERBS: { z: number; x: number; r: number; c: PaletteColor }[] = [
  { z: -0.78, x: -0.12, r: 0.12, c: 'leaf' },
  { z: -0.5, x: 0.15, r: 0.1, c: 'lime' },
  { z: -0.28, x: -0.15, r: 0.13, c: 'leafDark' },
  { z: 0.05, x: 0.12, r: 0.11, c: 'mint' },
  { z: 0.3, x: -0.12, r: 0.12, c: 'lime' },
  { z: 0.55, x: 0.14, r: 0.1, c: 'leaf' },
  { z: 0.78, x: -0.1, r: 0.13, c: 'leafDark' },
];
const FLOWERS: { z: number; x: number; h: number; c: PaletteColor }[] = [
  { z: -0.65, x: 0.17, h: 0.3, c: 'pink' },
  { z: -0.05, x: -0.17, h: 0.36, c: 'sunYellow' },
  { z: 0.2, x: 0.17, h: 0.28, c: 'red' },
  { z: 0.65, x: 0.0, h: 0.34, c: 'purple' },
  { z: -0.4, x: -0.2, h: 0.26, c: 'white' },
];

/** กระบะต้นไม้ยาว: a long wooden planter with herbs and flowers. */
export const item: ItemModel = {
  id: 'planter-box',
  name: 'กระบะต้นไม้ยาว',
  category: 'nature',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BOX.w, BOX.h - 0.04, BOX.l], [0, (BOX.h - 0.04) / 2 + 0.04, 0], 'wood'),
      kit.box([BOX.w - 0.1, 0.04, BOX.l - 0.1], [0, 0.02, 0], 'woodDark'), // base
      kit.box([BOX.w + 0.04, 0.045, BOX.l + 0.04], [0, BOX.h - 0.0225, 0], 'woodDark'), // rim
      kit.box([BOX.w - 0.08, 0.02, BOX.l - 0.08], [0, SOIL_Y + 0.0, 0], 'bark'),
      kit.box([0.03, 0.2, BOX.l - 0.1], [BOX.w / 2 + 0.0, 0.2, 0], 'woodDark'), // plank stripes on the front face
    ];
    for (const z of [-0.45, 0, 0.45]) parts.push(kit.box([0.03, 0.2, 0.05], [-BOX.w / 2, 0.2, z], 'woodDark'));
    for (const h of HERBS) parts.push(kit.sphere(h.r, [h.x, BOX.h + h.r * 0.5, h.z], h.c, { scale: [1, 0.85, 1] }));
    for (const f of FLOWERS) {
      parts.push(
        kit.cylinder(0.01, 0.01, f.h, [f.x, BOX.h + f.h / 2 - 0.02, f.z], 'leafDark', { segments: 4 }),
        kit.sphere(0.055, [f.x, BOX.h + f.h, f.z], f.c, { detail: 0 }),
        kit.sphere(0.025, [f.x, BOX.h + f.h + 0.03, f.z], f.c === 'sunYellow' ? 'orange' : 'sunYellow', { detail: 0 }),
      );
    }
    return kit.finish(parts);
  },
};

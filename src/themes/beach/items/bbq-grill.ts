import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A charcoal grill on legs at the +z end (glowing coals, a grate and four skewers) and a small table with a plate at the -z end.
const GRILL = { z: 0.55, w: 0.6, h: 0.22, legH: 0.38 };
const GRATE_Y = GRILL.legH + GRILL.h + 0.04;
const TABLE = { z: -0.45, w: 0.62, d: 0.55, topY: 0.45 };
const FOOD: PaletteColor[] = ['red', 'leaf', 'sunYellow'];

/** เตาบาร์บีคิว: barbecue grill with skewers and glowing coals, a small table. */
export const item: ItemModel = {
  id: 'bbq-grill',
  name: 'เตาบาร์บีคิว',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    // grill: legs, a charcoal bowl, glowing coals (breathe), a chrome grate, a handle
    for (const sx of [1, -1]) {
      for (const sz of [1, -1]) {
        parts.push(kit.box([0.05, GRILL.legH, 0.05], [sx * 0.24, GRILL.legH / 2, GRILL.z + sz * 0.24], 'charcoal'));
      }
    }
    parts.push(
      kit.box([GRILL.w, GRILL.h, GRILL.w], [0, GRILL.legH + GRILL.h / 2, GRILL.z], 'charcoal'),
      kit.box([GRILL.w - 0.1, 0.03, GRILL.w - 0.1], [0, GRILL.legH + GRILL.h + 0.005, GRILL.z], 'redDark', { glow: 'orange', light: 'breathe' }),
      kit.box([0.1, 0.04, 0.2], [GRILL.w / 2 + 0.05, GRILL.legH + GRILL.h - 0.03, GRILL.z], 'woodDark'),
    );
    for (const sx of [-0.22, -0.07, 0.07, 0.22]) {
      parts.push(kit.box([0.016, 0.016, GRILL.w - 0.06], [sx, GRATE_Y - 0.02, GRILL.z], 'chrome'));
    }
    // skewers lie along x across the grate, with chunks of food
    [-0.18, -0.06, 0.06, 0.18].forEach((dz, k) => {
      parts.push(kit.box([GRILL.w - 0.04, 0.016, 0.016], [0, GRATE_Y, GRILL.z + dz], 'wood'));
      for (let i = 0; i < 3; i++) {
        parts.push(kit.box([0.09, 0.07, 0.08], [-0.15 + 0.15 * i, GRATE_Y + 0.035, GRILL.z + dz], FOOD[(i + k) % 3]));
      }
    });
    // table with a plate and a few skewers waiting on it
    for (const sx of [1, -1]) {
      for (const sz of [1, -1]) {
        parts.push(kit.box([0.05, TABLE.topY, 0.05], [sx * (TABLE.w / 2 - 0.05), TABLE.topY / 2, TABLE.z + sz * (TABLE.d / 2 - 0.05)], 'woodDark'));
      }
    }
    parts.push(
      kit.box([TABLE.w, 0.05, TABLE.d], [0, TABLE.topY + 0.025, TABLE.z], 'wood'),
      kit.cylinder(0.17, 0.15, 0.03, [0, TABLE.topY + 0.065, TABLE.z], 'white', { segments: 10 }),
      kit.box([0.016, 0.016, 0.24], [-0.05, TABLE.topY + 0.088, TABLE.z], 'wood'),
      kit.box([0.016, 0.016, 0.24], [0.05, TABLE.topY + 0.088, TABLE.z], 'wood'),
    );
    for (let i = 0; i < 3; i++) {
      parts.push(
        kit.box([0.06, 0.05, 0.06], [-0.05, TABLE.topY + 0.114, TABLE.z - 0.07 + 0.07 * i], FOOD[i]),
        kit.box([0.06, 0.05, 0.06], [0.05, TABLE.topY + 0.114, TABLE.z - 0.07 + 0.07 * i], FOOD[(i + 1) % 3]),
      );
    }
    return kit.finish(parts);
  },
};

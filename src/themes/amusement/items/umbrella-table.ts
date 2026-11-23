import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

const FOOT = { r: 0.2, h: 0.04 };
const POLE = { r: 0.035, top: 1.08 };
const TABLE = { r: 0.3, y: 0.5, t: 0.04 };
const CANOPY = { r: 0.47, h: 0.24, y: 0.86 }; // base of the umbrella
const STOOL = { z: 0.38, r: 0.11, top: 0.28, t: 0.05 };
const STOOL_COLORS: PaletteColor[] = ['blue', 'orange'];

/** โต๊ะร่ม: a round table under a striped umbrella with two stools. */
export const item: ItemModel = {
  id: 'umbrella-table',
  name: 'โต๊ะร่ม',
  category: 'seating',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(FOOT.r, FOOT.r, FOOT.h, [0, FOOT.h / 2, 0], 'stone', { segments: 12 }),
      kit.cylinder(POLE.r, POLE.r, POLE.top, [0, POLE.top / 2, 0], 'white', { segments: 8 }),
      kit.cylinder(TABLE.r, TABLE.r, TABLE.t, [0, TABLE.y, 0], 'sunYellow', { segments: 16 }),
      // striped canopy: two six-sided cones turned half a facet apart give twelve stripes
      kit.cone(CANOPY.r, CANOPY.h, [0, CANOPY.y + CANOPY.h / 2, 0], 'red', { segments: 6 }),
      kit.cone(CANOPY.r, CANOPY.h, [0, CANOPY.y + CANOPY.h / 2, 0], 'white', { segments: 6, rotate: [0, Math.PI / 6, 0] }),
      kit.sphere(0.04, [0, CANOPY.y + CANOPY.h + 0.02, 0], 'sunYellow', { detail: 0 }),
      // a sundae on the table
      kit.cylinder(0.05, 0.03, 0.07, [0.12, TABLE.y + TABLE.t / 2 + 0.035, 0.08], 'glassBlue', { segments: 8 }),
      kit.sphere(0.045, [0.12, TABLE.y + TABLE.t / 2 + 0.09, 0.08], 'pink', { detail: 0 }),
    ];
    for (const [k, s] of [-1, 1].entries()) {
      parts.push(
        kit.cylinder(STOOL.r, STOOL.r, STOOL.t, [0, STOOL.top - STOOL.t / 2, s * STOOL.z], STOOL_COLORS[k], { segments: 10 }),
        kit.cylinder(0.03, 0.04, STOOL.top - STOOL.t, [0, (STOOL.top - STOOL.t) / 2, s * STOOL.z], 'stoneDark', { segments: 6 }),
      );
    }
    return kit.finish(parts);
  },
};

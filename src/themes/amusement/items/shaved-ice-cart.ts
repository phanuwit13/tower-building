import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod, wallPanel } from '../../../models/parts';

// A small cart (long side along z) with a striped hexagonal canopy on four posts, a row of syrup bottles,
// a block of ice and two cups of shaved ice on the counter.
const BODY = { w: 0.6, h: 0.36, l: 0.8, y0: 0.14 };
const COUNTER = { w: 0.66, h: 0.04, l: 0.86 };
const TOP = BODY.y0 + BODY.h + COUNTER.h; // 0.54
const CANOPY = { y: 1.45, r: 0.47, h: 0.3 };
const BOTTLES: Array<[number, PaletteColor]> = [[-0.3, 'red'], [-0.1, 'sunYellow'], [0.1, 'leaf'], [0.3, 'purple']];

/** รถเข็นน้ำแข็งใส: a shaved-ice cart with a striped canopy and colourful syrup bottles. */
export const item: ItemModel = {
  id: 'shaved-ice-cart',
  name: 'รถเข็นน้ำแข็งใส',
  category: 'food',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BODY.w, BODY.h, BODY.l], [0, BODY.y0 + BODY.h / 2, 0], 'skyBlue'),
      kit.box([COUNTER.w, COUNTER.h, COUNTER.l], [0, TOP - COUNTER.h / 2, 0], 'white'),
      ...wallPanel(kit, { at: [BODY.w / 2, BODY.y0 + BODY.h / 2, 0], facing: 'x+', w: 0.6, h: 0.2, depth: 0.03, color: 'sunYellow' }),
      ...wallPanel(kit, { at: [BODY.w / 2, BODY.y0 + BODY.h / 2, -0.2], facing: 'x+', w: 0.1, h: 0.1, depth: 0.04, color: 'red' }),
      ...wallPanel(kit, { at: [BODY.w / 2, BODY.y0 + BODY.h / 2, 0], facing: 'x+', w: 0.1, h: 0.1, depth: 0.04, color: 'leaf' }),
      ...wallPanel(kit, { at: [BODY.w / 2, BODY.y0 + BODY.h / 2, 0.2], facing: 'x+', w: 0.1, h: 0.1, depth: 0.04, color: 'blue' }),
      // ice block and two cups with a heap of shaved ice
      kit.box([0.2, 0.18, 0.26], [-0.15, TOP + 0.09, 0.2], 'glassBlue'),
    ];
    for (const [z, color] of [[-0.3, 'pink'], [-0.1, 'sunYellow']] as const) {
      parts.push(
        kit.cylinder(0.08, 0.05, 0.1, [-0.15, TOP + 0.05, z], 'white', { segments: 8 }),
        kit.dome(0.09, [-0.15, TOP + 0.1, z], color, { segments: 8 }),
      );
    }
    for (const x of [-0.33, 0.33]) parts.push(kit.cylinder(0.14, 0.14, 0.06, [x, 0.14, 0], 'charcoal', { segments: 12, rotate: [0, 0, Math.PI / 2] }));
    for (const z of [-0.37, 0.37]) parts.push(kit.box([0.5, 0.14, 0.06], [0, 0.07, z], 'charcoal'));
    for (const [z, color] of BOTTLES) {
      parts.push(
        kit.cylinder(0.045, 0.045, 0.2, [0.2, TOP + 0.1, z], color, { segments: 6 }),
        kit.cylinder(0.02, 0.035, 0.08, [0.2, TOP + 0.24, z], color, { segments: 6 }),
        kit.cylinder(0.025, 0.025, 0.03, [0.2, TOP + 0.295, z], 'white', { segments: 6 }),
      );
    }
    for (const x of [-0.2, 0.2]) {
      for (const z of [-0.3, 0.3]) parts.push(rod(kit, [x, TOP, z], [x, CANOPY.y, z], 0.025, 'woodDark', { segments: 4 }));
    }
    parts.push(
      kit.cone(CANOPY.r, CANOPY.h, [0, CANOPY.y + CANOPY.h / 2, 0], 'red', { segments: 6 }),
      kit.cone(CANOPY.r, CANOPY.h, [0, CANOPY.y + CANOPY.h / 2, 0], 'white', { segments: 6, rotate: [0, Math.PI / 6, 0] }),
      kit.sphere(0.05, [0, CANOPY.y + CANOPY.h + 0.03, 0], 'sunYellow', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};

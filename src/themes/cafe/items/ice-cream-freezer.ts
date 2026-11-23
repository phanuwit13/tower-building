import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A scoop-ice-cream freezer (2×2): a mint cabinet with a lit glass front, an open top showing 4×4
// colourful tubs, and a holder at the back with a stack of cones topped with scoops.
const BODY = { w: 1.74, h: 0.5, d: 1.84 };
const TOP = 0.62;
const FLAVOURS: PaletteColor[] = ['pink', 'mint', 'sunYellow', 'purple', 'bark', 'orange', 'white', 'lime', 'red', 'skyBlue'];

/** ตู้ไอศกรีมตัก: a scoop freezer with colourful tubs and a cone stack. */
export const item: ItemModel = {
  id: 'ice-cream-freezer',
  name: 'ตู้ไอศกรีมตัก',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit: StyleKit) => {
    const parts: Part[] = [
      kit.box([BODY.w, BODY.h, BODY.d], [0, BODY.h / 2, 0], 'mint'),
      kit.box([BODY.w, 0.04, BODY.d], [0, 0.02, 0], 'teal'),
      // white rim: front, back (wide, carries the cone holder), left, right
      kit.box([0.1, TOP - BODY.h, BODY.d], [BODY.w / 2 - 0.05, (TOP + BODY.h) / 2, 0], 'white'),
      kit.box([0.34, TOP - BODY.h, BODY.d], [-BODY.w / 2 + 0.17, (TOP + BODY.h) / 2, 0], 'white'),
      kit.box([BODY.w - 0.44, TOP - BODY.h, 0.1], [0.05, (TOP + BODY.h) / 2, BODY.d / 2 - 0.05], 'white'),
      kit.box([BODY.w - 0.44, TOP - BODY.h, 0.1], [0.05, (TOP + BODY.h) / 2, -BODY.d / 2 + 0.05], 'white'),
      // lit glass front panel, plus a pink stripe
      kit.box([0.03, 0.3, BODY.d - 0.3], [BODY.w / 2 + 0.015, 0.26, 0], 'glassBlue', { glow: 'windowWarm', light: 'window' }),
      kit.box([0.03, 0.05, BODY.d - 0.3], [BODY.w / 2 + 0.015, 0.45, 0], 'pink'),
      // a sneeze-guard strip of lit glass over the front rim
      kit.box([0.03, 0.14, BODY.d - 0.3], [BODY.w / 2 - 0.02, TOP + 0.09, 0], 'glassBlue', { glow: 'windowWarm', light: 'window' }),
      // cone holder on the back rim
      kit.box([0.26, 0.1, 1.5], [-BODY.w / 2 + 0.17, TOP + 0.05, 0], 'woodDark'),
    ];
    // 4×4 tubs in the open top: white tub with the flavour on top
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const x = -0.38 + i * 0.3;
        const z = -0.57 + j * 0.38;
        parts.push(
          kit.cylinder(0.15, 0.14, 0.07, [x, BODY.h + 0.035, z], 'white', { segments: 8 }),
          kit.cylinder(0.13, 0.13, 0.06, [x, BODY.h + 0.09, z], FLAVOURS[(i * 3 + j * 2) % FLAVOURS.length], { segments: 8 }),
        );
      }
    }
    // cone stack: upside-down wafer cones with scoops, standing in the holder
    for (let k = 0; k < 4; k++) {
      const z = -0.54 + k * 0.36;
      parts.push(
        kit.cone(0.07, 0.24, [-BODY.w / 2 + 0.17, TOP + 0.1 + 0.12, z], 'sand', { segments: 8, rotate: [Math.PI, 0, 0] }),
        kit.sphere(0.085, [-BODY.w / 2 + 0.17, TOP + 0.1 + 0.28, z], FLAVOURS[(k * 3 + 1) % FLAVOURS.length], { detail: 0 }),
      );
    }
    return kit.finish(parts);
  },
};

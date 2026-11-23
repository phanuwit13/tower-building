import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// Three coloured sorting bins in a row (1×2, long side along z, front on +x). Each has a coloured lid and a
// picture on the front: a bottle (blue), a tin can (yellow), an apple (green). No text.
const BIN = { w: 0.5, d: 0.58, h: 0.66 };
const FRONT_X = BIN.w / 2;
const ZS = [-0.65, 0, 0.65];
const BODY: PaletteColor[] = ['blue', 'sunYellow', 'leaf'];
const LID: PaletteColor[] = ['navy', 'orange', 'leafDark'];

/** ถังขยะแยกประเภท: three coloured bins with picture lids. */
export const item: ItemModel = {
  id: 'recycle-bins',
  name: 'ถังขยะแยกประเภท',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    ZS.forEach((z, i) => {
      parts.push(
        kit.box([BIN.w, BIN.h, BIN.d], [0, BIN.h / 2, z], BODY[i]),
        kit.box([BIN.w + 0.04, 0.07, BIN.d + 0.04], [0, BIN.h + 0.035, z], LID[i]),
        // slot on the lid and a white round sign on the front
        kit.box([0.26, 0.02, 0.06], [-0.06, BIN.h + 0.08, z], 'charcoal'),
        kit.cylinder(0.15, 0.15, 0.02, [FRONT_X + 0.01, 0.38, z], 'white', { segments: 12, rotate: [0, 0, Math.PI / 2] }),
        kit.box([0.04, 0.05, BIN.d + 0.04], [0, 0.025, z], 'charcoal'),
      );
    });
    // pictures (centred on the signs at x = FRONT_X + 0.02)
    const px = FRONT_X + 0.03;
    parts.push(
      // bottle
      kit.cylinder(0.04, 0.045, 0.14, [px, 0.36, ZS[0]], 'skyBlue', { segments: 8 }),
      kit.cylinder(0.02, 0.025, 0.06, [px, 0.46, ZS[0]], 'skyBlue', { segments: 8 }),
      kit.cylinder(0.026, 0.026, 0.02, [px, 0.5, ZS[0]], 'red', { segments: 8 }),
      // tin can
      kit.cylinder(0.055, 0.055, 0.14, [px, 0.38, ZS[1]], 'chrome', { segments: 8 }),
      kit.cylinder(0.058, 0.058, 0.05, [px, 0.38, ZS[1]], 'red', { segments: 8 }),
      // apple
      kit.sphere(0.075, [px, 0.37, ZS[2]], 'red', { detail: 0 }),
      kit.sphere(0.03, [px, 0.45, ZS[2] + 0.03], 'leaf', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};

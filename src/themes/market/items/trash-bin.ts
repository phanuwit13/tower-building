import type { ItemModel } from '../../../models/contract';

// A city litter bin: grey body on a dark foot, a dark lid with three recycling-colour hatches
// (green, blue, yellow) and matching bands on the front.
const BASE = 0.04;
const BODY = { w: 0.5, h: 0.62 };
const LID_Y = BASE + BODY.h + 0.03;

/** ถังขยะ: a city litter bin with a recycling-colour lid. */
export const item: ItemModel = {
  id: 'trash-bin',
  name: 'ถังขยะ',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const colours = ['leaf', 'blue', 'sunYellow'] as const;
    return kit.finish([
      kit.box([0.56, BASE, 0.56], [0, BASE / 2, 0], 'charcoal'),
      kit.box([BODY.w, BODY.h, BODY.w], [0, BASE + BODY.h / 2, 0], 'stone'),
      kit.box([0.58, 0.06, 0.58], [0, LID_Y, 0], 'charcoal'),
      ...colours.map((c, i) => kit.box([0.4, 0.05, 0.14], [0, LID_Y + 0.05, (i - 1) * 0.17], c)),
      ...colours.map((c, i) => kit.box([0.02, 0.4, 0.14], [BODY.w / 2 + 0.01, 0.38, (i - 1) * 0.17], c)),
      kit.box([0.02, 0.4, 0.14], [-BODY.w / 2 - 0.01, 0.38, 0], 'blue'),
    ]);
  },
};

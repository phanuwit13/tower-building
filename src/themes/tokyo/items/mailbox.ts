import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A red post box with a square top: chunky body, a slightly wider cap, a letter slot with a small
// rain hood, a collection hatch and short legs. Plain: no logo, no text.
const PAD = 0.03;
const LEG = 0.12;
const BODY = { w: 0.46, h: 0.62, d: 0.4 };
const BODY_Y = PAD + LEG + BODY.h / 2;
const FRONT = BODY.w / 2;

/** ตู้ไปรษณีย์: a red square-top mailbox. */
export const item: ItemModel = {
  id: 'mailbox',
  name: 'ตู้ไปรษณีย์',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const top = PAD + LEG + BODY.h;
    const parts: Part[] = [
      kit.box([0.8, PAD, 0.8], [0, PAD / 2, 0], 'stone'),
      kit.box([BODY.w, BODY.h, BODY.d], [0, BODY_Y, 0], 'red'),
      kit.box([BODY.w + 0.08, 0.07, BODY.d + 0.08], [0, top + 0.035, 0], 'redDark'), // cap
      kit.box([BODY.w - 0.1, 0.05, BODY.d - 0.1], [0, top + 0.095, 0], 'red'),
      kit.box([BODY.w + 0.04, 0.05, BODY.d + 0.04], [0, PAD + LEG + 0.025, 0], 'redDark'), // base rim
      // slot, hood and hatch on the front (+x)
      kit.box([0.03, 0.05, 0.26], [FRONT + 0.015, top - 0.1, 0], 'charcoal'),
      kit.box([0.08, 0.025, 0.3], [FRONT + 0.04, top - 0.06, 0], 'redDark'),
      kit.box([0.03, 0.26, 0.26], [FRONT + 0.015, PAD + LEG + 0.28, 0], 'redDark'),
      kit.box([0.04, 0.02, 0.1], [FRONT + 0.02, PAD + LEG + 0.28, 0], 'sunYellow'), // hatch handle
      // sunYellow stripe, plain
      kit.box([BODY.w + 0.02, 0.04, BODY.d + 0.02], [0, PAD + LEG + 0.5, 0], 'sunYellow'),
    ];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) parts.push(kit.box([0.07, LEG, 0.07], [sx * 0.17, PAD + LEG / 2, sz * 0.14], 'charcoal'));
    // a side slot so every turn reads as a mailbox
    parts.push(kit.box([0.26, 0.05, 0.03], [0, top - 0.1, BODY.d / 2 + 0.015], 'charcoal'));
    return kit.finish(parts);
  },
};

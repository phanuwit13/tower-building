import type { ItemModel } from '../../../models/contract';

const BODY = { r: 0.18, len: 0.46, y: 1.0 };

/** ตู้ไปรษณีย์: a red round mailbox on a wooden post (a letter slot and a flag, no text). */
export const item: ItemModel = {
  id: 'mailbox',
  name: 'ตู้ไปรษณีย์',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) =>
    kit.finish([
      kit.box([0.34, 0.06, 0.34], [0, 0.03, 0], 'stone'),
      kit.box([0.1, 0.8, 0.1], [0, 0.46, 0], 'wood'),
      kit.box([0.26, 0.05, 0.26], [0, 0.82, 0], 'woodDark'),
      // the round body lies along x; the front (+x) end is a darker lid with a knob
      kit.cylinder(BODY.r, BODY.r, BODY.len, [0, BODY.y, 0], 'red', { segments: 16, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(BODY.r + 0.012, BODY.r + 0.012, 0.04, [BODY.len / 2, BODY.y, 0], 'redDark', { segments: 16, rotate: [0, 0, Math.PI / 2] }),
      kit.sphere(0.035, [BODY.len / 2 + 0.05, BODY.y, 0], 'sunYellow', { detail: 0 }),
      // a yellow band, the letter slot on top and a little raised flag on the +z side
      kit.cylinder(BODY.r + 0.01, BODY.r + 0.01, 0.06, [-0.12, BODY.y, 0], 'sunYellow', { segments: 16, rotate: [0, 0, Math.PI / 2] }),
      kit.box([0.22, 0.02, 0.05], [0.04, BODY.y + BODY.r + 0.005, 0], 'charcoal'),
      kit.box([0.02, 0.2, 0.02], [-0.05, BODY.y + 0.1, BODY.r + 0.03], 'stoneDark'),
      kit.box([0.14, 0.08, 0.02], [0.02, BODY.y + 0.18, BODY.r + 0.03], 'sunYellow'),
    ]),
};

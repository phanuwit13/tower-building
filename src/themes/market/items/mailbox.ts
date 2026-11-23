import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A red post box (1×1) on a short stone pillar: a round drum with a domed top, a letter slot and
// a little door on the +x face.
const PILLAR = { r: 0.12, h: 0.25 };
const DRUM = { r: 0.24, h: 0.5 };

/** ตู้ไปรษณีย์: a red post box on a short pillar. */
export const item: ItemModel = {
  id: 'mailbox',
  name: 'ตู้ไปรษณีย์',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const drumY = 0.04 + PILLAR.h;
    const parts: Part[] = [
      kit.cylinder(0.34, 0.36, 0.04, [0, 0.02, 0], 'stone', { segments: 8 }),
      kit.cylinder(PILLAR.r, PILLAR.r, PILLAR.h, [0, 0.04 + PILLAR.h / 2, 0], 'stoneDark', { segments: 8 }),
      kit.cylinder(DRUM.r + 0.02, DRUM.r + 0.02, 0.05, [0, drumY + 0.025, 0], 'redDark'),
      kit.cylinder(DRUM.r, DRUM.r, DRUM.h, [0, drumY + DRUM.h / 2, 0], 'red'),
      kit.cylinder(DRUM.r + 0.02, DRUM.r + 0.02, 0.04, [0, drumY + DRUM.h - 0.02, 0], 'redDark'),
      kit.dome(DRUM.r, [0, drumY + DRUM.h, 0], 'red'),
      kit.sphere(0.04, [0, drumY + DRUM.h + DRUM.r + 0.01, 0], 'sunYellow', { detail: 0 }),
      kit.box([0.03, 0.05, 0.22], [DRUM.r, drumY + 0.38, 0], 'charcoal'),
      kit.box([0.02, 0.2, 0.18], [DRUM.r, drumY + 0.16, 0], 'redDark'),
      kit.sphere(0.02, [DRUM.r + 0.01, drumY + 0.16, 0.06], 'sunYellow', { detail: 0 }),
    ];
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A tall striped pole (1x1) on a round base, with a blinking red light and a ring on top.
const BASE = { r: 0.28, h: 0.08 };
const POLE = { r: 0.05, h: 1.3 };

export const item: ItemModel = {
  id: 'beacon',
  name: 'สัญญาณไฟ',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(BASE.r - 0.04, BASE.r, BASE.h, [0, BASE.h / 2, 0], 'stoneDark', { segments: 10 }),
      kit.cylinder(0.12, 0.16, 0.1, [0, BASE.h + 0.05, 0], 'teal', { segments: 8 }),
    ];
    // pole in four stripes
    const seg = (POLE.h - 0.18) / 4;
    for (let i = 0; i < 4; i++) {
      parts.push(
        kit.cylinder(POLE.r, POLE.r, seg, [0, BASE.h + 0.18 + seg * (i + 0.5), 0], i % 2 === 0 ? 'red' : 'white', { segments: 8 }),
      );
    }
    const top = BASE.h + POLE.h;
    parts.push(
      kit.cylinder(0.12, 0.07, 0.06, [0, top + 0.03, 0], 'charcoal', { segments: 8 }),
      kit.sphere(0.13, [0, top + 0.17, 0], 'red', { glow: true, light: 'blink' }),
      kit.cone(0.1, 0.12, [0, top + 0.36, 0], 'sunYellow', { segments: 8 }),
    );
    return kit.finish(parts);
  },
};

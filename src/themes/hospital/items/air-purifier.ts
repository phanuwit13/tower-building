import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A tall white air purifier (1×1, front on +x): grille slats on the front, status dots, and a lit mint ring on top.
const BODY = { w: 0.42, h: 1.1 };
const BASE_H = 0.06;

/** เครื่องฟอกอากาศ: a tall air purifier with a lit ring on top. */
export const item: ItemModel = {
  id: 'air-purifier',
  name: 'เครื่องฟอกอากาศ',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const top = BASE_H + BODY.h;
    const parts: Part[] = [
      kit.box([BODY.w + 0.08, BASE_H, BODY.w + 0.08], [0, BASE_H / 2, 0], 'charcoal'),
      kit.box([BODY.w, BODY.h, BODY.w], [0, BASE_H + BODY.h / 2, 0], 'white'),
      kit.box([BODY.w + 0.04, 0.06, BODY.w + 0.04], [0, top + 0.03, 0], 'teal'),
      // lit ring lying on the top, inside a dark dish
      kit.box([0.34, 0.02, 0.34], [0, top + 0.07, 0], 'charcoal'),
      kit.torus(0.12, 0.025, [0, top + 0.1, 0], 'mint', { rotate: [Math.PI / 2, 0, 0], glow: true, light: 'window', radialSegments: 6, tubularSegments: 12 }),
      // status dots and a teal band on the front
      kit.box([0.02, 0.06, BODY.w - 0.1], [BODY.w / 2 + 0.01, 0.95, 0], 'teal'),
      kit.sphere(0.025, [BODY.w / 2 + 0.03, 0.95, -0.1], 'lime', { detail: 0 }),
      kit.sphere(0.025, [BODY.w / 2 + 0.03, 0.95, 0], 'sunYellow', { detail: 0 }),
      kit.sphere(0.025, [BODY.w / 2 + 0.03, 0.95, 0.1], 'skyBlue', { detail: 0 }),
    ];
    // grille slats on the +x and +z faces
    for (let i = 0; i < 6; i++) {
      const y = 0.28 + i * 0.1;
      parts.push(kit.box([0.02, 0.03, BODY.w - 0.12], [BODY.w / 2 + 0.01, y, 0], 'mint'), kit.box([BODY.w - 0.12, 0.03, 0.02], [0, y, BODY.w / 2 + 0.01], 'mint'));
    }
    return kit.finish(parts);
  },
};

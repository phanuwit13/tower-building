import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, glassWindow } from '../../../models/parts';

// A shop (2×2) with a giant pink donut lying on the roof, a striped awning and a donut neon on a blade sign.
const BASE = { w: 1.9, h: 0.03, d: 1.9 };
const BODY = { x: -0.2, w: 1.1, d: 1.5, top: 0.8 };
const FRONT = BODY.x + BODY.w / 2;
const DONUT = { x: -0.2, z: 0, r: 0.34, tube: 0.14 };

/** ร้านโดนัท: a giant donut on the roof and a pink donut neon. */
export const item: ItemModel = {
  id: 'donut-shop',
  name: 'ร้านโดนัท',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const roofY = BASE.h + BODY.top + 0.06;
    const flat: [number, number, number] = [Math.PI / 2, 0, 0];
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'stone'),
      kit.box([BODY.w, BODY.top, BODY.d], [BODY.x, BASE.h + BODY.top / 2, 0], 'sand'),
      kit.box([BODY.w + 0.1, 0.06, BODY.d + 0.1], [BODY.x, BASE.h + BODY.top + 0.03, 0], 'terracotta'),
      kit.box([BODY.w + 0.02, 0.07, BODY.d + 0.02], [BODY.x, BASE.h + 0.035, 0], 'woodDark'),
      // the giant donut: dough ring with a pink icing ring on top and sprinkles
      kit.torus(DONUT.r, DONUT.tube, [DONUT.x, roofY + DONUT.tube, DONUT.z], 'wood', { rotate: flat, radialSegments: 8, tubularSegments: 16 }),
      kit.torus(DONUT.r, DONUT.tube + 0.015, [DONUT.x, roofY + DONUT.tube + 0.07, DONUT.z], 'pink', { rotate: flat, radialSegments: 8, tubularSegments: 16, scale: [1, 1, 0.6] }),
      // front: window, door, striped awning, blade sign
      ...glassWindow(kit, { at: [FRONT, BASE.h + 0.42, -0.3], facing: 'x+', w: 0.7, h: 0.38, frame: 'pink' }),
      ...door(kit, { at: [FRONT, BASE.h + 0.2, 0.45], facing: 'x+', w: 0.3, h: 0.4, color: 'pink', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [BODY.x, BASE.h + 0.42, BODY.d / 2], facing: 'z+', w: 0.6, h: 0.38, frame: 'pink' }),
      ...glassWindow(kit, { at: [BODY.x, BASE.h + 0.42, -BODY.d / 2], facing: 'z-', w: 0.6, h: 0.38, frame: 'pink' }),
      ...glassWindow(kit, { at: [BODY.x - BODY.w / 2, BASE.h + 0.42, 0], facing: 'x-', w: 0.8, h: 0.38, frame: 'pink' }),
      kit.cylinder(0.025, 0.025, 0.75, [0.8, BASE.h + 0.375, 0.7], 'charcoal', { segments: 6 }),
      kit.box([0.04, 0.56, 0.56], [0.8, BASE.h + 0.8, 0.7], 'navy'),
      kit.box([0.05, 0.04, BODY.d + 0.1], [FRONT + 0.05, BASE.h + BODY.top + 0.04, 0], 'pink', { glow: true, light: 'breathe' }), // roof-edge neon strip
      kit.torus(0.17, 0.045, [0.84, BASE.h + 0.8, 0.7], 'pink', { rotate: [0, Math.PI / 2, 0], radialSegments: 6, tubularSegments: 12, glow: true, light: 'breathe' }),
    ];
    const stripes = 6;
    for (let i = 0; i < stripes; i++) {
      parts.push(kit.box([0.22, 0.04, 1.3 / stripes], [FRONT + 0.1, BASE.h + 0.68, -0.65 + (1.3 / stripes) * (i + 0.5)], i % 2 === 0 ? 'pink' : 'white', { rotate: [0, 0, -0.3] }));
    }
    // sprinkles on the icing
    const colours = ['sunYellow', 'lime', 'skyBlue', 'white', 'purple', 'orange'] as const;
    for (let i = 0; i < 8; i++) {
      const a = i * 0.8 + 0.3;
      const r = DONUT.r + (i % 2 === 0 ? 0.04 : -0.04);
      parts.push(kit.box([0.07, 0.02, 0.025], [DONUT.x + r * Math.cos(a), roofY + DONUT.tube + 0.16, DONUT.z + r * Math.sin(a)], colours[i % 6], { rotate: [0, a * 2, 0] }));
    }
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Footprint 1x2: x in [-0.5, 0.5], z in [-1, 1]. A stepped rack, three trays rising towards the back (-x),
// each with a row of big round donuts (one torus each, in a bright icing colour) and tiny sprinkles.
const TIERS = [
  { x: 0.3, y: 0.3, tray: 'pink' },
  { x: 0.0, y: 0.58, tray: 'mint' },
  { x: -0.3, y: 0.86, tray: 'sunYellow' },
] as const;
const TRAY_W = 0.3;
const DONUT = { r: 0.1, tube: 0.05 };
const ZS = [-0.72, -0.24, 0.24, 0.72];
const ICING = ['pink', 'orange', 'purple', 'sunYellow', 'lime', 'skyBlue', 'red', 'pink', 'orange', 'purple', 'lime', 'red'] as const;
const SPRINKLE = ['white', 'sunYellow', 'blue', 'red'] as const;

/** ชั้นโดนัท: tiered rack of colourful donuts. */
export const item: ItemModel = {
  id: 'donut-shelf',
  name: 'ชั้นโดนัท',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const z of [-0.94, 0.94]) {
      for (const t of TIERS) parts.push(kit.box([TRAY_W, t.y, 0.06], [t.x, t.y / 2, z], 'wood'));
    }
    let n = 0;
    for (const t of TIERS) {
      parts.push(kit.box([TRAY_W, 0.03, 1.9], [t.x, t.y + 0.015, 0], t.tray));
      for (const z of ZS) {
        const y = t.y + 0.03 + DONUT.tube * 0.7;
        parts.push(kit.torus(DONUT.r, DONUT.tube, [t.x, y, z], ICING[n % ICING.length], { radialSegments: 4, tubularSegments: 10, rotate: [Math.PI / 2, 0, 0], scale: [1, 1, 0.7] }));
        for (let k = 0; k < 2; k++) {
          const a = n * 1.7 + k * 3.1;
          parts.push(kit.box([0.035, 0.014, 0.014], [t.x + Math.cos(a) * DONUT.r, y + DONUT.tube * 0.7 + 0.005, z + Math.sin(a) * DONUT.r], SPRINKLE[(n + k) % 4], { rotate: [0, a, 0] }));
        }
        n++;
      }
    }
    return kit.finish(parts);
  },
};

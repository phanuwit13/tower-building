import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Footprint 1x2: x in [-0.5, 0.5], z in [-1, 1]. A stepped rack, three trays rising towards the back (-x),
// each with a row of donuts: sand dough ring, a coloured icing ring on top and tiny sprinkles.
const TIERS = [
  { x: 0.27, y: 0.3, tray: 'pink' },
  { x: 0.0, y: 0.58, tray: 'mint' },
  { x: -0.27, y: 0.86, tray: 'sunYellow' },
] as const;
const ICING = ['pink', 'purple', 'sunYellow', 'lime', 'orange', 'skyBlue', 'red', 'pink', 'purple'] as const;
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
      for (const t of TIERS) parts.push(kit.box([0.27, t.y, 0.06], [t.x, t.y / 2, z], 'wood'));
    }
    let n = 0;
    for (const t of TIERS) {
      parts.push(
        kit.box([0.27, 0.03, 1.9], [t.x, t.y + 0.015, 0], t.tray),
        kit.box([0.02, 0.05, 1.9], [t.x + 0.13, t.y + 0.04, 0], 'white'),
      );
      for (const z of [-0.6, 0, 0.6]) {
        const y = t.y + 0.075;
        const c = ICING[n % ICING.length];
        parts.push(
          kit.torus(0.075, 0.032, [t.x, y, z], 'sand', { radialSegments: 3, tubularSegments: 8, rotate: [Math.PI / 2, 0, 0] }),
          kit.torus(0.075, 0.034, [t.x, y + 0.02, z], c, { radialSegments: 3, tubularSegments: 8, rotate: [Math.PI / 2, 0, 0], scale: [1, 1, 0.6] }),
        );
        for (let k = 0; k < 2; k++) {
          const a = n * 1.7 + k * 3.1;
          parts.push(kit.box([0.03, 0.012, 0.012], [t.x + Math.cos(a) * 0.075, y + 0.045, z + Math.sin(a) * 0.075], SPRINKLE[(n + k) % 4], { rotate: [0, a, 0] }));
        }
        n++;
      }
    }
    return kit.finish(parts);
  },
};

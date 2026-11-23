import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Two rows of small ground lights running along z. Each row is one chase run; bulbs stay still.
const COUNT = 6;
const Z0 = -0.8;
const STEP = 0.32;
const ROW_X = 0.28;
const BASE_H = 0.1;
const BULB_R = 0.065;

/** แนวไฟนำร่อง: a row of ground lights that run in a line. */
export const item: ItemModel = {
  id: 'landing-lights',
  name: 'แนวไฟนำร่อง',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      // a flat orange guide strip down the middle, with a darker plate under each row
      kit.box([0.1, 0.03, 1.8], [0, 0.015, 0], 'orange'),
    ];
    for (const side of [1, -1]) {
      for (let index = 0; index < COUNT; index++) {
        // the run goes from the far end towards the near end on both rows
        const z = Z0 + index * STEP;
        const x = side * ROW_X;
        parts.push(kit.cylinder(0.1, 0.12, BASE_H, [x, BASE_H / 2, z], index % 2 ? 'red' : 'white', { segments: 8 }));
        parts.push(kit.sphere(BULB_R, [x, BASE_H + BULB_R * 0.6, z], 'lampWarm', { detail: 0, glow: true, light: 'chase', chase: { index, count: COUNT } }));
      }
    }
    return kit.finish(parts);
  },
};

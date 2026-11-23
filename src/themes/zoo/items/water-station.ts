import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A blue drinking-water refill station (1 x 1), facing +x: a tall blue column with a water-drop
// badge, a chrome tap over a little basin, and a small roof on top.
const GROUND_H = 0.03;
const COL = { x: -0.17, w: 0.3, d: 0.5, h: 0.95 };
const COL_TOP = GROUND_H + COL.h;
const FRONT = COL.x + COL.w / 2; // front face of the column

/** จุดเติมน้ำดื่ม: a blue water refill station with a tap, a basin and a little roof. */
export const item: ItemModel = {
  id: 'water-station',
  name: 'จุดเติมน้ำดื่ม',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.92, GROUND_H, 0.92], [0, GROUND_H / 2, 0], 'stone'),
      kit.box([COL.w + 0.06, 0.08, COL.d + 0.06], [COL.x, GROUND_H + 0.04, 0], 'stoneDark'),
      kit.box([COL.w, COL.h, COL.d], [COL.x, GROUND_H + COL.h / 2, 0], 'blue'),
      // roof: a flat-ridged cap with overhang towards the front
      kit.wedge([0.9, 0.2, 0.8], [0.0, COL_TOP + 0.1, 0], 'teal', { rotate: [0, 0, 0] }),
      kit.box([0.9, 0.03, 0.82], [0.0, COL_TOP + 0.0, 0], 'navy'),
      // badge: a sky-blue panel with a white drop
      kit.box([0.02, 0.3, 0.3], [FRONT + 0.01, GROUND_H + 0.72, 0], 'skyBlue'),
      kit.sphere(0.07, [FRONT + 0.03, GROUND_H + 0.69, 0], 'white', { detail: 1, scale: [0.4, 1, 1] }),
      kit.cone(0.055, 0.12, [FRONT + 0.03, GROUND_H + 0.78, 0], 'white', { segments: 8, scale: [0.4, 1, 1] }),
      // basin ledge with legs, and a little water in it
      kit.box([0.3, 0.06, 0.34], [FRONT + 0.12, GROUND_H + 0.36, 0], 'chrome'),
      kit.box([0.26, 0.02, 0.3], [FRONT + 0.14, GROUND_H + 0.395, 0], 'skyBlue'),
      kit.box([0.04, 0.33, 0.04], [FRONT + 0.25, GROUND_H + 0.165, 0.13], 'chrome'),
      kit.box([0.04, 0.33, 0.04], [FRONT + 0.25, GROUND_H + 0.165, -0.13], 'chrome'),
      // tap: out of the column, bending down over the basin; a red handle on top
      rod(kit, [FRONT, GROUND_H + 0.55, 0], [FRONT + 0.14, GROUND_H + 0.55, 0], 0.03, 'chrome', { segments: 6 }),
      rod(kit, [FRONT + 0.14, GROUND_H + 0.55, 0], [FRONT + 0.14, GROUND_H + 0.46, 0], 0.03, 'chrome', { segments: 6 }),
      kit.sphere(0.045, [FRONT + 0.14, GROUND_H + 0.55, 0], 'chrome', { detail: 0 }),
      kit.cylinder(0.012, 0.012, 0.06, [FRONT + 0.07, GROUND_H + 0.6, 0], 'chrome', { segments: 6 }),
      kit.sphere(0.04, [FRONT + 0.07, GROUND_H + 0.64, 0], 'red', { detail: 0 }),
      // a bottle-sized hole of shade under the tap: dark drain
      kit.cylinder(0.04, 0.04, 0.012, [FRONT + 0.14, GROUND_H + 0.402, 0], 'navy', { segments: 8 }),
    ];
    return kit.finish(parts);
  },
};

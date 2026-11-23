import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { aim, rod } from '../../../models/parts';

// Three small radio dishes in a row along z (2x2), each on its own coloured pedestal and tilted
// towards +x so the camera sees the faces. A little blue control hut stands behind them.
const PAD = { w: 1.9, h: 0.05, d: 1.9 };
const ROWS: { z: number; color: PaletteColor }[] = [{ z: -0.62, color: 'orange' }, { z: 0, color: 'teal' }, { z: 0.62, color: 'red' }];
const DISH = { r: 0.3, rBack: 0.08, depth: 0.14, y: 0.78 };
const TILT = 0.7; // radians above horizontal the dish faces
const N: [number, number, number] = [Math.cos(TILT), Math.sin(TILT), 0]; // the way a dish faces

/** กล้องโทรทรรศน์วิทยุ: three radio dishes in a row. */
export const item: ItemModel = {
  id: 'telescope-array',
  name: 'กล้องโทรทรรศน์วิทยุ',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([PAD.w, PAD.h, PAD.d], [0, PAD.h / 2, 0], 'stone'),
      kit.box([0.4, 0.4, 0.55], [-0.7, PAD.h + 0.2, 0], 'blue'),
      kit.box([0.44, 0.06, 0.59], [-0.7, PAD.h + 0.43, 0], 'white'),
      kit.box([0.02, 0.14, 0.3], [-0.5 + 0.01, PAD.h + 0.22, 0], 'sunYellow', { glow: 'windowWarm', light: 'window' }),
    ];
    for (const { z, color } of ROWS) {
      const c: [number, number, number] = [0.05, DISH.y, z];
      parts.push(
        kit.cylinder(0.13, 0.17, 0.12, [0, PAD.h + 0.06, z], 'stoneDark', { segments: 10 }),
        kit.cylinder(0.07, 0.07, DISH.y - 0.1 - PAD.h, [0, PAD.h + (DISH.y - 0.1 - PAD.h) / 2 + 0.05, z], color, { segments: 8 }),
        kit.sphere(0.1, [0, DISH.y - 0.1, z], 'white', { detail: 0 }),
        // the dish: a shallow white bowl with a red rim and a sky-blue face, aimed along N
        kit.cylinder(DISH.r, DISH.rBack, DISH.depth, c, 'white', { segments: 12, rotate: aim(N) }),
        kit.cylinder(DISH.r + 0.02, DISH.r + 0.02, 0.04, [c[0] + N[0] * (DISH.depth / 2 - 0.02), c[1] + N[1] * (DISH.depth / 2 - 0.02), z], color, { segments: 12, rotate: aim(N) }),
        kit.cylinder(DISH.r - 0.07, DISH.r - 0.07, 0.02, [c[0] + N[0] * (DISH.depth / 2 + 0.005), c[1] + N[1] * (DISH.depth / 2 + 0.005), z], 'skyBlue', { segments: 12, rotate: aim(N) }),
        rod(kit, c, [c[0] + N[0] * 0.38, c[1] + N[1] * 0.38, z], 0.012, 'charcoal', { segments: 4 }),
        kit.sphere(0.035, [c[0] + N[0] * 0.38, c[1] + N[1] * 0.38, z], 'sunYellow', { detail: 0 }),
      );
    }
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// 1 wide (x) by 2 long (z). A raised stone-edged bed full of bright mixed flowers that sway.
const BED = { w: 0.9, d: 1.9, h: 0.14 };
const SOIL = BED.h;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, SOIL, 0], amount: 0.16 };
const COLORS: PaletteColor[] = ['red', 'sunYellow', 'pink', 'purple', 'orange', 'white', 'blue'];
const EDGE = 0.08; // wall thickness

/** แปลงดอกไม้: a raised bed of bright mixed flowers. */
export const item: ItemModel = {
  id: 'flower-bed',
  name: 'แปลงดอกไม้',
  category: 'nature',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BED.w, BED.h, BED.d], [0, BED.h / 2, 0], 'stone'),
      kit.box([BED.w - 2 * EDGE, 0.03, BED.d - 2 * EDGE], [0, BED.h + 0.005, 0], 'bark'),
    ];
    let n = 0;
    for (let row = 0; row < 8; row++) {
      const z = -0.76 + row * 0.217;
      for (const x of row % 2 ? [-0.18, 0.18] : [-0.3, 0, 0.3]) {
        const h = 0.16 + ((n * 7) % 4) * 0.04;
        const c = COLORS[n % COLORS.length];
        parts.push(
          kit.cylinder(0.012, 0.012, h, [x, SOIL + h / 2, z], 'leaf', { segments: 4, motion: SWAY }),
          kit.sphere(0.09, [x, SOIL + h, z], c, { detail: 0, scale: [1, 0.65, 1], motion: SWAY }),
          kit.box([0.05, 0.03, 0.05], [x, SOIL + h + 0.03, z], c === 'sunYellow' ? 'orange' : 'sunYellow', { motion: SWAY }),
        );
        n++;
      }
    }
    return kit.finish(parts);
  },
};

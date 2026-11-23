import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A bed of marigolds (1×2): a timber-edged soil bed, 3 columns × 7 rows of bushy plants with round orange and
// yellow blooms. Each plant sways from the soil line.
const BED = { w: 0.86, d: 1.8 };
const SOIL_TOP = 0.1;
const COLS = [-0.24, 0, 0.24];
const ROWS = 7;

/** ดาวเรือง: a bed of bright orange and yellow marigolds. */
export const item: ItemModel = {
  id: 'marigold-patch',
  name: 'แปลงดาวเรือง',
  category: 'nature',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const t = 0.05;
    const parts: Part[] = [
      kit.box([BED.w - 2 * t, SOIL_TOP, BED.d - 2 * t], [0, SOIL_TOP / 2, 0], 'bark'),
      kit.box([BED.w, 0.14, t], [0, 0.07, -(BED.d - t) / 2], 'wood'),
      kit.box([BED.w, 0.14, t], [0, 0.07, (BED.d - t) / 2], 'wood'),
      kit.box([t, 0.14, BED.d - 2 * t], [-(BED.w - t) / 2, 0.07, 0], 'woodDark'),
      kit.box([t, 0.14, BED.d - 2 * t], [(BED.w - t) / 2, 0.07, 0], 'woodDark'),
    ];
    for (let r = 0; r < ROWS; r++) {
      COLS.forEach((cx, c) => {
        const x = cx + (r % 2 ? 0.05 : -0.05);
        const z = -0.78 + (r + (c % 2) * 0.35 - 0.17) * 0.26;
        const sway: MotionOpts = { kind: 'sway', pivot: [x, SOIL_TOP, z], amount: 0.15, phase: r * 0.7 + c };
        const bloom: PaletteColor = (r + c) % 3 === 0 ? 'orange' : (r + c) % 3 === 1 ? 'sunYellow' : 'orange';
        parts.push(
          kit.sphere(0.1, [x, SOIL_TOP + 0.1, z], c === 1 ? 'leaf' : 'leafDark', { detail: 0, scale: [1, 1.2, 1], motion: sway }),
          kit.sphere(0.085, [x, SOIL_TOP + 0.25, z], bloom, { detail: 0, motion: sway }),
        );
      });
    }
    return kit.finish(parts);
  },
};

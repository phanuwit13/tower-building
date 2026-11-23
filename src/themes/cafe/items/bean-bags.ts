import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Two big round bean bags on a rug (1×2, long side along z).
const RUG_H = 0.025;
const R = 0.46;
const SQUASH = 0.55;

/** บีนแบ็กคู่: two big round bean bags on a rug. */
export const item: ItemModel = {
  id: 'bean-bags',
  name: 'บีนแบ็กคู่',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.96, RUG_H, 1.96], [0, RUG_H / 2, 0], 'mint'),
      kit.box([0.84, 0.01, 1.84], [0, RUG_H + 0.005, 0], 'glassBlue'),
    ];
    const bags: Array<[number, 'orange' | 'purple', 'sunYellow' | 'pink']> = [[-0.5, 'orange', 'sunYellow'], [0.5, 'purple', 'pink']];
    for (const [z, color, accent] of bags) {
      const h = RUG_H + R * SQUASH;
      parts.push(
        kit.sphere(R, [0, h, z], color, { scale: [1.05, SQUASH, 1.05] }),
        // slouched back at -x, a clear seat dip (a bright flat cushion) and a small tie knob
        kit.sphere(0.3, [-0.22, h + 0.1, z], color, { scale: [0.6, 0.9, 1.2] }),
        kit.sphere(0.24, [0.08, h + 0.1, z], accent, { scale: [1, 0.3, 1] }),
        kit.sphere(0.05, [-0.38, h + 0.3, z], accent, { detail: 0 }),
      );
    }
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Two big round bean bags on a rug (1×2, long side along z).
const RUG_H = 0.025;
const R = 0.4;
const SQUASH = 0.72;

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
    const bags: Array<[number, 'red' | 'sunYellow', 'orange' | 'pink' | 'sunYellow']> = [[-0.5, 'red', 'sunYellow'], [0.5, 'sunYellow', 'orange']];
    for (const [z, color, accent] of bags) {
      parts.push(
        kit.sphere(R, [0, RUG_H + R * SQUASH, z], color, { scale: [1, SQUASH, 1] }),
        // a dimple in the seat and a small tied knob on top
        kit.sphere(0.2, [-0.05, RUG_H + R * SQUASH + 0.14, z], accent, { scale: [1, 0.35, 1], detail: 1 }),
        kit.sphere(0.05, [-0.05, RUG_H + R * SQUASH + 0.19, z], color, { detail: 0 }),
      );
    }
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A park bench (1×2, long side along z, seat faces +x) with cast-iron ends, and a small planter at one end.
const SEAT_Y = 0.31;
const Z0 = -0.93; // bench ends
const Z1 = 0.33;
const PLANTER_Z = 0.7;

/** ม้านั่งริมทาง: a park bench with cast-iron ends and a small planter. */
export const item: ItemModel = {
  id: 'street-bench',
  name: 'ม้านั่งริมทาง',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const zc = (Z0 + Z1) / 2;
    const len = Z1 - Z0;
    const parts: Part[] = [];
    // seat boards and tilted back boards
    for (const x of [-0.12, 0.02, 0.16]) parts.push(kit.box([0.12, 0.035, len - 0.06], [x, SEAT_Y, zc], 'wood'));
    [0.42, 0.54, 0.66].forEach((y, i) => {
      parts.push(kit.box([0.035, 0.1, len - 0.06], [-0.21 - i * 0.012, y, zc], 'wood', { rotate: [0, 0, 0.12] }));
    });
    // cast-iron ends: front leg, tall back leg, an armrest and a scroll knob
    for (const z of [Z0 + 0.03, Z1 - 0.03]) {
      parts.push(
        kit.box([0.05, SEAT_Y, 0.05], [0.19, SEAT_Y / 2, z], 'charcoal'),
        kit.box([0.05, 0.74, 0.05], [-0.22, 0.37, z], 'charcoal'),
        kit.box([0.4, 0.035, 0.05], [-0.01, 0.5, z], 'charcoal'),
        kit.box([0.05, 0.2, 0.05], [0.19, 0.4, z], 'charcoal'),
        kit.sphere(0.04, [0.2, 0.51, z], 'charcoal', { detail: 0 }),
        kit.box([0.36, 0.04, 0.05], [-0.0, 0.2, z], 'charcoal'),
      );
    }
    // planter with flowers
    parts.push(
      kit.box([0.34, 0.2, 0.34], [0, 0.1, PLANTER_Z], 'terracotta'),
      kit.box([0.38, 0.04, 0.38], [0, 0.22, PLANTER_Z], 'redDark'),
      kit.box([0.3, 0.03, 0.3], [0, 0.235, PLANTER_Z], 'bark'),
      kit.sphere(0.13, [0, 0.35, PLANTER_Z], 'leaf', { detail: 0 }),
      kit.sphere(0.05, [0.06, 0.45, PLANTER_Z + 0.06], 'pink', { detail: 0 }),
      kit.sphere(0.05, [-0.07, 0.43, PLANTER_Z - 0.05], 'sunYellow', { detail: 0 }),
      kit.sphere(0.05, [-0.02, 0.47, PLANTER_Z + 0.08], 'purple', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};

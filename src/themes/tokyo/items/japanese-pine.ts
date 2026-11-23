import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// 1x1. A pine with flat cloud-shaped layers of needles; the crown sways about the top of the lower trunk.
const SWAY: MotionOpts = { kind: 'sway', pivot: [0.02, 0.55, 0], amount: 0.07 };
/** Cloud layers: [y, radius, x offset]. */
const LAYERS: Array<[number, number, number]> = [[0.72, 0.36, 0.02], [1.1, 0.3, 0.07], [1.45, 0.24, 0.0], [1.75, 0.17, 0.04]];

/** ต้นสนญี่ปุ่น: a pine of flat needle clouds. */
export const item: ItemModel = {
  id: 'japanese-pine',
  name: 'ต้นสนญี่ปุ่น',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.98, 0.03, 0.98], [0, 0.015, 0], 'lime'),
      kit.cylinder(0.3, 0.34, 0.05, [0, 0.025, 0], 'bark', { segments: 10 }),
      kit.cylinder(0.07, 0.11, 0.55, [0, 0.3, 0], 'bark', { segments: 8 }), // lower trunk: stays put
      // upper trunk and branches move with the crown
      kit.cylinder(0.05, 0.07, 0.6, [0.04, 0.85, 0], 'bark', { segments: 8, rotate: [0, 0, -0.12], motion: SWAY }),
      kit.cylinder(0.04, 0.05, 0.4, [0.04, 1.4, 0], 'bark', { segments: 6, motion: SWAY }),
    ];
    for (const [y, r, dx] of LAYERS) {
      const sx = r / 0.36;
      parts.push(
        kit.sphere(r, [dx, y, 0], 'leafDark', { detail: 1, scale: [1.2, 0.42, 1.2], motion: SWAY }),
        kit.sphere(r * 0.55, [dx + r * 0.45, y - 0.03, r * 0.35], 'leaf', { detail: 0, scale: [1.2, 0.55, 1.2], motion: SWAY }),
        kit.sphere(r * 0.5, [dx - r * 0.45, y - 0.03, -r * 0.4], 'leaf', { detail: 0, scale: [1.2, 0.55, 1.2], motion: SWAY }),
        kit.sphere(r * 0.4 * sx, [dx, y + r * 0.2, 0], 'leaf', { detail: 0, scale: [1.2, 0.4, 1.2], motion: SWAY }),
      );
    }
    parts.push(kit.cone(0.07, 0.22, [0.04, 1.97, 0], 'leafDark', { segments: 6, motion: SWAY }));
    return kit.finish(parts);
  },
};

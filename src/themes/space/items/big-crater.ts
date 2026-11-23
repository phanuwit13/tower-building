import type { ItemModel } from '../../../models/contract';
import { ICO_LOW } from '../../../models/parts';
import type { Part } from '../../../models/kit';

// A round crater with a raised stone rim, a dark floor and a few pebbles.
const R = 0.78;
const TUBE = 0.09;
const FLOOR_TOP = 0.03;

/** หลุมอุกกาบาต: a round crater with a raised rim. */
export const item: ItemModel = {
  id: 'big-crater',
  name: 'หลุมอุกกาบาต',
  category: 'nature',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.torus(R, TUBE, [0, TUBE, 0], 'stoneDark', { radialSegments: 5, tubularSegments: 16, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(R, R, FLOOR_TOP, [0, FLOOR_TOP / 2, 0], 'charcoal', { segments: 16 }),
      kit.cylinder(R * 0.55, R * 0.55, 0.012, [0, FLOOR_TOP + 0.006, 0], 'stoneDark', { segments: 12 }),
    ];
    // lumps in the rim and pebbles on the floor
    const lumps: [number, number, number, 'stone' | 'purple' | 'stoneDark' | 'charcoal'][] = [
      [R, 0.15, 0.14, 'stone'], [-0.4, -R + 0.05, 0.12, 'purple'], [-R, 0.25, 0.15, 'stoneDark'], [0.35, R, 0.13, 'stone'], [0.55, -0.6, 0.1, 'stoneDark'],
      [0.1, 0.15, 0.07, 'stone'], [-0.2, -0.2, 0.06, 'purple'],
    ];
    for (const [x, z, r, c] of lumps) {
      const onFloor = Math.hypot(x, z) < R * 0.6;
      parts.push(kit.sphere(r, [x, (onFloor ? FLOOR_TOP : 0) + r * 0.8 * ICO_LOW, z], c, { detail: 0, scale: [1, 0.8, 1], rotate: [0, x * 7, 0] }));
    }
    return kit.finish(parts);
  },
};

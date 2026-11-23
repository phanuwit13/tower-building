import type { ItemModel } from '../../../models/contract';
import { ICO_LOW } from '../../../models/parts';
import type { Part } from '../../../models/kit';

// A small crater: a low rim round a dark floor, with one pebble.
const R = 0.34;
const TUBE = 0.055;
const FLOOR_TOP = 0.03;

/** หลุมเล็ก: a small crater with a little rim. */
export const item: ItemModel = {
  id: 'small-crater',
  name: 'หลุมเล็ก',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.torus(R, TUBE, [0, TUBE, 0], 'stoneDark', { radialSegments: 5, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(R, R, FLOOR_TOP, [0, FLOOR_TOP / 2, 0], 'charcoal', { segments: 12 }),
      kit.sphere(0.05, [0.04, FLOOR_TOP + 0.05 * 0.8 * ICO_LOW, -0.03], 'stone', { detail: 0, scale: [1, 0.8, 1] }),
      kit.sphere(0.07, [-R - 0.01, 0.07 * 0.8 * ICO_LOW, 0.12], 'purple', { detail: 0, scale: [1, 0.8, 1] }),
    ];
    return kit.finish(parts);
  },
};

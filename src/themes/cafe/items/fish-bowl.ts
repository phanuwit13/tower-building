import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';

// A goldfish bowl on a little wooden stand. The water is a pool-water cylinder; the goldfish lies on
// its surface so it reads from above, with a glass rim, a plant and pebbles.
const STAND = { top: 0.42, size: 0.6 };
const WATER_TOP = 0.76;

/** โหลปลาทอง: a goldfish bowl on a stand. */
export const item: ItemModel = {
  id: 'fish-bowl',
  name: 'โหลปลาทอง',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit: StyleKit) => {
    const parts: Part[] = [
      // stand: top plate and four legs
      kit.box([STAND.size, 0.05, STAND.size], [0, STAND.top - 0.025, 0], 'woodDark'),
      ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) =>
        kit.box([0.07, STAND.top - 0.05, 0.07], [sx * 0.24, (STAND.top - 0.05) / 2, sz * 0.24], 'wood'))),
      // water bowl (wider at the top), glass rim and base ring
      kit.cylinder(0.3, 0.22, WATER_TOP - STAND.top, [0, (WATER_TOP + STAND.top) / 2, 0], 'skyBlue', { segments: 12, motion: { kind: 'water', water: 'pool' } }),
      kit.torus(0.3, 0.025, [0, WATER_TOP, 0], 'glassBlue', { radialSegments: 4, tubularSegments: 16, rotate: [Math.PI / 2, 0, 0] }),
      kit.torus(0.22, 0.02, [0, STAND.top + 0.02, 0], 'glassBlue', { radialSegments: 4, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }),
      // pebbles, a plant and a shell poking out
      kit.sphere(0.05, [-0.14, WATER_TOP + 0.01, -0.12], 'pink', { detail: 0 }),
      kit.sphere(0.04, [-0.05, WATER_TOP + 0.005, -0.2], 'sunYellow', { detail: 0 }),
      kit.cone(0.05, 0.28, [0.14, WATER_TOP + 0.1, -0.14], 'leaf', { segments: 6 }),
      kit.cone(0.04, 0.2, [0.2, WATER_TOP + 0.06, -0.06], 'leafDark', { segments: 6 }),
      kit.cone(0.04, 0.22, [0.08, WATER_TOP + 0.07, -0.2], 'lime', { segments: 6 }),
      // goldfish facing +x
      kit.sphere(0.1, [0.02, WATER_TOP + 0.05, 0.06], 'orange', { detail: 0, scale: [1.5, 0.8, 0.9] }),
      kit.sphere(0.055, [-0.02, WATER_TOP + 0.09, 0.06], 'sunYellow', { detail: 0, scale: [1.4, 0.5, 0.9] }),
      kit.wedge([0.1, 0.02, 0.12], [-0.2, WATER_TOP + 0.05, 0.06], 'red', { rotate: [0, Math.PI / 2, 0], apex: 0 }),
      kit.sphere(0.028, [0.14, WATER_TOP + 0.1, 0.11], 'white', { detail: 0 }),
      kit.sphere(0.028, [0.14, WATER_TOP + 0.1, 0.01], 'white', { detail: 0 }),
      kit.sphere(0.015, [0.165, WATER_TOP + 0.1, 0.11], 'charcoal', { detail: 0 }),
      kit.sphere(0.015, [0.165, WATER_TOP + 0.1, 0.01], 'charcoal', { detail: 0 }),
      // bubbles
      kit.sphere(0.03, [-0.18, WATER_TOP + 0.1, 0.18], 'glassBlue', { detail: 0 }),
      kit.sphere(0.022, [-0.2, WATER_TOP + 0.18, 0.2], 'glassBlue', { detail: 0 }),
    ];
    return kit.finish(parts);
  },
};

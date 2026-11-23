import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const SEAT_Y = 0.31; // top of the cushion

/** เก้าอี้สตูล: a round wooden stool with a red cushion. */
export const item: ItemModel = {
  id: 'stool',
  name: 'เก้าอี้สตูล',
  category: 'seating',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.27, 0.27, 0.04, [0, SEAT_Y - 0.06 - 0.02 + 0.0, 0], 'wood', { segments: 12 }),
      kit.cylinder(0.25, 0.26, 0.07, [0, SEAT_Y - 0.035, 0], 'red', { segments: 12 }),
      kit.sphere(0.03, [0, SEAT_Y + 0.005, 0], 'redDark', { detail: 0, scale: [1, 0.5, 1] }), // cushion button
      kit.torus(0.16, 0.015, [0, 0.1, 0], 'woodDark', { radialSegments: 4, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }),
    ];
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      parts.push(kit.cylinder(0.03, 0.035, 0.24, [0.16 * Math.cos(a), 0.12, 0.16 * Math.sin(a)], 'woodDark', { segments: 6 }));
    }
    return kit.finish(parts);
  },
};

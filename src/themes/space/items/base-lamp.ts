import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A futuristic lamp post (1×1): a teal base, a slim white pole with a blue stripe, a flat teal ring
// and a glowing warm globe that breathes at night.
const POLE_TOP = 1.2;

/** เสาไฟฐาน: a futuristic lamp post that glows at night. */
export const item: ItemModel = {
  id: 'base-lamp',
  name: 'เสาไฟฐาน',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.3, 0.34, 0.1, [0, 0.05, 0], 'stoneDark', { segments: 12 }),
      kit.cylinder(0.14, 0.24, 0.14, [0, 0.17, 0], 'teal', { segments: 12 }),
      kit.cylinder(0.05, 0.05, POLE_TOP - 0.24, [0, 0.24 + (POLE_TOP - 0.24) / 2, 0], 'white', { segments: 8 }),
      kit.cylinder(0.055, 0.055, 0.1, [0, 0.55, 0], 'blue', { segments: 8 }),
      kit.cylinder(0.055, 0.055, 0.1, [0, 0.85, 0], 'blue', { segments: 8 }),
      // head: collar, ring round the globe, globe, little cap
      kit.cylinder(0.1, 0.07, 0.08, [0, POLE_TOP + 0.04, 0], 'teal', { segments: 10 }),
      kit.sphere(0.17, [0, POLE_TOP + 0.24, 0], 'lampWarm', { glow: true, light: 'breathe' }),
      kit.torus(0.2, 0.03, [0, POLE_TOP + 0.24, 0], 'teal', { radialSegments: 4, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }),
      kit.cone(0.1, 0.12, [0, POLE_TOP + 0.5, 0], 'orange', { segments: 8 }),
    ];
    return kit.finish(parts);
  },
};

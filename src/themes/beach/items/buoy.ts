import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// A red-and-white buoy bobbing in a small square patch of sea (1×1) edged with a few rocks.
const WATER: MotionOpts = { kind: 'water', water: 'pond' };
const SEA_H = 0.06;

/** ทุ่นลอยน้ำ: a red-and-white buoy floating in a small patch of water. */
export const item: ItemModel = {
  id: 'buoy',
  name: 'ทุ่นลอยน้ำ',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.96, SEA_H, 0.96], [0, SEA_H / 2, 0], 'navy', { motion: WATER }),
      // corner rocks
      kit.sphere(0.1, [0.36, SEA_H + 0.035, -0.36], 'stoneDark', { detail: 0, scale: [1.2, 0.8, 1] }),
      kit.sphere(0.08, [-0.38, SEA_H + 0.03, 0.38], 'stone', { detail: 0, scale: [1.2, 0.8, 1] }),
      // buoy: stacked bands, tapered cap, mast and lamp
      kit.cylinder(0.2, 0.26, 0.14, [0, SEA_H + 0.07, 0], 'red', { segments: 10 }),
      kit.cylinder(0.2, 0.2, 0.12, [0, SEA_H + 0.2, 0], 'white', { segments: 10 }),
      kit.cylinder(0.19, 0.2, 0.12, [0, SEA_H + 0.32, 0], 'red', { segments: 10 }),
      kit.cylinder(0.1, 0.19, 0.1, [0, SEA_H + 0.43, 0], 'white', { segments: 10 }),
      kit.cylinder(0.025, 0.03, 0.22, [0, SEA_H + 0.59, 0], 'charcoal', { segments: 6 }),
      kit.sphere(0.07, [0, SEA_H + 0.74, 0], 'sunYellow', { detail: 0 }),
      // lifting ring on the side facing +x
      kit.torus(0.07, 0.018, [0.24, SEA_H + 0.2, 0], 'stoneDark', { radialSegments: 4, tubularSegments: 8 }),
      // a small orange float
      kit.sphere(0.075, [-0.3, SEA_H + 0.045, -0.25], 'orange', { detail: 0 }),
    ];
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const PAD = { r: 0.15, h: 0.05, xs: [-0.2, 0.2], zs: [-0.55, 0.55] }; // the glowing hover pads under the hull
const HULL_Y = 0.27;

/** ยานลอยตัว: a sleek hover sled, orange hull and glass canopy, with glowing pads underneath that breathe. */
export const item: ItemModel = {
  id: 'hover-sled',
  name: 'ยานลอยตัว',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      // streamlined hull: a long squashed egg, white belly stripe and blue nose
      kit.sphere(1, [0, HULL_Y, 0], 'orange', { detail: 2, scale: [0.3, 0.14, 0.86] }),
      kit.sphere(1, [0, HULL_Y - 0.06, 0], 'white', { detail: 1, scale: [0.32, 0.07, 0.8] }),
      kit.sphere(0.12, [0, HULL_Y, 0.78], 'blue', { detail: 1, scale: [1.1, 0.9, 1.2] }),
      // canopy, lit at night
      kit.dome(0.2, [0, HULL_Y + 0.06, 0.3], 'skyBlue', { segments: 12, scale: [1, 0.85, 1.4], glow: 'windowWarm', light: 'window' }),
      // tail fins
      kit.box([0.04, 0.26, 0.3], [0, HULL_Y + 0.16, -0.75], 'blue', { rotate: [0.3, 0, 0] }),
      kit.box([0.5, 0.04, 0.22], [0, HULL_Y + 0.04, -0.82], 'blue'),
      // side stripes
      kit.box([0.02, 0.04, 0.9], [0.285, HULL_Y + 0.02, -0.05], 'sunYellow'),
      kit.box([0.02, 0.04, 0.9], [-0.285, HULL_Y + 0.02, -0.05], 'sunYellow'),
    ];
    // pads: dark housings on the hull, glowing discs on the ground that breathe together
    for (const x of PAD.xs) {
      for (const z of PAD.zs) {
        parts.push(
          kit.cylinder(0.07, 0.09, 0.13, [x, 0.115, z], 'charcoal', { segments: 8 }),
          kit.cylinder(PAD.r, PAD.r, PAD.h, [x, PAD.h / 2, z], 'mint', { segments: 12, glow: true, light: 'breathe' }),
        );
      }
    }
    return kit.finish(parts);
  },
};

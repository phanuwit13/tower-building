import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { aim } from '../../../models/parts';

const G = 0.03;
const PLATE = { r: 0.19, h: 0.04 };
const PIV_Y = G + PLATE.h; // each rider rocks about the middle of its spring base (the axis runs along z, so it rocks forwards and back)
const SPRING_TOP = 0.4;
const RING_YS = [0.13, 0.21, 0.29, 0.37];
const AMOUNT = 0.12; // radians (about 7 degrees)
// Lowest moving point: the body's underside, 0.31 above the pivot and at most 0.26 sideways: 0.31 cos(0.12) - 0.26 sin(0.12) = 0.28
// above the pivot (0.35 above ground), so nothing touches the plate (top 0.07) or the floor (0.03).
// Furthest forward: the horse's snout at 0.43 across and 0.70 up swings to x = 0.43 cos(0.12) + 0.63 sin(0.12) = 0.50 from its axis,
// still inside the footprint (x up to 0.5 with the plate's own offset of 0): kept small by AMOUNT.
const rock = (z: number, phase: number): MotionOpts => ({ kind: 'swing', pivot: [0, PIV_Y, z], axis: [0, 0, 1], amount: AMOUNT, speed: 1.8, phase });

function spring(kit: Parameters<ItemModel['build']>[0], z: number, color: PaletteColor, motion: MotionOpts): Part[] {
  const parts: Part[] = [
    kit.cylinder(0.02, 0.02, SPRING_TOP - PIV_Y, [0, (SPRING_TOP + PIV_Y) / 2, z], 'chrome', { segments: 6, motion }),
    kit.cylinder(0.07, 0.07, 0.03, [0, SPRING_TOP + 0.015, z], color, { segments: 8, motion }),
  ];
  for (const y of RING_YS) {
    parts.push(kit.torus(0.065, 0.017, [0, y, z], color, { radialSegments: 3, tubularSegments: 8, rotate: [Math.PI / 2, 0, 0], motion }));
  }
  return parts;
}

/** ตุ๊กตาสปริงโยก: two spring riders, a yellow duck and a brown horse, that rock gently on their springs. */
export const item: ItemModel = {
  id: 'spring-riders',
  name: 'ตุ๊กตาสปริงโยก',
  category: 'play',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.96, G, 1.96], [0, G / 2, 0], 'lime')];
    const duckZ = -0.42;
    const horseZ = 0.42;
    for (const z of [duckZ, horseZ]) parts.push(kit.cylinder(PLATE.r, PLATE.r, PLATE.h, [0, G + PLATE.h / 2, z], 'red', { segments: 12 }));

    // duck, facing +x
    const dm = rock(duckZ, 0);
    parts.push(
      ...spring(kit, duckZ, 'orange', dm),
      kit.sphere(0.17, [0, 0.54, duckZ], 'sunYellow', { scale: [1.15, 0.85, 0.85], motion: dm }),
      kit.sphere(0.1, [0.17, 0.7, duckZ], 'sunYellow', { detail: 0, motion: dm }),
      kit.wedge([0.1, 0.04, 0.09], [0.29, 0.68, duckZ], 'orange', { rotate: [0, 0, 0], motion: dm }),
      kit.cone(0.05, 0.12, [-0.2, 0.62, duckZ], 'sunYellow', { segments: 6, rotate: [0, 0, 1.2], motion: dm }),
    );
    for (const s of [-1, 1]) {
      parts.push(
        kit.sphere(0.02, [0.24, 0.74, duckZ + s * 0.06], 'charcoal', { detail: 0, motion: dm }),
        kit.sphere(0.08, [-0.02, 0.54, duckZ + s * 0.13], 'orange', { scale: [1, 0.6, 0.3], detail: 0, motion: dm }),
      );
    }

    // horse, facing +x
    const hm = rock(horseZ, 1.7);
    parts.push(
      ...spring(kit, horseZ, 'blue', hm),
      kit.sphere(0.17, [0, 0.54, horseZ], 'wood', { scale: [1.5, 0.8, 0.7], motion: hm }),
      kit.cylinder(0.06, 0.07, 0.2, [0.22, 0.65, horseZ], 'wood', { rotate: aim([0.13, 0.18, 0]), segments: 8, motion: hm }),
      kit.sphere(0.08, [0.33, 0.76, horseZ], 'wood', { scale: [1.4, 0.8, 0.8], detail: 0, motion: hm }),
      kit.sphere(0.05, [0.41, 0.73, horseZ], 'cream', { detail: 0, motion: hm }),
      kit.box([0.2, 0.04, 0.2], [0, 0.69, horseZ], 'red', { motion: hm }),
      kit.cone(0.06, 0.18, [-0.27, 0.5, horseZ], 'woodDark', { segments: 6, rotate: [0, 0, 2.3], motion: hm }),
    );
    for (const s of [-1, 1]) {
      parts.push(
        kit.cone(0.025, 0.07, [0.3, 0.85, horseZ + s * 0.04], 'woodDark', { segments: 4, motion: hm }),
        kit.sphere(0.018, [0.35, 0.79, horseZ + s * 0.065], 'charcoal', { detail: 0, motion: hm }),
        kit.sphere(0.045, [0.2, 0.73, horseZ + s * 0.0], 'woodDark', { detail: 0, scale: [0.6, 1, 0.5], motion: hm }),
      );
    }
    return kit.finish(parts);
  },
};

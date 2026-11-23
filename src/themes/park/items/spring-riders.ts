import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { aim } from '../../../models/parts';

const G = 0.03;
const PLATE = { r: 0.22, h: 0.05 };
const PIV_Y = G + PLATE.h; // each rider rocks about the middle of its spring base (the axis runs along z, so it rocks forwards and back)
const SPRING_TOP = 0.42;
const RING_YS = [0.14, 0.22, 0.3, 0.38];
const AMOUNT = 0.08; // radians (about 4.6 degrees)
// Extremes at +-0.08 rad, from EDGES of the moving parts (x measured from the rider's own axis, rest pose):
// furthest forward is the horse's snout edge at x 0.39, up to 0.88 above the pivot: 0.39 cos(0.08) + 0.88 sin(0.08) = 0.46 (< 0.5);
// the duck's beak edge is x 0.33 at 0.7 above: 0.40. Backwards is the duck's tail edge at -0.34: smaller still.
// Lowest: the body underside is 0.346 above the pivot with at most 0.25 sideways: 0.346 cos - 0.25 sin = 0.325, i.e. 0.395 above
// the ground, well clear of the plate (top 0.08) and the floor (0.03). z never changes (the axis runs along z).
const rock = (z: number, phase: number): MotionOpts => ({ kind: 'swing', pivot: [0, PIV_Y, z], axis: [0, 0, 1], amount: AMOUNT, speed: 1.8, phase });

function spring(kit: Parameters<ItemModel['build']>[0], z: number, color: PaletteColor, motion: MotionOpts): Part[] {
  const parts: Part[] = [
    kit.cylinder(0.03, 0.03, SPRING_TOP - PIV_Y, [0, (SPRING_TOP + PIV_Y) / 2, z], 'chrome', { segments: 6, motion }),
    kit.cylinder(0.09, 0.09, 0.03, [0, SPRING_TOP + 0.015, z], color, { segments: 8, motion }),
  ];
  for (const y of RING_YS) {
    parts.push(kit.torus(0.08, 0.025, [0, y, z], color, { radialSegments: 3, tubularSegments: 8, rotate: [Math.PI / 2, 0, 0], motion }));
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

    // duck, facing +x: round yellow body, big head, orange beak, flat tail
    const dm = rock(duckZ, 0);
    parts.push(
      ...spring(kit, duckZ, 'orange', dm),
      kit.sphere(0.2, [-0.02, 0.58, duckZ], 'sunYellow', { scale: [1.1, 0.9, 0.9], motion: dm }),
      kit.sphere(0.13, [0.14, 0.8, duckZ], 'sunYellow', { motion: dm }),
      kit.box([0.12, 0.04, 0.1], [0.27, 0.77, duckZ], 'orange', { motion: dm }),
      kit.box([0.12, 0.05, 0.05], [0.26, 0.73, duckZ], 'orange', { motion: dm }),
      kit.box([0.16, 0.04, 0.14], [-0.26, 0.64, duckZ], 'sunYellow', { rotate: [0, 0, 0.25], motion: dm }),
    );
    for (const s of [-1, 1]) {
      parts.push(
        kit.sphere(0.025, [0.2, 0.86, duckZ + s * 0.09], 'charcoal', { detail: 0, motion: dm }),
        kit.sphere(0.09, [-0.03, 0.58, duckZ + s * 0.17], 'orange', { scale: [1, 0.6, 0.3], detail: 0, motion: dm }),
      );
    }

    // horse, facing +x: brown body, long head, dark mane, ears and tail, red saddle
    const hm = rock(horseZ, 1.7);
    parts.push(
      ...spring(kit, horseZ, 'blue', hm),
      kit.sphere(0.18, [0, 0.58, horseZ], 'wood', { scale: [1.4, 0.8, 0.8], motion: hm }),
      kit.cylinder(0.07, 0.08, 0.3, [0.13, 0.74, horseZ], 'wood', { rotate: aim([0.08, 0.3, 0]), segments: 8, motion: hm }),
      kit.sphere(0.07, [0.22, 0.89, horseZ], 'wood', { scale: [1.9, 0.9, 0.8], detail: 0, motion: hm }),
      kit.sphere(0.045, [0.34, 0.86, horseZ], 'cream', { detail: 0, motion: hm }),
      kit.box([0.2, 0.04, 0.22], [0, 0.72, horseZ], 'red', { motion: hm }),
      kit.cone(0.07, 0.24, [-0.28, 0.5, horseZ], 'woodDark', { segments: 6, rotate: [0, 0, 2.5], motion: hm }),
    );
    for (const [x, y] of [[0.07, 0.95], [0.1, 0.86], [0.13, 0.77], [0.16, 0.68]]) {
      parts.push(kit.sphere(0.05, [x - 0.06, y, horseZ], 'woodDark', { detail: 0, scale: [0.8, 1.1, 0.8], motion: hm }));
    }
    for (const s of [-1, 1]) {
      parts.push(
        kit.cone(0.028, 0.08, [0.17, 0.99, horseZ + s * 0.045], 'woodDark', { segments: 4, motion: hm }),
        kit.sphere(0.02, [0.25, 0.92, horseZ + s * 0.06], 'charcoal', { detail: 0, motion: hm }),
      );
    }
    return kit.finish(parts);
  },
};

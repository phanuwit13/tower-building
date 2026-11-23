import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A round wooden tub (hooped with dark bands) filled with water; three fat ducks float in it.
const TUB = { r: 0.42, h: 0.24 };
const WATER = { r: 0.37, top: 0.27 };
const RIM = { r: 0.4, tube: 0.04, y: 0.275 };
const DUCK = { body: 0.1, head: 0.065 };
/** Ducks: [x, z, yaw, colour]. */
const DUCKS: Array<[number, number, number, PaletteColor]> = [[0.1, 0.12, 0.6, 'sunYellow'], [-0.14, -0.1, 3.3, 'sunYellow'], [0.04, -0.2, 5.4, 'white']];

/** เป็ดในอ่าง: a round wooden tub of water with three ducks. */
export const item: ItemModel = {
  id: 'duck-tub',
  name: 'เป็ดในอ่าง',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(TUB.r, TUB.r, TUB.h, [0, TUB.h / 2, 0], 'wood', { segments: 12 }),
      kit.cylinder(WATER.r, WATER.r, 0.03, [0, WATER.top - 0.015, 0], 'skyBlue', { segments: 12, motion: { kind: 'water', water: 'pool' } }),
      kit.torus(RIM.r, RIM.tube, [0, RIM.y, 0], 'woodDark', { radialSegments: 4, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(TUB.r + 0.008, TUB.r + 0.008, 0.035, [0, 0.06, 0], 'woodDark', { segments: 12 }), // hoops
      kit.cylinder(TUB.r + 0.008, TUB.r + 0.008, 0.035, [0, 0.18, 0], 'woodDark', { segments: 12 }),
    ];
    for (const [x, z, yaw, color] of DUCKS) {
      const c = Math.cos(yaw);
      const s = Math.sin(yaw);
      /** Local (forward, up) in the duck's own frame, turned by `yaw`. */
      const at = (f: number, up: number, side = 0): Vec3 => [x + f * c + side * s, WATER.top + up, z - f * s + side * c];
      const rotate: Vec3 = [0, yaw, 0];
      parts.push(
        kit.sphere(DUCK.body, at(0, DUCK.body * 0.5), color, { detail: 0, scale: [1.25, 0.85, 1], rotate }),
        kit.sphere(DUCK.head, at(0.1, DUCK.body * 1.35), color, { detail: 0 }),
        kit.box([0.06, 0.025, 0.07], at(0.18, DUCK.body * 1.28), 'orange', { rotate }),
        kit.box([0.06, 0.05, 0.05], at(-0.13, DUCK.body * 1.0), color, { rotate: [0, yaw, 0.5] }),
        kit.sphere(0.018, at(0.145, DUCK.body * 1.5, 0.045), 'charcoal', { detail: 0 }),
        kit.sphere(0.018, at(0.145, DUCK.body * 1.5, -0.045), 'charcoal', { detail: 0 }),
      );
    }
    // a few soap bubbles
    parts.push(
      kit.sphere(0.035, [-0.2, WATER.top + 0.03, 0.2], 'white', { detail: 0 }),
      kit.sphere(0.03, [0.25, WATER.top + 0.025, -0.15], 'white', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A round wooden tub with two dark hoops, packed with leaves and bright flowers on short stems.
const TUB = { rTop: 0.42, rBottom: 0.36, h: 0.36 };
const RIM_Y = TUB.h;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, RIM_Y, 0], amount: 0.12 };
const MOUND = { r: 0.36, squash: 0.7 };
const FLOWER = { r: 0.085, h: 0.045, centre: 0.035 };
/** Flowers: [distance from the middle, angle (radians), head height above the rim, colour]. */
const FLOWERS: Array<[number, number, number, PaletteColor]> = [
  [0, 0, 0.36, 'sunYellow'],
  [0.17, 0.4, 0.3, 'pink'], [0.17, 2.5, 0.32, 'red'], [0.17, 4.5, 0.28, 'purple'],
  [0.3, 1.3, 0.2, 'orange'], [0.3, 2.3, 0.24, 'sunYellow'], [0.3, 3.4, 0.2, 'pink'],
  [0.3, 4.4, 0.24, 'red'], [0.3, 5.3, 0.2, 'purple'], [0.3, 0.2, 0.22, 'orange'],
];
const LEAVES: Array<[number, PaletteColor]> = [[0.3, 'leafDark'], [1.3, 'leaf'], [2.3, 'leafDark'], [3.3, 'leaf'], [4.3, 'leafDark'], [5.3, 'leaf']];

/** กระถางดอกไม้: a round wooden tub overflowing with bright flowers (this is the amusement one, with its own look). */
export const item: ItemModel = {
  id: 'flower-tub',
  name: 'กระถางดอกไม้',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(TUB.rTop, TUB.rBottom, TUB.h, [0, TUB.h / 2, 0], 'wood'),
      kit.cylinder(TUB.rBottom + 0.02, TUB.rBottom + 0.02, 0.05, [0, 0.1, 0], 'woodDark'),
      kit.cylinder(TUB.rTop + 0.02, TUB.rTop + 0.02, 0.05, [0, TUB.h - 0.07, 0], 'woodDark'),
      kit.sphere(MOUND.r, [0, RIM_Y - 0.02, 0], 'leaf', { scale: [1, MOUND.squash, 1], motion: SWAY }),
    ];
    for (const [a, color] of LEAVES) {
      const d: Vec3 = [Math.cos(a), 0, -Math.sin(a)];
      const r = 0.3;
      parts.push(kit.cylinder(1, 1, 0.02, [d[0] * r, RIM_Y + 0.05, d[2] * r], color, { segments: 4, scale: [0.18, 1, 0.1], rotate: [0, a, -0.25], motion: SWAY }));
    }
    for (const [d, a, h, color] of FLOWERS) {
      const x = d * Math.cos(a);
      const z = -d * Math.sin(a);
      const top = RIM_Y + h;
      const stemBase = RIM_Y + 0.08;
      parts.push(kit.cylinder(0.014, 0.014, top - stemBase, [x, (top + stemBase) / 2, z], 'leaf', { segments: 4, motion: SWAY }));
      for (const turn of [0, Math.PI / 4]) {
        parts.push(kit.cone(FLOWER.r, FLOWER.h, [x, top - FLOWER.h / 2, z], color, { segments: 4, rotate: [Math.PI, turn + a, 0], motion: SWAY }));
      }
      parts.push(kit.sphere(FLOWER.centre, [x, top, z], color === 'sunYellow' ? 'orange' : 'sunYellow', { detail: 0, motion: SWAY }));
    }
    return kit.finish(parts);
  },
};

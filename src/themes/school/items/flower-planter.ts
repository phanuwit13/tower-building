import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A terracotta pot on a `redDark` foot.
const FOOT = { r: 0.22, h: 0.05 }; // little foot ring under the pot
const POT = { rTop: 0.3, rBottom: 0.22, h: 0.34 };
const POT_TOP = FOOT.h + POT.h;
const RIM = { r: 0.34, h: 0.09 }; // thick rolled lip
const RIM_TOP = POT_TOP + RIM.h;
const MOUND = { r: 0.31, squash: 0.62, sink: 0.03 }; // leafy bush: a squashed ball sunk into the pot
/** Leaves reaching out over the lip: angle around the pot (radians) and colour. */
const SPILL: Array<[number, PaletteColor]> = [[0.2, 'leafDark'], [1.25, 'leaf'], [2.3, 'leafDark'], [3.35, 'leaf'], [4.4, 'leafDark'], [5.45, 'leaf']];
const SPILL_LEAF = { len: 0.21, w: 0.12, droop: 0.25, t: 0.02, from: 0.21, lift: 0.055 }; // starts `from` out and `lift` above the lip, so it clears the lip
// The leafy mound, spilling leaves and flowers sway together about the pot's rim; the pot stays.
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, RIM_TOP, 0], amount: 0.15 };
const FLOWER = { r: 0.07, h: 0.04, centre: 0.032 };
/** Flowers on the mound: [distance from the middle, angle (radians), colour]. */
const FLOWERS: Array<[number, number, PaletteColor]> = [
  [0, 0, 'pink'],
  [0.14, 0.5, 'sunYellow'], [0.14, 2.6, 'purple'], [0.14, 4.6, 'pink'],
  [0.23, 1.5, 'purple'], [0.23, 3.6, 'sunYellow'], [0.23, 5.6, 'purple'], [0.23, -0.4 + Math.PI, 'pink'],
];

/** กระถางดอกไม้: a big terracotta pot with a mound of leaves and pink, yellow and purple flowers. */
export const item: ItemModel = {
  id: 'flower-planter',
  name: 'กระถางดอกไม้',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(FOOT.r, FOOT.r, FOOT.h, [0, FOOT.h / 2, 0], 'redDark'),
      kit.cylinder(POT.rTop, POT.rBottom, POT.h, [0, FOOT.h + POT.h / 2, 0], 'terracotta'),
      kit.cylinder(RIM.r, RIM.r - 0.02, RIM.h, [0, POT_TOP + RIM.h / 2, 0], 'terracotta'),
      kit.sphere(MOUND.r, [0, RIM_TOP - MOUND.sink, 0], 'leaf', { scale: [1, MOUND.squash, 1], motion: SWAY }),
    ];
    for (const [a, color] of SPILL) {
      // a flat pointed leaf (a squashed four-sided cylinder) tipping down a little over the lip
      const d: Vec3 = [Math.cos(a), 0, -Math.sin(a)];
      const r = SPILL_LEAF.from + (SPILL_LEAF.len / 2) * Math.cos(SPILL_LEAF.droop);
      parts.push(kit.cylinder(1, 1, SPILL_LEAF.t, [d[0] * r, RIM_TOP + SPILL_LEAF.lift - (SPILL_LEAF.len / 2) * Math.sin(SPILL_LEAF.droop), d[2] * r], color, {
        segments: 4, scale: [SPILL_LEAF.len / 2, 1, SPILL_LEAF.w / 2], rotate: [0, a, -SPILL_LEAF.droop], motion: SWAY,
      }));
    }
    for (const [d, a, color] of FLOWERS) {
      // A flower is two upside-down four-sided cones turned 45° apart (a flat eight-petal star on
      // top) with a small upside-down cone for its middle. It sits on the mound's surface.
      const top = RIM_TOP - MOUND.sink + MOUND.squash * Math.sqrt(MOUND.r ** 2 - d ** 2) + 0.012 + d * 0.12;
      const x = d * Math.cos(a);
      const z = -d * Math.sin(a);
      for (const turn of [0, Math.PI / 4]) {
        parts.push(kit.cone(FLOWER.r, FLOWER.h, [x, top - FLOWER.h / 2, z], color, { segments: 4, rotate: [Math.PI, turn + a, 0], motion: SWAY }));
      }
      parts.push(kit.sphere(FLOWER.centre, [x, top, z], color === 'sunYellow' ? 'orange' : 'sunYellow', { detail: 0, motion: SWAY }));
    }
    return kit.finish(parts);
  },
};

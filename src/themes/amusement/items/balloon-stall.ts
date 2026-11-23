import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { aim, wallPanel } from '../../../models/parts';

// A little push cart (long side along z) with a gas tank, a pole at the middle and a bunch of balloons on strings.
const BODY = { w: 0.6, h: 0.4, l: 1.4, y0: 0.16 };
const COUNTER = { w: 0.66, h: 0.05, l: 1.46 };
const TOP = BODY.y0 + BODY.h + COUNTER.h; // 0.61
const HUB = [0, 0.96, -0.3] as const; // where the strings meet, on top of the pole
const BALLOON = { r: 0.17, stretch: 1.2 };
/** Balloon centre x, y, z and colour. */
const BALLOONS: Array<[number, number, number, PaletteColor]> = [
  [0.12, 1.62, -0.55, 'red'], [-0.15, 1.72, -0.2, 'blue'], [0.1, 1.8, 0.05, 'sunYellow'], [-0.1, 1.62, 0.3, 'pink'],
  [0.12, 1.95, -0.25, 'leaf'], [-0.12, 1.95, 0.2, 'purple'], [0, 2.12, -0.05, 'orange'],
];
const SWAY: MotionOpts = { kind: 'sway', pivot: [...HUB], amount: 0.09 }; // the balloons lean together from the pole top

/** ร้านลูกโป่ง: a push cart with a tank and a big bunch of balloons floating above it. */
export const item: ItemModel = {
  id: 'balloon-stall',
  name: 'ร้านลูกโป่ง',
  category: 'building',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BODY.w, BODY.h, BODY.l], [0, BODY.y0 + BODY.h / 2, 0], 'teal'),
      kit.box([COUNTER.w, COUNTER.h, COUNTER.l], [0, BODY.y0 + BODY.h + COUNTER.h / 2, 0], 'sunYellow'),
      ...wallPanel(kit, { at: [BODY.w / 2, BODY.y0 + BODY.h / 2, 0], facing: 'x+', w: 1.1, h: 0.28, depth: 0.03, color: 'white' }),
      kit.sphere(0.07, [BODY.w / 2 + 0.04, BODY.y0 + BODY.h / 2, -0.34], 'red', { detail: 0 }),
      kit.sphere(0.07, [BODY.w / 2 + 0.04, BODY.y0 + BODY.h / 2, 0], 'blue', { detail: 0 }),
      kit.sphere(0.07, [BODY.w / 2 + 0.04, BODY.y0 + BODY.h / 2, 0.34], 'pink', { detail: 0 }),
      // handle at the -z end
      kit.box([0.04, 0.04, 0.3], [0.22, 0.6, -0.85], 'woodDark'),
      kit.box([0.04, 0.04, 0.3], [-0.22, 0.6, -0.85], 'woodDark'),
      kit.box([0.5, 0.04, 0.04], [0, 0.6, -0.97], 'woodDark'),
      // gas tank and the pole the strings hang from
      kit.cylinder(0.09, 0.09, 0.4, [0, TOP + 0.2, 0.5], 'chrome', { segments: 10 }),
      kit.sphere(0.05, [0, TOP + 0.4, 0.5], 'red', { detail: 0 }),
      kit.cylinder(0.03, 0.03, HUB[1] - TOP, [0, (TOP + HUB[1]) / 2, HUB[2]], 'chrome', { segments: 6 }),
    ];
    for (const x of [-0.34, 0.34]) {
      for (const z of [-0.5, 0.5]) parts.push(kit.cylinder(0.14, 0.14, 0.06, [x, 0.14, z], 'charcoal', { segments: 12, rotate: [0, 0, Math.PI / 2] }));
    }
    /** A string from the pole top up to a balloon's knot (it leans with the balloons). */
    const string = (to: [number, number, number]): Part => {
      const d: [number, number, number] = [to[0] - HUB[0], to[1] - HUB[1], to[2] - HUB[2]];
      const mid: [number, number, number] = [HUB[0] + d[0] / 2, HUB[1] + d[1] / 2, HUB[2] + d[2] / 2];
      return kit.cylinder(0.012, 0.012, Math.hypot(...d), mid, 'white', { segments: 4, rotate: aim(d), motion: SWAY });
    };
    for (const [x, y, z, color] of BALLOONS) {
      parts.push(
        kit.sphere(BALLOON.r, [x, y, z], color, { scale: [1, BALLOON.stretch, 1], motion: SWAY }),
        string([x, y - BALLOON.r * BALLOON.stretch + 0.02, z]),
      );
    }
    return kit.finish(parts);
  },
};

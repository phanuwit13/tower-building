import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { aim, wheel, wallPanel } from '../../../models/parts';

// A little push cart (1x2, long side along z): a wooden box with a yellow counter and a push handle at the -z
// end, on four small wheels. A slim pole holds the knot of a big bunch of balloons; they bob together from that
// tie point.
const BODY = { w: 0.5, h: 0.36, l: 1.2, y0: 0.2 };
const COUNTER = { w: 0.56, h: 0.05, l: 1.26 };
const TOP = BODY.y0 + BODY.h + COUNTER.h; // 0.61
const HUB: [number, number, number] = [0, 1.0, 0.25]; // the tie point, on top of the pole
const BALLOON = { r: 0.15, stretch: 1.18 };
/** Balloon centre x, y, z and colour (all within 0.2 of the pole so the bunch stays in the footprint). */
const BALLOONS: Array<[number, number, number, PaletteColor]> = [
  [0.14, 1.5, 0.12, 'red'], [-0.14, 1.55, 0.3, 'blue'], [0.12, 1.62, 0.42, 'sunYellow'], [-0.12, 1.5, 0.05, 'pink'],
  [0.0, 1.85, 0.25, 'leaf'], [0.15, 1.8, 0.28, 'purple'], [-0.15, 1.8, 0.2, 'orange'], [0.0, 1.62, 0.18, 'mint'], [0.0, 1.55, 0.42, 'white'],
];
const SWAY: MotionOpts = { kind: 'sway', pivot: HUB, amount: 0.06 };

/** รถขายลูกโป่ง: a push cart with a bunch of colourful balloons bobbing on strings. */
export const item: ItemModel = {
  id: 'balloon-cart',
  name: 'รถขายลูกโป่ง',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BODY.w, BODY.h, BODY.l], [0, BODY.y0 + BODY.h / 2, 0.1], 'wood'),
      kit.box([COUNTER.w, COUNTER.h, COUNTER.l], [0, BODY.y0 + BODY.h + COUNTER.h / 2, 0.1], 'sunYellow'),
      ...wallPanel(kit, { at: [BODY.w / 2, BODY.y0 + BODY.h / 2, 0.1], facing: 'x+', w: 0.9, h: 0.2, depth: 0.03, color: 'redDark' }),
      kit.sphere(0.06, [BODY.w / 2 + 0.05, BODY.y0 + BODY.h / 2, -0.2], 'sunYellow', { detail: 0 }),
      kit.sphere(0.06, [BODY.w / 2 + 0.05, BODY.y0 + BODY.h / 2, 0.1], 'sunYellow', { detail: 0 }),
      kit.sphere(0.06, [BODY.w / 2 + 0.05, BODY.y0 + BODY.h / 2, 0.4], 'sunYellow', { detail: 0 }),
      // the push handle at the -z end
      kit.box([0.04, 0.04, 0.3], [0.2, 0.62, -0.78], 'woodDark'),
      kit.box([0.04, 0.04, 0.3], [-0.2, 0.62, -0.78], 'woodDark'),
      kit.box([0.44, 0.04, 0.04], [0, 0.62, -0.93], 'woodDark'),
      // the pole the strings hang from
      kit.cylinder(0.03, 0.03, HUB[1] - TOP, [HUB[0], (TOP + HUB[1]) / 2, HUB[2]], 'chrome', { segments: 6 }),
      kit.sphere(0.045, HUB, 'red', { detail: 0 }),
    ];
    for (const x of [-0.31, 0.31]) {
      for (const z of [-0.4, 0.6]) parts.push(...wheel(kit, { at: [x, 0.14, z], radius: 0.1, tube: 0.04, axis: 'x', color: 'charcoal', hubColor: 'stone', hubRadius: 0.04, hubLength: 0.05, tubularSegments: 8 }));
    }
    for (const [x, y, z, color] of BALLOONS) {
      const knot: [number, number, number] = [x, y - BALLOON.r * BALLOON.stretch + 0.02, z];
      const d: [number, number, number] = [knot[0] - HUB[0], knot[1] - HUB[1], knot[2] - HUB[2]];
      parts.push(
        kit.sphere(BALLOON.r, [x, y, z], color, { scale: [1, BALLOON.stretch, 1], motion: SWAY }),
        kit.cylinder(0.012, 0.012, Math.hypot(...d), [HUB[0] + d[0] / 2, HUB[1] + d[1] / 2, HUB[2] + d[2] / 2], 'white', { segments: 4, rotate: aim(d), motion: SWAY }),
      );
    }
    return kit.finish(parts);
  },
};

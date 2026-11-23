import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

const BASE = { s: 0.5, h: 0.05 };
const POST = { r: 0.05, h: 0.7 };
const POST_TOP = BASE.h + POST.h;
const BODY = { w: 0.36, h: 0.26, d: 0.28 };
const BODY_X = -0.1;
const BODY_Y = POST_TOP + BODY.h / 2;
/** Bubbles drifting out of the ring: [x, y above the body centre, z, radius, colour]. */
const BUBBLES: Array<[number, number, number, number, PaletteColor]> = [
  [0.2, 0.08, 0, 0.1, 'glassBlue'], [0.3, 0.27, 0.07, 0.13, 'white'], [0.17, 0.4, -0.1, 0.1, 'mint'],
  [0.33, 0.52, -0.05, 0.08, 'glassBlue'], [0.22, 0.62, 0.12, 0.09, 'pink'], [0.1, 0.5, 0.15, 0.07, 'glassBlue'],
  [0.38, 0.17, -0.18, 0.06, 'white'],
];

/** เครื่องเป่าฟองสบู่: a small orange machine on a post, blowing a cluster of glassy bubbles. */
export const item: ItemModel = {
  id: 'bubble-machine',
  name: 'เครื่องเป่าฟองสบู่',
  category: 'play',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BASE.s, BASE.h, BASE.s], [BODY_X, BASE.h / 2, 0], 'stone'),
      kit.cylinder(POST.r, POST.r, POST.h, [BODY_X, BASE.h + POST.h / 2, 0], 'chrome', { segments: 8 }),
      kit.box([BODY.w, BODY.h, BODY.d], [BODY_X, BODY_Y, 0], 'orange'),
      kit.cylinder(0.09, 0.09, 0.16, [BODY_X - 0.02, BODY_Y + BODY.h / 2 + 0.08, 0], 'skyBlue', { segments: 8 }), // soap tank
      kit.box([0.1, 0.05, 0.1], [BODY_X + BODY.w / 2 - 0.05, BODY_Y - 0.12, 0.09], 'red'),
      kit.sphere(0.035, [BODY_X + BODY.w / 2, BODY_Y - 0.02, -0.09], 'lime', { detail: 0 }),
      // the wand ring on the front
      kit.torus(0.095, 0.025, [BODY_X + BODY.w / 2 + 0.03, BODY_Y + 0.02, 0], 'sunYellow', { rotate: [0, Math.PI / 2, 0], tubularSegments: 12 }),
    ];
    for (const [x, y, z, r, c] of BUBBLES) parts.push(kit.sphere(r, [x, BODY_Y + y, z], c));
    return kit.finish(parts);
  },
};

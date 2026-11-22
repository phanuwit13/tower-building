import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

const POLE_X = -0.18;
const POLE_TOP = 2.42;
const FLAG_W = 0.62;
const FLAG_TOP = 2.36;
const WAVE = 0.2; // each half of the flag turns this much (radians) for a gentle ripple
/** Thai flag, top to bottom: red, white, blue (double height), white, red. */
const STRIPES: Array<[PaletteColor, number]> = [['red', 1], ['white', 1], ['navy', 2], ['white', 1], ['red', 1]];
const STRIPE_H = 0.07;

/** เสาธง: the school flagpole on a stepped base, flying the Thai flag. */
export const item: ItemModel = {
  id: 'flagpole',
  name: 'เสาธง',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.6, 0.1, 0.6], [POLE_X, 0.05, 0], 'stone'),
      kit.box([0.38, 0.1, 0.38], [POLE_X, 0.15, 0], 'white'),
      kit.cylinder(0.035, 0.04, POLE_TOP - 0.2, [POLE_X, 0.2 + (POLE_TOP - 0.2) / 2, 0], 'white', { segments: 8 }),
      kit.sphere(0.06, [POLE_X, POLE_TOP + 0.04, 0], 'sunYellow', { detail: 0 }),
    ];
    // Two halves, angled in opposite directions: the flag looks like it ripples in the wind.
    const half = FLAG_W / 2;
    const x0 = POLE_X + 0.03;
    const xMid = x0 + half * Math.cos(WAVE);
    const zMid = -half * Math.sin(WAVE);
    let y = FLAG_TOP;
    for (const [color, n] of STRIPES) {
      const h = STRIPE_H * n;
      y -= h / 2;
      parts.push(
        kit.box([half, h, 0.02], [(x0 + xMid) / 2, y, zMid / 2], color, { rotate: [0, WAVE, 0] }),
        kit.box([half, h, 0.02], [xMid + (half / 2) * Math.cos(WAVE), y, zMid / 2], color, { rotate: [0, -WAVE, 0] }),
      );
      y -= h / 2;
    }
    return kit.finish(parts);
  },
};

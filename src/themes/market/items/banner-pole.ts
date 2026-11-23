import type { ItemModel } from '../../../models/contract';
import type { Part, PartOpts } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A street banner pole (1×1): a navy lamp-post with a warm globe on top and a long colourful banner (stripes and a sun, no letters) that ripples.
const POLE_X = -0.3;
const BANNER_Y = 1.4; // banner centre height
const BANNER_H = 0.8;
const STRIP_W = 0.18;
const STRIPS: PaletteColor[] = ['red', 'sunYellow', 'teal', 'purple'];
const WAVE: NonNullable<PartOpts['motion']> = { kind: 'wave', pivot: [POLE_X, BANNER_Y, 0], axis: [1, 0, 0], amount: 0.18 };

/** เสาธงประดับ: a lamp-post style pole with a colourful banner. */
export const item: ItemModel = {
  id: 'banner-pole',
  name: 'เสาธงประดับ',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.4, 0.42, 0.06, [0, 0.03, 0], 'stone', { segments: 12 }),
      kit.cylinder(0.08, 0.1, 0.18, [POLE_X, 0.15, 0], 'navy', { segments: 8 }),
      kit.cylinder(0.035, 0.045, 2.0, [POLE_X, 1.15, 0], 'navy', { segments: 8 }),
      kit.cylinder(0.06, 0.06, 0.05, [POLE_X, 2.18, 0], 'brass', { segments: 8 }),
      kit.sphere(0.11, [POLE_X, 2.3, 0], 'lampWarm', { glow: true, light: 'breathe' }),
      // top arm the banner hangs from
      kit.box([0.9, 0.035, 0.035], [0, BANNER_Y + BANNER_H / 2 + 0.02, 0], 'navy'),
      kit.sphere(0.05, [0.45, BANNER_Y + BANNER_H / 2 + 0.02, 0], 'sunYellow', { detail: 0, glow: true, light: 'breathe' }),
    ];
    STRIPS.forEach((c, i) => {
      const x = POLE_X + 0.05 + STRIP_W / 2 + i * STRIP_W;
      parts.push(kit.box([STRIP_W, BANNER_H, 0.02], [x, BANNER_Y, 0], c, { motion: WAVE }));
      // lit edges: a glowing strip along the bottom of each stripe
      parts.push(kit.box([STRIP_W, 0.05, 0.03], [x, BANNER_Y - BANNER_H / 2 + 0.025, 0], c, { motion: WAVE, glow: true }));
      // a pale diamond in each stripe
      parts.push(kit.box([STRIP_W * 0.6, 0.2, 0.03], [x, BANNER_Y, 0], 'white', { motion: WAVE, rotate: [0, 0, Math.PI / 4], scale: [0.8, 0.8, 1] }));
    });
    return kit.finish(parts);
  },
};

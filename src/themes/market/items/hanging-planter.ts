import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// An iron shepherd's-hook post (1×1) with a hanging flower basket. The basket, chain and hook stay
// still; the leaves and blooms sway a little about the basket rim.
const HOOK = { r: 0.2, top: 1.1 }; // arch radius, height of the arch ends
const BASKET = { x: HOOK.r, y: 0.78, r: 0.19 };
const RIM_Y = BASKET.y + 0.1;
const SWAY: MotionOpts = { kind: 'sway', pivot: [BASKET.x, RIM_Y, 0], amount: 0.15 };
const BLOOMS: [number, number, number, PaletteColor][] = [
  [0.1, 0.1, 0.05, 'pink'], [-0.08, 0.14, 0.1, 'sunYellow'], [0.0, 0.17, -0.1, 'purple'], [0.12, 0.13, -0.1, 'white'], [-0.1, 0.12, -0.08, 'orange'], [0.03, 0.2, 0.08, 'pink'],
];

/** กระถางแขวน: an iron hook post with a hanging basket of flowers. */
export const item: ItemModel = {
  id: 'hanging-planter',
  name: 'กระถางแขวน',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const chainTop = HOOK.top - 0.03;
    const parts: Part[] = [
      kit.cylinder(0.14, 0.16, 0.06, [-HOOK.r, 0.03, 0], 'stone', { segments: 10 }),
      kit.cylinder(0.03, 0.03, HOOK.top, [-HOOK.r, HOOK.top / 2, 0], 'charcoal', { segments: 8 }),
      kit.torus(HOOK.r, 0.025, [0, HOOK.top, 0], 'charcoal', { radialSegments: 6, tubularSegments: 12, arc: Math.PI }),
      kit.sphere(0.04, [HOOK.r, HOOK.top - 0.005, 0], 'brass', { detail: 0 }),
      // chain down to the basket (two thin rods) and the basket itself
      kit.cylinder(0.01, 0.01, chainTop - RIM_Y + 0.04, [BASKET.x, (chainTop + RIM_Y) / 2, 0], 'stoneDark', { segments: 4 }),
      kit.sphere(BASKET.r, [BASKET.x, BASKET.y, 0], 'terracotta', { detail: 1, scale: [1, 0.6, 1] }),
      kit.cylinder(BASKET.r * 0.95, BASKET.r * 0.95, 0.03, [BASKET.x, RIM_Y - 0.02, 0], 'redDark', { segments: 12 }),
      kit.sphere(0.2, [BASKET.x, RIM_Y + 0.03, 0], 'leaf', { detail: 1, scale: [1, 0.6, 1], motion: SWAY }),
      kit.sphere(0.12, [BASKET.x - 0.06, RIM_Y + 0.07, 0.07], 'leafDark', { detail: 0, motion: SWAY }),
      kit.sphere(0.11, [BASKET.x + 0.07, RIM_Y + 0.06, -0.06], 'lime', { detail: 0, motion: SWAY }),
    ];
    // fairy lights wound round the foliage
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      parts.push(kit.sphere(0.03, [BASKET.x + 0.2 * Math.cos(a), RIM_Y + 0.05, 0.2 * Math.sin(a)], i % 2 ? 'lampWarm' : 'pink', { detail: 0, glow: true, light: 'breathe', motion: SWAY }));
    }
    for (const [x, y, z, color] of BLOOMS) parts.push(kit.sphere(0.045, [BASKET.x + x, RIM_Y + y, z], color, { detail: 0, motion: SWAY }));
    return kit.finish(parts);
  },
};

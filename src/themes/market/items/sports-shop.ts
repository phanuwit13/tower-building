import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, glassWindow } from '../../../models/parts';

// A blue shop (2×2, front +x) with a big orange ball neon on the roof, and balls and rackets
// displayed out front.
const BASE_H = 0.03;
const SHOP = { x: -0.3, w: 1.2, d: 1.6, h: 0.9 };
const FRONT = SHOP.x + SHOP.w / 2;
const TOP = BASE_H + SHOP.h;
const SIGN = { x: 0.1, y: TOP + 0.08 + 0.38, w: 0.06, h: 0.76, d: 0.8 };
const BALL_R = 0.27;
const BALLS = [
  { z: -0.66, color: 'white' },
  { z: -0.52, color: 'red' },
  { z: -0.38, color: 'sunYellow' },
] as const;

/** ร้านกีฬา: a sports shop with balls and rackets on display and an orange ball neon. */
export const item: ItemModel = {
  id: 'sports-shop',
  name: 'ร้านกีฬา',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.96, BASE_H, 1.96], [0, BASE_H / 2, 0], 'stone'),
      kit.box([SHOP.w, SHOP.h, SHOP.d], [SHOP.x, BASE_H + SHOP.h / 2, 0], 'blue'),
      kit.box([SHOP.w + 0.01, 0.1, SHOP.d + 0.01], [SHOP.x, BASE_H + 0.05, 0], 'navy'),
      kit.box([SHOP.w + 0.08, 0.08, SHOP.d + 0.08], [SHOP.x, TOP + 0.04, 0], 'white'),
      ...door(kit, { at: [FRONT, BASE_H + 0.25, 0.1], facing: 'x+', w: 0.26, h: 0.4, color: 'white', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [FRONT, 0.5, 0.55], facing: 'x+', w: 0.28, h: 0.34 }),
      ...glassWindow(kit, { at: [FRONT, 0.5, -0.4], facing: 'x+', w: 0.3, h: 0.34 }),
      ...glassWindow(kit, { at: [SHOP.x, 0.5, SHOP.d / 2], facing: 'z+', w: 0.5, h: 0.3 }),
      ...glassWindow(kit, { at: [SHOP.x, 0.5, -SHOP.d / 2], facing: 'z-', w: 0.5, h: 0.3 }),
      ...glassWindow(kit, { at: [SHOP.x - SHOP.w / 2, 0.5, 0], facing: 'x-', w: 0.6, h: 0.3, panes: 3 }),
      // red band under the roof
      kit.box([SHOP.w + 0.02, 0.06, SHOP.d + 0.02], [SHOP.x, TOP - 0.1, 0], 'red'),
    ];
    // ball neon: a ring with seam lines on a navy board
    const ringX = SIGN.x + SIGN.w / 2 + 0.05;
    parts.push(
      kit.box([SIGN.w, SIGN.h, SIGN.d], [SIGN.x, SIGN.y, 0], 'navy'),
      kit.torus(BALL_R, 0.05, [ringX, SIGN.y, 0], 'orange', { radialSegments: 4, tubularSegments: 16, rotate: [0, Math.PI / 2, 0], glow: true }),
      kit.box([0.06, 0.05, BALL_R * 2], [ringX, SIGN.y, 0], 'orange', { glow: true }),
      kit.box([0.06, BALL_R * 2, 0.05], [ringX, SIGN.y, 0], 'orange', { glow: true }),
    );
    // display crate with balls, plus two rackets leaning by the wall
    parts.push(kit.box([0.3, 0.16, 0.6], [0.55, BASE_H + 0.08, -0.52], 'wood'), kit.box([0.32, 0.03, 0.62], [0.55, BASE_H + 0.175, -0.52], 'woodDark'));
    for (const b of BALLS) parts.push(kit.sphere(0.07, [0.55, BASE_H + 0.19 + 0.07 * 0.85, b.z], b.color, { detail: 0 }));
    for (const z of [0.72, 0.58]) {
      parts.push(
        kit.cylinder(0.018, 0.018, 0.22, [0.42, BASE_H + 0.11, z], 'woodDark', { segments: 6 }),
        kit.torus(0.09, 0.016, [0.42, BASE_H + 0.22 + 0.09 * 1.1, z], z > 0.65 ? 'red' : 'sunYellow', { radialSegments: 4, tubularSegments: 12, scale: [1, 1.2, 1], rotate: [0, Math.PI / 2, 0] }),
      );
    }
    return kit.finish(parts);
  },
};

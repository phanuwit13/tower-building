import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, glassWindow } from '../../../models/parts';

// A mint shop (2×2, front +x) with a striped awning and a giant glasses sign on the roof: two teal
// neon rings on a navy board.
const BASE_H = 0.03;
const SHOP = { x: -0.3, w: 1.2, d: 1.6, h: 0.9 };
const FRONT = SHOP.x + SHOP.w / 2;
const TOP = BASE_H + SHOP.h;
const SIGN = { x: 0.1, y: TOP + 0.08 + 0.3, w: 0.06, h: 0.6, d: 1.2 };
const RING = { r: 0.2, tube: 0.035, z: 0.27 };
const AWNING_STRIPES = 7;

/** ร้านแว่นตา: an optical shop with a giant glasses sign and a teal neon. */
export const item: ItemModel = {
  id: 'optical-shop',
  name: 'ร้านแว่นตา',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.96, BASE_H, 1.96], [0, BASE_H / 2, 0], 'stone'),
      kit.box([SHOP.w, SHOP.h, SHOP.d], [SHOP.x, BASE_H + SHOP.h / 2, 0], 'mint'),
      kit.box([SHOP.w + 0.08, 0.08, SHOP.d + 0.08], [SHOP.x, TOP + 0.04, 0], 'white'),
      ...door(kit, { at: [FRONT, BASE_H + 0.2, 0], facing: 'x+', w: 0.26, h: 0.4, color: 'woodDark', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [FRONT, 0.42, 0.5], facing: 'x+', w: 0.3, h: 0.26 }),
      ...glassWindow(kit, { at: [FRONT, 0.42, -0.5], facing: 'x+', w: 0.3, h: 0.26 }),
      ...glassWindow(kit, { at: [SHOP.x, 0.45, SHOP.d / 2], facing: 'z+', w: 0.5, h: 0.3 }),
      ...glassWindow(kit, { at: [SHOP.x, 0.45, -SHOP.d / 2], facing: 'z-', w: 0.5, h: 0.3 }),
      ...glassWindow(kit, { at: [SHOP.x - SHOP.w / 2, 0.45, 0], facing: 'x-', w: 0.6, h: 0.3, panes: 3 }),
    ];
    // striped awning over the front, tilted down towards +x
    const stripe = (SHOP.d - 0.1) / AWNING_STRIPES;
    for (let i = 0; i < AWNING_STRIPES; i++) {
      parts.push(kit.box([0.3, 0.04, stripe], [FRONT + 0.14, 0.73, -(SHOP.d - 0.1) / 2 + stripe * (i + 0.5)], i % 2 === 0 ? 'blue' : 'white', { rotate: [0, 0, -0.35] }));
    }
    // giant glasses neon: two rings with lenses, a bridge and two temples, on a navy board
    const ringX = SIGN.x + SIGN.w / 2 + RING.tube;
    parts.push(kit.box([SIGN.w, SIGN.h, SIGN.d], [SIGN.x, SIGN.y, 0], 'navy'));
    for (const z of [-RING.z, RING.z]) {
      parts.push(
        kit.torus(RING.r, RING.tube, [ringX, SIGN.y, z], 'teal', { radialSegments: 4, tubularSegments: 12, rotate: [0, Math.PI / 2, 0], glow: true }),
        kit.cylinder(RING.r - 0.02, RING.r - 0.02, 0.02, [SIGN.x + SIGN.w / 2 + 0.01, SIGN.y, z], 'skyBlue', { segments: 12, rotate: [0, 0, Math.PI / 2] }),
      );
    }
    parts.push(
      kit.box([0.05, 0.04, 0.1], [ringX, SIGN.y + 0.06, 0], 'teal', { glow: true }),
      kit.box([0.05, 0.04, 0.08], [ringX, SIGN.y + 0.06, -0.55], 'teal', { glow: true }),
      kit.box([0.05, 0.04, 0.08], [ringX, SIGN.y + 0.06, 0.55], 'teal', { glow: true }),
    );
    // a little display stand with two pairs of glasses out front
    parts.push(
      kit.box([0.14, 0.4, 0.34], [0.72, BASE_H + 0.2, -0.68], 'wood'),
      kit.box([0.18, 0.04, 0.38], [0.72, BASE_H + 0.42, -0.68], 'woodDark'),
    );
    for (const [dz, c] of [[-0.08, 'sunYellow'], [0.08, 'pink']] as const) {
      parts.push(kit.torus(0.05, 0.016, [0.72, BASE_H + 0.5, -0.68 + dz], c, { radialSegments: 4, tubularSegments: 8, rotate: [0, Math.PI / 2, 0] }));
    }
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, glassWindow } from '../../../models/parts';

// A modern shop (2×2) with a giant bubble-tea cup and straw on the roof and a purple neon cup on a blade sign out front.
const BASE = { w: 1.9, h: 0.03, d: 1.9 };
const BODY = { x: -0.2, w: 1.1, d: 1.5, top: 0.8 };
const FRONT = BODY.x + BODY.w / 2; // the +x wall
const CUP = { x: -0.25, z: -0.1, h: 0.55, rTop: 0.26, rBottom: 0.19 };

/** ร้านชานมไข่มุก: a giant cup on the roof and a purple neon cup sign. */
export const item: ItemModel = {
  id: 'bubble-tea-shop',
  name: 'ร้านชานมไข่มุก',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const roofY = BASE.h + BODY.top + 0.06;
    const cupY = roofY + CUP.h / 2;
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'stone'),
      kit.box([BODY.w, BODY.top, BODY.d], [BODY.x, BASE.h + BODY.top / 2, 0], 'white'),
      kit.box([BODY.w + 0.1, 0.06, BODY.d + 0.1], [BODY.x, BASE.h + BODY.top + 0.03, 0], 'purple'),
      kit.box([BODY.w + 0.02, 0.07, BODY.d + 0.02], [BODY.x, BASE.h + 0.035, 0], 'mint'), // skirting
      // giant cup, milk-tea band, lid, straw and spilled pearls
      kit.cylinder(CUP.rTop, CUP.rBottom, CUP.h, [CUP.x, cupY, CUP.z], 'white'),
      kit.cylinder(0.2335, 0.1955, 0.3, [CUP.x, roofY + 0.15, CUP.z], 'wood'),
      kit.cylinder(0.275, 0.275, 0.05, [CUP.x, roofY + CUP.h + 0.025, CUP.z], 'pink', { segments: 12 }), // flat lid
      kit.cylinder(0.3, 0.3, 0.025, [CUP.x, roofY + CUP.h + 0.0125, CUP.z], 'purple', { segments: 12 }),
      kit.cylinder(0.035, 0.035, 0.6, [CUP.x + 0.06, roofY + CUP.h + 0.28, CUP.z], 'red', { segments: 6, rotate: [0, 0, -0.2] }),
      // front: window, door, an awning and the blade sign
      ...glassWindow(kit, { at: [FRONT, BASE.h + 0.42, -0.3], facing: 'x+', w: 0.7, h: 0.38, frame: 'purple' }),
      ...door(kit, { at: [FRONT, BASE.h + 0.2, 0.45], facing: 'x+', w: 0.3, h: 0.4, color: 'purple', knob: 'sunYellow' }),
      kit.box([0.22, 0.04, 1.3], [FRONT + 0.1, BASE.h + 0.68, 0], 'pink', { rotate: [0, 0, -0.3] }),
      ...glassWindow(kit, { at: [BODY.x, BASE.h + 0.42, BODY.d / 2], facing: 'z+', w: 0.6, h: 0.38, frame: 'purple' }),
      ...glassWindow(kit, { at: [BODY.x, BASE.h + 0.42, -BODY.d / 2], facing: 'z-', w: 0.6, h: 0.38, frame: 'purple' }),
      ...glassWindow(kit, { at: [BODY.x - BODY.w / 2, BASE.h + 0.42, 0], facing: 'x-', w: 0.8, h: 0.38, frame: 'purple' }),
      kit.cylinder(0.025, 0.025, 0.75, [0.8, BASE.h + 0.375, 0.7], 'charcoal', { segments: 6 }),
      kit.box([0.04, 0.56, 0.56], [0.8, BASE.h + 0.8, 0.7], 'navy'),
      kit.box([0.05, 0.04, BODY.d + 0.1], [FRONT + 0.05, BASE.h + BODY.top + 0.04, 0], 'purple', { glow: true, light: 'breathe' }), // roof-edge neon strip
      kit.cylinder(0.15, 0.1, 0.3, [0.83, BASE.h + 0.76, 0.7], 'purple', { segments: 8, glow: true, light: 'breathe' }), // neon cup
      kit.cylinder(0.03, 0.03, 0.2, [0.83, BASE.h + 0.98, 0.7], 'pink', { segments: 6, glow: true, light: 'breathe', rotate: [0, 0, -0.2] }),
      kit.box([0.04, 0.05, 0.44], [0.83, BASE.h + 0.57, 0.7], 'purple', { glow: true, light: 'breathe' }),
    ];
    for (let i = 0; i < 6; i++) {
      const a = 0.6 + i * 0.9;
      parts.push(kit.sphere(0.035, [CUP.x + 0.36 * Math.cos(a), roofY + 0.03, CUP.z + 0.36 * Math.sin(a)], 'charcoal', { detail: 0 }));
    }
    return kit.finish(parts);
  },
};

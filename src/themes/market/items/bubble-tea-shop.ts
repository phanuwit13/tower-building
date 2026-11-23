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
      kit.cylinder(CUP.rTop, CUP.rBottom, CUP.h, [CUP.x, cupY, CUP.z], 'glassBlue'),
      kit.cylinder(0.233, 0.195, 0.3, [CUP.x, roofY + 0.15, CUP.z], 'wood'),
      kit.dome(0.27, [CUP.x, roofY + CUP.h, CUP.z], 'pink', { scale: [1, 0.5, 1] }),
      kit.cylinder(0.025, 0.025, 0.5, [CUP.x + 0.05, roofY + CUP.h + 0.2, CUP.z], 'purple', { segments: 6, rotate: [0, 0, -0.2] }),
      // front: window, door, an awning and the blade sign
      ...glassWindow(kit, { at: [FRONT, BASE.h + 0.42, -0.3], facing: 'x+', w: 0.7, h: 0.38, frame: 'purple' }),
      ...door(kit, { at: [FRONT, BASE.h + 0.2, 0.45], facing: 'x+', w: 0.3, h: 0.4, color: 'purple', knob: 'sunYellow' }),
      kit.box([0.22, 0.04, 1.3], [FRONT + 0.1, BASE.h + 0.68, 0], 'pink', { rotate: [0, 0, -0.3] }),
      ...glassWindow(kit, { at: [BODY.x, BASE.h + 0.42, BODY.d / 2], facing: 'z+', w: 0.6, h: 0.38, frame: 'purple' }),
      ...glassWindow(kit, { at: [BODY.x, BASE.h + 0.42, -BODY.d / 2], facing: 'z-', w: 0.6, h: 0.38, frame: 'purple' }),
      ...glassWindow(kit, { at: [BODY.x - BODY.w / 2, BASE.h + 0.42, 0], facing: 'x-', w: 0.8, h: 0.38, frame: 'purple' }),
      kit.cylinder(0.025, 0.025, 0.75, [0.8, BASE.h + 0.375, 0.7], 'charcoal', { segments: 6 }),
      kit.box([0.04, 0.42, 0.42], [0.8, BASE.h + 0.75, 0.7], 'navy'),
      kit.cylinder(0.1, 0.07, 0.22, [0.83, BASE.h + 0.73, 0.7], 'purple', { segments: 8, glow: true, light: 'breathe' }), // neon cup
      kit.cylinder(0.014, 0.014, 0.12, [0.83, BASE.h + 0.9, 0.7], 'pink', { segments: 6, glow: true, light: 'breathe', rotate: [0, 0, -0.2] }),
      kit.box([0.025, 0.04, 0.36], [0.83, BASE.h + 0.56, 0.7], 'purple', { glow: true, light: 'breathe' }),
    ];
    for (let i = 0; i < 6; i++) {
      const a = 0.6 + i * 0.9;
      parts.push(kit.sphere(0.035, [CUP.x + 0.36 * Math.cos(a), roofY + 0.03, CUP.z + 0.36 * Math.sin(a)], 'charcoal', { detail: 0 }));
    }
    return kit.finish(parts);
  },
};

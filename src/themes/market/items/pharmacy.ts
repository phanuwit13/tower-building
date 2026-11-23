import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, glassWindow } from '../../../models/parts';

// A clean white pharmacy (2×2, front +x): mint trim, a green roof and a green plus-in-a-circle neon on a navy board (never a red cross).
const CX = -0.1;
const W = 1.6;
const L = 1.7;
const BASE = 0.05;
const TOP = 1.0;
const FRONT = CX + W / 2;
const SIGN_X = 0.45;
const SIGN_Y = TOP + 0.06 + 0.4;

/** ร้านขายยา: a white shop with a green circle-and-plus neon. */
export const item: ItemModel = {
  id: 'pharmacy',
  name: 'ร้านขายยา',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([W + 0.3, BASE, L + 0.2], [CX + 0.05, BASE / 2, 0], 'stone'),
      kit.box([W, TOP - BASE, L], [CX, (BASE + TOP) / 2, 0], 'white'),
      kit.box([W + 0.02, 0.07, L + 0.02], [CX, BASE + 0.035, 0], 'mint'),
      kit.box([W + 0.12, 0.07, L + 0.1], [CX, TOP + 0.035, 0], 'leaf'),
      kit.box([W + 0.04, 0.05, L + 0.04], [CX, TOP - 0.025, 0], 'mint'),
      // glass door with a mint awning and a step
      ...door(kit, { at: [FRONT, BASE + 0.26, 0.45], facing: 'x+', w: 0.34, h: 0.52, color: 'skyBlue', knob: 'chrome' }),
      kit.box([0.28, 0.04, 0.6], [FRONT + 0.14, 0.7, 0.45], 'leaf'),
      kit.box([0.1, 0.03, 0.46], [FRONT + 0.05, BASE + 0.015, 0.45], 'stoneDark'),
      // counter with little bottles in front of the big window
      kit.box([0.14, 0.3, 0.8], [FRONT + 0.07, BASE + 0.15, -0.45], 'mint'),
      kit.cylinder(0.04, 0.04, 0.13, [FRONT + 0.07, BASE + 0.365, -0.7], 'pink', { segments: 8 }),
      kit.cylinder(0.04, 0.04, 0.17, [FRONT + 0.07, BASE + 0.385, -0.55], 'sunYellow', { segments: 8 }),
      kit.cylinder(0.04, 0.04, 0.12, [FRONT + 0.07, BASE + 0.36, -0.4], 'skyBlue', { segments: 8 }),
      kit.cylinder(0.04, 0.04, 0.15, [FRONT + 0.07, BASE + 0.375, -0.25], 'lime', { segments: 8 }),
      ...glassWindow(kit, { at: [FRONT, 0.76, -0.45], facing: 'x+', w: 0.8, h: 0.3, panes: 3 }),
      ...glassWindow(kit, { at: [FRONT, 0.76, 0.45], facing: 'x+', w: 0.3, h: 0.1 }),
      // the neon: a navy board on the roof, a green ring with a plus inside
      kit.box([0.08, 0.8, 0.8], [SIGN_X, SIGN_Y, 0], 'navy'),
      kit.box([0.06, 0.1, 0.4], [SIGN_X - 0.02, TOP + 0.11, 0], 'stoneDark'),
      kit.torus(0.3, 0.03, [SIGN_X + 0.05, SIGN_Y, 0], 'leaf', { rotate: [0, Math.PI / 2, 0], radialSegments: 4, tubularSegments: 16, glow: true }),
      kit.box([0.04, 0.34, 0.09], [SIGN_X + 0.05, SIGN_Y, 0], 'leaf', { glow: true }),
      kit.box([0.04, 0.09, 0.34], [SIGN_X + 0.05, SIGN_Y, 0], 'leaf', { glow: true }),
    ];
    for (const z of [-L / 2, L / 2]) {
      parts.push(...glassWindow(kit, { at: [CX, 0.6, z], facing: z > 0 ? 'z+' : 'z-', w: 0.9, h: 0.4 }));
    }
    parts.push(...glassWindow(kit, { at: [CX - W / 2, 0.6, 0], facing: 'x-', w: 0.9, h: 0.4 }));
    return kit.finish(parts);
  },
};

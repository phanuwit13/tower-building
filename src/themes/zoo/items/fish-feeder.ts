import type { ItemModel } from '../../../models/contract';
import { wallPanel } from '../../../models/parts';

// 1x1. A coin-operated fish-food dispenser on a wooden post: blue box, clear hopper on top,
// a fish picture, a coin slot, a yellow knob and a little tray, all on the +x front.
const BASE = { r: 0.3, h: 0.03 };
const POST = { w: 0.1, h: 0.46 };
const BOX = { w: 0.3, h: 0.34, d: 0.28 };
const BOX_Y = BASE.h + POST.h + BOX.h / 2 - 0.01;
const FRONT_X = BOX.w / 2;

/** ตู้อาหารปลาหยอดเหรียญ: a coin-operated fish-food dispenser. */
export const item: ItemModel = {
  id: 'fish-feeder',
  name: 'ตู้อาหารปลาหยอดเหรียญ',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => kit.finish([
    kit.cylinder(BASE.r, BASE.r, BASE.h, [0, BASE.h / 2, 0], 'stone', { segments: 12 }),
    kit.box([POST.w, POST.h, POST.w], [0, BASE.h + POST.h / 2, 0], 'wood'),
    kit.box([BOX.w, BOX.h, BOX.d], [0, BOX_Y, 0], 'blue'),
    kit.box([BOX.w + 0.04, 0.03, BOX.d + 0.04], [0, BOX_Y + BOX.h / 2, 0], 'white'), // lid
    kit.dome(0.13, [0, BOX_Y + BOX.h / 2 + 0.015, 0], 'glassBlue', { segments: 12, scale: [1, 1.1, 1] }), // clear hopper
    kit.sphere(0.04, [0.02, BOX_Y + BOX.h / 2 + 0.06, 0.03], 'orange', { detail: 0 }), // pellets peeking through
    kit.sphere(0.04, [-0.04, BOX_Y + BOX.h / 2 + 0.05, -0.04], 'sunYellow', { detail: 0 }),
    // fish picture
    ...wallPanel(kit, { at: [FRONT_X, BOX_Y + 0.07, 0], facing: 'x+', w: 0.22, h: 0.14, depth: 0.02, color: 'white' }),
    kit.sphere(1, [FRONT_X + 0.03, BOX_Y + 0.07, 0], 'orange', { detail: 0, scale: [0.012, 0.045, 0.07] }),
    kit.sphere(1, [FRONT_X + 0.03, BOX_Y + 0.07, -0.085], 'orange', { detail: 0, scale: [0.012, 0.04, 0.03] }), // tail
    kit.box([0.016, 0.02, 0.02], [FRONT_X + 0.032, BOX_Y + 0.085, 0.04], 'charcoal'),
    // coin slot, knob, tray
    ...wallPanel(kit, { at: [FRONT_X, BOX_Y - 0.06, -0.07], facing: 'x+', w: 0.07, h: 0.03, depth: 0.02, color: 'charcoal' }),
    kit.cylinder(0.045, 0.045, 0.03, [FRONT_X + 0.015, BOX_Y - 0.06, 0.06], 'sunYellow', { segments: 10, rotate: [0, 0, Math.PI / 2] }),
    kit.box([0.1, 0.02, 0.14], [FRONT_X + 0.05, BOX_Y - 0.14, 0], 'stoneDark'),
    kit.box([0.1, 0.03, 0.015], [FRONT_X + 0.1, BOX_Y - 0.125, 0], 'stoneDark'),
  ]),
};

import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// A mound of sand with a pole and a small red triangular flag that ripples (four strips, one shared pivot).
const MOUND = { r: 0.44, h: 0.28 };
const POLE = { r: 0.02, h: 1.1 };
const POLE_TOP = MOUND.h * 0.6 + POLE.h;
const FLAG = { strips: 4, w: 0.1, h: 0.34, topY: POLE_TOP - 0.06 }; // flag hangs from the top of the pole, pointing +x
const WAVE: MotionOpts = { kind: 'wave', pivot: [POLE.r, FLAG.topY, 0], axis: [1, 0, 0] };

/** ธงปักกองทราย: a sand mound with a small triangular flag. */
export const item: ItemModel = {
  id: 'sand-flag',
  name: 'ธงปักกองทราย',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.dome(MOUND.r, [0, 0, 0], 'sand', { scale: [1, MOUND.h / MOUND.r, 1] }),
      kit.cylinder(POLE.r, POLE.r, POLE.h, [0, MOUND.h * 0.6 + POLE.h / 2, 0], 'white', { segments: 6 }),
      kit.sphere(0.04, [0, POLE_TOP + 0.03, 0], 'sunYellow', { detail: 0 }),
      kit.sphere(0.06, [0.25, 0.06, 0.22], 'pink', { detail: 0 }),
      kit.sphere(0.05, [-0.2, 0.055, -0.26], 'stone', { detail: 0 }),
      kit.sphere(0.045, [0.3, 0.05, -0.2], 'white', { detail: 0 }),
    ];
    // a triangle: strips get shorter towards the free tip, centred on the flag's middle
    for (let i = 0; i < FLAG.strips; i++) {
      const h = FLAG.h * (1 - i / FLAG.strips);
      parts.push(kit.box([FLAG.w, h, 0.02], [POLE.r + FLAG.w * (i + 0.5), FLAG.topY - FLAG.h / 2, 0], i % 2 === 0 ? 'red' : 'orange', { motion: WAVE }));
    }
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

const BASE = { w: 0.68, h: 0.22, d: 0.44 }; // pedestal
const PLATE = { w: 0.78, h: 0.05, d: 0.52 };
const BODY = { r: 0.17, y0: 0.32, h: 0.55 }; // the fuselage stands on the pedestal
const NOSE = { h: 0.3 };
const PIVOT_Y = BASE.h + PLATE.h; // the rocket rocks about its foot

const ROCK: MotionOpts = { kind: 'swing', pivot: [0, PIVOT_Y, 0], axis: [0, 0, 1], amount: 0.07, speed: 1.6 };

/** จรวดหยอดเหรียญ: a small coin-operated rocket on a pedestal; it rocks gently and its tip blinks. */
export const item: ItemModel = {
  id: 'coin-rocket',
  name: 'จรวดหยอดเหรียญ',
  category: 'ride',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const m = { motion: ROCK };
    const bodyTop = BODY.y0 + BODY.h;
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'blue'),
      kit.box([PLATE.w, PLATE.h, PLATE.d], [0, BASE.h + PLATE.h / 2, 0], 'sunYellow'),
      kit.box([0.04, 0.12, 0.14], [BASE.w / 2 + 0.02, 0.12, 0], 'red'),
      kit.box([0.012, 0.05, 0.015], [BASE.w / 2 + 0.046, 0.14, 0], 'charcoal'),
      // rocket: nozzle, fuselage with a blue band, nose cone and a blinking tip
      kit.cone(0.1, 0.1, [0, PIVOT_Y + 0.05, 0], 'charcoal', { segments: 8, rotate: [Math.PI, 0, 0], ...m }),
      kit.cylinder(BODY.r, BODY.r, BODY.h, [0, BODY.y0 + BODY.h / 2, 0], 'white', { segments: 12, ...m }),
      kit.cylinder(BODY.r + 0.008, BODY.r + 0.008, 0.07, [0, BODY.y0 + 0.14, 0], 'blue', { segments: 12, ...m }),
      kit.cone(BODY.r, NOSE.h, [0, bodyTop + NOSE.h / 2, 0], 'red', { segments: 12, ...m }),
      kit.sphere(0.04, [0, bodyTop + NOSE.h + 0.02, 0], 'red', { detail: 0, glow: true, light: 'blink', ...m }),
      // porthole on the front and the back
      kit.sphere(0.07, [BODY.r - 0.01, BODY.y0 + 0.36, 0], 'skyBlue', { detail: 0, scale: [0.5, 1, 1], ...m }),
      kit.sphere(0.07, [-(BODY.r - 0.01), BODY.y0 + 0.36, 0], 'skyBlue', { detail: 0, scale: [0.5, 1, 1], ...m }),
    ];
    // four fins round the foot
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([0.14, 0.24, 0.03], [s * (BODY.r + 0.05), BODY.y0 + 0.1, 0], 'red', { rotate: [0, 0, s * -0.3], ...m }),
        kit.box([0.03, 0.24, 0.14], [0, BODY.y0 + 0.1, s * (BODY.r + 0.05)], 'red', { rotate: [s * 0.3, 0, 0], ...m }),
      );
    }
    return kit.finish(parts);
  },
};

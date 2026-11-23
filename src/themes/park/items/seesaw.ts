import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

const G = 0.03;
const PIV = 0.42; // axle height: the plank tips about this point
const PLANK = { w: 0.24, t: 0.08, half: 0.85 };
const AMOUNT = 0.1; // rock in radians (about 6 degrees)
// Lowest plank underside at a tip: PIV - half * sin(0.1) - t/2 * cos(0.1) = 0.42 - 0.085 - 0.040 = 0.295.
// Bumper tops are at 0.15, so the low end never touches them and never nears the ground.
const ROCK: MotionOpts = { kind: 'swing', pivot: [0, PIV, 0], axis: [1, 0, 0], amount: AMOUNT, speed: 1.6 };
const SEAT = { z: 0.6, w: 0.28, d: 0.2, h: 0.04 };
const HANDLE = { z: 0.36, h: 0.26, w: 0.2, r: 0.016 };
const BUMPER = { z: 0.76, r: 0.09, top: 0.15 };

/** ไม้กระดก: a bright seesaw, a blue plank with yellow seats and handles on a red pivot; it tips gently about its middle. */
export const item: ItemModel = {
  id: 'seesaw',
  name: 'ไม้กระดก',
  category: 'play',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.96, G, 1.96], [0, G / 2, 0], 'red'),
      kit.box([0.5, 0.04, 0.5], [0, G + 0.02, 0], 'stone'),
      kit.cylinder(0.035, 0.035, 0.46, [0, PIV, 0], 'charcoal', { rotate: [0, 0, Math.PI / 2], segments: 8 }),
      kit.box([PLANK.w, PLANK.t, 2 * PLANK.half], [0, PIV, 0], 'blue', { motion: ROCK }),
    ];
    const plateTop = PIV + 0.05;
    const plateH = plateTop - (G + 0.04);
    for (const s of [-1, 1]) {
      parts.push(
        kit.wedge([0.5, plateH, 0.04], [s * 0.17, G + 0.04 + plateH / 2, 0], 'sunYellow', { rotate: [0, Math.PI / 2, 0] }),
        kit.sphere(0.05, [s * 0.235, PIV, 0], 'charcoal', { detail: 0 }),
      );
      const top = PIV + PLANK.t / 2;
      parts.push(
        kit.box([SEAT.w, SEAT.h, SEAT.d], [0, top + SEAT.h / 2, s * SEAT.z], 'sunYellow', { motion: ROCK }),
        kit.cylinder(HANDLE.r, HANDLE.r, HANDLE.h, [-HANDLE.w / 2, top + HANDLE.h / 2, s * HANDLE.z], 'white', { segments: 6, motion: ROCK }),
        kit.cylinder(HANDLE.r, HANDLE.r, HANDLE.h, [HANDLE.w / 2, top + HANDLE.h / 2, s * HANDLE.z], 'white', { segments: 6, motion: ROCK }),
        kit.cylinder(HANDLE.r, HANDLE.r, HANDLE.w + 0.03, [0, top + HANDLE.h, s * HANDLE.z], 'white', { rotate: [0, 0, Math.PI / 2], segments: 6, motion: ROCK }),
        kit.cylinder(BUMPER.r, BUMPER.r, BUMPER.top - G, [0, G + (BUMPER.top - G) / 2, s * BUMPER.z], 'charcoal', { segments: 8 }),
      );
    }
    return kit.finish(parts);
  },
};

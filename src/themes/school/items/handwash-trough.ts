import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { wallPanel } from '../../../models/parts';

// A long open steel trough along z on legs, kids wash at the front (+x). Behind it a sky-blue tiled
// splashback carries the water pipe with four chrome taps; one tap is running. The soap dish sits
// on a little ledge at the +z end, the end the default camera sees first.
const LEN = 1.66; // trough length along z
const TROUGH = { x: 0.05, w: 0.44, h: 0.15, rim: 0.34, wall: 0.035, floor: 0.03 }; // `x` = centre, `rim` = top edge height
const LEG = { s: 0.05, z: [-0.74, 0, 0.74] };
const BACK = { t: 0.05, top: 0.66, gap: 0.005 }; // splashback, just behind the trough's back wall
const BACK_CAP = { h: 0.035, over: 0.02 };
const STRIPE = { h: 0.045, y: 0.585 }; // blue tile band on the splashback
const PIPE = { r: 0.024, y: 0.5, out: 0.035 }; // water pipe along z, `out` in front of the splashback
const TAP_Z = [-0.6, -0.2, 0.2, 0.6];
const TAP = { reach: 0.12, r: 0.02, spout: 0.05, handle: 0.03 };
const RUNNING = 1; // index in TAP_Z of the tap with water running
const LEDGE = { d: 0.12, h: 0.03 }; // soap ledge at the +z end, flush with the rim
const DISH = { r: 0.07, h: 0.018 };
const SOAP = { w: 0.09, h: 0.04, d: 0.06 };

/** รางล้างมือ: a long steel hand-washing trough with four taps and a pink bar of soap. */
export const item: ItemModel = {
  id: 'handwash-trough',
  name: 'รางล้างมือ',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const bottom = TROUGH.rim - TROUGH.h;
    const front = TROUGH.x + TROUGH.w / 2;
    const backWall = TROUGH.x - TROUGH.w / 2; // outer face of the back wall
    const backX = backWall - BACK.gap - BACK.t / 2; // splashback centre
    const backFace = backX + BACK.t / 2;
    const backH = BACK.top - bottom;
    const pipeX = backFace + PIPE.out;
    const parts: Part[] = [
      // the trough: floor, front and back walls, two end walls (an open box)
      kit.box([TROUGH.w, TROUGH.floor, LEN], [TROUGH.x, bottom + TROUGH.floor / 2, 0], 'stone'),
      kit.box([TROUGH.wall, TROUGH.h, LEN], [front - TROUGH.wall / 2, bottom + TROUGH.h / 2, 0], 'stone'),
      kit.box([TROUGH.wall, TROUGH.h, LEN], [backWall + TROUGH.wall / 2, bottom + TROUGH.h / 2, 0], 'stone'),
      // splashback from the trough's bottom up, standing on its own back legs
      kit.box([BACK.t, backH, LEN], [backX, bottom + backH / 2, 0], 'skyBlue'),
      kit.box([BACK.t + 2 * BACK_CAP.over, BACK_CAP.h, LEN + 2 * BACK_CAP.over], [backX, BACK.top + BACK_CAP.h / 2, 0], 'white'),
      ...wallPanel(kit, { at: [backFace, STRIPE.y, 0], facing: 'x+', w: LEN, h: STRIPE.h, depth: 0.01, color: 'blue' }),
      kit.cylinder(PIPE.r, PIPE.r, LEN - 0.04, [pipeX, PIPE.y, 0], 'white', { rotate: [Math.PI / 2, 0, 0], segments: 8 }),
      // soap ledge, dish and soap at the +z end
      kit.box([TROUGH.w - 0.06, LEDGE.h, LEDGE.d], [TROUGH.x, TROUGH.rim - LEDGE.h / 2, LEN / 2 + LEDGE.d / 2 - 0.005], 'stoneDark'),
      kit.cylinder(DISH.r, DISH.r * 0.8, DISH.h, [TROUGH.x, TROUGH.rim + DISH.h / 2, LEN / 2 + LEDGE.d / 2], 'white', { segments: 10, scale: [1, 1, 0.75] }),
      kit.box([SOAP.w, SOAP.h, SOAP.d], [TROUGH.x, TROUGH.rim + DISH.h + SOAP.h / 2, LEN / 2 + LEDGE.d / 2], 'pink', { rotate: [0, 0.25, 0] }),
    ];
    for (const s of [-1, 1]) {
      parts.push(kit.box([TROUGH.w - 2 * TROUGH.wall, TROUGH.h, TROUGH.wall], [TROUGH.x, bottom + TROUGH.h / 2, s * (LEN / 2 - TROUGH.wall / 2)], 'stone'));
    }
    // legs: a front row under the trough, a back row under the splashback
    for (const z of LEG.z) {
      parts.push(
        kit.box([LEG.s, bottom, LEG.s], [front - 0.05, bottom / 2, z], 'stoneDark'),
        kit.box([LEG.s, bottom, LEG.s], [backX, bottom / 2, z], 'stoneDark'),
      );
    }
    // taps: neck out from the pipe, spout turned down, a round handle on top
    TAP_Z.forEach((z, i) => {
      const tipX = pipeX + TAP.reach;
      parts.push(
        kit.cylinder(TAP.r, TAP.r, TAP.reach, [pipeX + TAP.reach / 2, PIPE.y, z], 'white', { rotate: [0, 0, Math.PI / 2], segments: 6 }),
        kit.cylinder(TAP.r, TAP.r * 0.85, TAP.spout, [tipX, PIPE.y - TAP.spout / 2, z], 'white', { segments: 6 }),
        kit.sphere(TAP.handle, [pipeX + 0.03, PIPE.y + PIPE.r + 0.02, z], 'blue', { detail: 0, scale: [1, 0.6, 1] }),
      );
      if (i === RUNNING) {
        const top = PIPE.y - TAP.spout;
        const end = bottom + TROUGH.floor;
        parts.push(kit.cylinder(0.013, 0.016, top - end, [tipX, (top + end) / 2, z], 'skyBlue', { segments: 6 }));
      }
    });
    return kit.finish(parts);
  },
};

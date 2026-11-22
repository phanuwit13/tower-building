import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

const PIVOT_Y = 0.32; // axle height
const AXLE = { r: 0.045, len: 0.42 }; // runs along x through both side plates
const TILT = 0.3; // plank tilt in radians: the +z end is down, resting on its bumper
const PLANK = { w: 0.25, t: 0.07, len: 1.76 }; // sits on top of the axle, long side along z
const PAD = { w: 0.5, h: 0.05, d: 0.46 }; // stone pad under the pivot
const PLATE = { base: 0.44, t: 0.06, gap: 0.04 }; // blue triangular side plates; `gap` between plate and plank
const SEAT = { at: 0.68, w: 0.29, h: 0.05, d: 0.22 }; // `at` = distance from the pivot along the plank
const BACK = { at: 0.82, h: 0.13, t: 0.05 }; // little backrest at each end
const HANDLE = { at: 0.48, r: 0.105, tube: 0.026, stretch: 1.9 }; // inverted-U handle bar
const BUMPER = { r: 0.08, at: 0.76 }; // rubber blocks under each end

// The plank, seats and handles rock together about the axle (x axis). Small on purpose: the low end rests on its
// bumper, so a big rock would push the plank into it.
const ROCK: MotionOpts = { kind: 'swing', pivot: [0, PIVOT_Y, 0], axis: [1, 0, 0], amount: 0.07, speed: 1.6 };

const cos = Math.cos(TILT);
const sin = Math.sin(TILT);
/** A point in the plank's own frame (origin on the axle, z along the plank, y off its top) after the tilt. */
const onPlank = ([x, y, z]: Vec3): Vec3 => [x, PIVOT_Y + y * cos - z * sin, y * sin + z * cos];

/** กระดานหก: a playground seesaw, a long yellow plank on a blue pivot with a seat and a handle at each end. */
export const item: ItemModel = {
  id: 'seesaw',
  name: 'กระดานหก',
  category: 'play',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const tilt: Vec3 = [TILT, 0, 0];
    const top = AXLE.r + PLANK.t; // plank top, measured from the axle
    const plateH = PIVOT_Y + AXLE.r + 0.02 - PAD.h; // the apex just covers the axle
    const plateX = PLANK.w / 2 + PLATE.gap + PLATE.t / 2;
    const parts: Part[] = [
      kit.box([PAD.w, PAD.h, PAD.d], [0, PAD.h / 2, 0], 'stone'),
      kit.cylinder(AXLE.r, AXLE.r, AXLE.len, [0, PIVOT_Y, 0], 'navy', { rotate: [0, 0, Math.PI / 2], segments: 8 }),
      kit.box([PLANK.w, PLANK.t, PLANK.len], onPlank([0, AXLE.r + PLANK.t / 2, 0]), 'sunYellow', { rotate: tilt, motion: ROCK }),
    ];
    for (const s of [-1, 1]) {
      // side plate: a triangle seen from the front, base along z
      parts.push(
        kit.wedge([PLATE.base, plateH, PLATE.t], [s * plateX, PAD.h + plateH / 2, 0], 'blue', { rotate: [0, Math.PI / 2, 0] }),
        kit.sphere(0.06, [s * (AXLE.len / 2), PIVOT_Y, 0], 'navy', { detail: 0 }), // axle cap
      );
      // each end (s = +1 is the low end): seat, backrest, handle and a bumper on the ground below
      parts.push(
        kit.box([SEAT.w, SEAT.h, SEAT.d], onPlank([0, top + SEAT.h / 2, s * SEAT.at]), 'orange', { rotate: tilt, motion: ROCK }),
        kit.box([SEAT.w, BACK.h, BACK.t], onPlank([0, top + BACK.h / 2, s * BACK.at]), 'orange', { rotate: tilt, motion: ROCK }),
        kit.torus(HANDLE.r, HANDLE.tube, onPlank([0, top, s * HANDLE.at]), 'red',
          { arc: Math.PI, radialSegments: 5, tubularSegments: 7, scale: [1, HANDLE.stretch, 1], rotate: tilt, motion: ROCK }),
      );
      const [, yEnd, zEnd] = onPlank([0, AXLE.r, s * BUMPER.at]); // underside of the plank above the bumper
      const h = s > 0 ? yEnd : 0.12; // the low end rests on its bumper; the high end's bumper waits below
      parts.push(kit.cylinder(BUMPER.r, BUMPER.r, h, [0, h / 2, zEnd], 'charcoal', { segments: 8 }));
    }
    return kit.finish(parts);
  },
};

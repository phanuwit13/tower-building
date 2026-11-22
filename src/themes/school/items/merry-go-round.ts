import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A playground roundabout: a round deck on a low hub, a central post with a little cone cap, and
// four seats facing the post, each with a grab handle in front of it.
const HUB = { r: 0.24, h: 0.06 }; // stone footing under the middle of the deck
const DECK = { r: 0.9, h: 0.08 }; // blue rim: y HUB.h .. HUB.h + DECK.h
const PAINT = { r: 0.82, h: 0.02 }; // yellow top of the deck
const DECK_TOP = HUB.h + DECK.h + PAINT.h;
const STRIPE = { w: 0.06, h: 0.01 }; // a white cross on the deck, between the seats
const POST = { r: 0.07, top: 1.0 };
const COLLAR = { r: 0.13, h: 0.08 };
const CAP = { r: 0.27, h: 0.26, rim: 0.04 }; // cone on the post
const SEAT = { rad: 0.6, y: DECK_TOP + 0.14, w: 0.24, d: 0.2, t: 0.05, back: 0.18 }; // w across, d radial
const HANDLE = { rad: 0.34, r: 0.12, tube: 0.024, stretch: 1.7 }; // arch, stretched upwards
/** Seat (and handle) colours, at angles 0, 90, 180 and 270 degrees from +x towards +z. */
const SEATS: PaletteColor[] = ['red', 'leaf', 'purple', 'pink'];

// Everything above the stone footing turns together about the post (slow: one turn in ~16 s).
const SPIN: MotionOpts = { kind: 'spin', pivot: [0, 0, 0], axis: [0, 1, 0], speed: 0.4 };

/** ม้าหมุน: a colourful playground merry-go-round with four seats, grab handles and a cone-topped post. */
export const item: ItemModel = {
  id: 'merry-go-round',
  name: 'ม้าหมุน',
  category: 'ride',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(HUB.r, HUB.r + 0.04, HUB.h, [0, HUB.h / 2, 0], 'stone', { segments: 12 }),
      kit.cylinder(DECK.r, DECK.r, DECK.h, [0, HUB.h + DECK.h / 2, 0], 'blue', { segments: 20, motion: SPIN }),
      kit.cylinder(PAINT.r, PAINT.r, PAINT.h, [0, HUB.h + DECK.h + PAINT.h / 2, 0], 'sunYellow', { segments: 20, motion: SPIN }),
      kit.cylinder(COLLAR.r, COLLAR.r, COLLAR.h, [0, DECK_TOP + COLLAR.h / 2, 0], 'red', { segments: 10, motion: SPIN }),
      kit.cylinder(POST.r, POST.r, POST.top - DECK_TOP, [0, (DECK_TOP + POST.top) / 2, 0], 'red', { segments: 8, motion: SPIN }),
      kit.cylinder(CAP.r, CAP.r, CAP.rim, [0, POST.top + CAP.rim / 2, 0], 'sunYellow', { segments: 12, motion: SPIN }),
      kit.cone(CAP.r, CAP.h, [0, POST.top + CAP.rim + CAP.h / 2, 0], 'red', { segments: 12, motion: SPIN }),
      kit.sphere(0.05, [0, POST.top + CAP.rim + CAP.h + 0.03, 0], 'sunYellow', { detail: 0, motion: SPIN }),
    ];
    for (const a of [Math.PI / 4, -Math.PI / 4]) {
      parts.push(kit.box([2 * PAINT.r - 0.04, STRIPE.h, STRIPE.w], [0, DECK_TOP + STRIPE.h / 2, 0], 'white', { rotate: [0, a, 0], motion: SPIN }));
    }
    SEATS.forEach((color, i) => {
      const a = (i * Math.PI) / 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const turn: [number, number, number] = [0, -a, 0]; // local +x points out along this seat's radius
      const at = (rad: number, y: number): [number, number, number] => [c * rad, y, s * rad];
      parts.push(
        kit.cylinder(0.035, 0.05, SEAT.y - DECK_TOP, at(SEAT.rad, (DECK_TOP + SEAT.y) / 2), 'charcoal', { segments: 6, motion: SPIN }),
        kit.box([SEAT.d, SEAT.t, SEAT.w], at(SEAT.rad, SEAT.y), color, { rotate: turn, motion: SPIN }),
        kit.box([0.05, SEAT.back, SEAT.w], at(SEAT.rad + SEAT.d / 2 - 0.02, SEAT.y + SEAT.back / 2), color, { rotate: turn, motion: SPIN }),
        // grab handle: an arch across the radius, its feet on the deck
        kit.torus(HANDLE.r, HANDLE.tube, at(HANDLE.rad, DECK_TOP), color, {
          arc: Math.PI, scale: [1, HANDLE.stretch, 1], rotate: [0, -(a + Math.PI / 2), 0], tubularSegments: 7, motion: SPIN,
        }),
      );
    });
    return kit.finish(parts);
  },
};

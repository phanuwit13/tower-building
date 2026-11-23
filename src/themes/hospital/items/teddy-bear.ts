import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A big teddy bear sitting on a little chair (seat 0.31, backrest to 0.62) on a round rug. The bear looks towards +x.
const SEAT_Y = 0.31;
const CHAIR = { w: 0.5, seat: 0.04, leg: 0.05, back: 0.04 };

/** ตุ๊กตาหมี: a big teddy bear sitting on a little chair. */
export const item: ItemModel = {
  id: 'teddy-bear',
  name: 'ตุ๊กตาหมี',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const half = CHAIR.w / 2 - CHAIR.leg / 2;
    const parts: Part[] = [
      // round rug: two discs, each top at least 0.01 apart
      kit.cylinder(0.46, 0.46, 0.03, [0, 0.015, 0], 'mint', { segments: 16 }),
      kit.cylinder(0.33, 0.33, 0.04, [0, 0.02, 0], 'pink', { segments: 16 }),
      // chair: seat, four legs, backrest on the -x side
      kit.box([CHAIR.w, CHAIR.seat, CHAIR.w], [0, SEAT_Y - CHAIR.seat / 2, 0], 'orange'),
      kit.box([CHAIR.back, 0.3, CHAIR.w], [-CHAIR.w / 2 + CHAIR.back / 2, SEAT_Y + 0.15, 0], 'sunYellow'),
    ];
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) parts.push(kit.box([CHAIR.leg, SEAT_Y - CHAIR.seat, CHAIR.leg], [sx * half, (SEAT_Y - CHAIR.seat) / 2, sz * half], 'orange'));
    }
    // bear
    parts.push(
      kit.sphere(1, [-0.03, SEAT_Y + 0.19, 0], 'wood', { scale: [0.16, 0.2, 0.16] }), // body
      kit.sphere(1, [0.1, SEAT_Y + 0.19, 0], 'sand', { detail: 0, scale: [0.06, 0.12, 0.1] }), // belly
      kit.sphere(0.14, [0, SEAT_Y + 0.43, 0], 'wood'), // head
      kit.sphere(0.055, [0.12, SEAT_Y + 0.4, 0], 'sand', { detail: 0, scale: [1, 0.8, 1.1] }), // muzzle
      kit.sphere(0.022, [0.172, SEAT_Y + 0.42, 0], 'charcoal', { detail: 0 }), // nose
      kit.sphere(0.07, [0.12, SEAT_Y + 0.3, 0], 'blue', { detail: 0, scale: [0.5, 0.5, 1.4] }), // bow tie
    );
    for (const s of [-1, 1]) {
      parts.push(
        kit.sphere(0.02, [0.128, SEAT_Y + 0.47, s * 0.055], 'charcoal', { detail: 0 }), // eyes
        kit.sphere(0.055, [-0.01, SEAT_Y + 0.55, s * 0.1], 'wood', { detail: 0 }), // ears
        kit.sphere(0.03, [0.02, SEAT_Y + 0.55, s * 0.1], 'sand', { detail: 0 }),
        kit.sphere(1, [0.03, SEAT_Y + 0.22, s * 0.17], 'wood', { detail: 0, scale: [0.06, 0.11, 0.06] }), // arms
        kit.sphere(1, [0.14, SEAT_Y + 0.05, s * 0.09], 'wood', { detail: 0, scale: [0.1, 0.065, 0.07] }), // feet
        kit.sphere(0.035, [0.2, SEAT_Y + 0.05, s * 0.09], 'sand', { detail: 0 }),
      );
    }
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';

// Three joined waiting seats in a bright orange (1×2, long side along z, seat faces +x).
const SEAT_Y = 0.31;
const BACK_TOP = 0.62;
const LEN = 1.6;
const SEATS = 3;

/** เก้าอี้รอสามที่นั่ง: three joined waiting seats in a bright colour. */
export const item: ItemModel = {
  id: 'bench-seats',
  name: 'เก้าอี้รอสามที่นั่ง',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit: StyleKit) => {
    const parts: Part[] = [
      kit.box([0.62, 0.04, LEN + 0.04], [0, 0.02, 0], 'charcoal'),
      kit.box([0.1, SEAT_Y - 0.1, LEN - 0.2], [0.0, 0.04 + (SEAT_Y - 0.14) / 2, 0], 'charcoal'),
      kit.box([0.5, 0.07, LEN], [0.04, SEAT_Y - 0.035, 0], 'orange'),
      kit.box([0.1, BACK_TOP - SEAT_Y, LEN], [-0.22, (BACK_TOP + SEAT_Y) / 2, 0], 'orange'),
      kit.box([0.12, 0.04, LEN], [-0.22, BACK_TOP + 0.02, 0], 'sunYellow'),
    ];
    const w = LEN / SEATS;
    for (let i = 0; i <= SEATS; i++) {
      const z = -LEN / 2 + i * w + (i === 0 ? 0.03 : i === SEATS ? -0.03 : 0);
      parts.push(
        kit.box([0.5, 0.05, 0.06], [0.04, SEAT_Y + 0.01, z], 'charcoal'),
        kit.box([0.4, 0.04, 0.06], [0.0, SEAT_Y + 0.07, z], 'charcoal'),
        kit.box([0.06, BACK_TOP - SEAT_Y - 0.04, 0.06], [-0.15, (BACK_TOP + SEAT_Y) / 2 - 0.02, z], 'charcoal'),
      );
    }
    // a seat dip line between cushions on the top
    for (let i = 1; i < SEATS; i++) parts.push(kit.box([0.4, 0.012, 0.015], [0.06, SEAT_Y + 0.006, -LEN / 2 + i * w], 'redDark'));
    return kit.finish(parts);
  },
};

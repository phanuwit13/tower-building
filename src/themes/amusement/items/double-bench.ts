import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// Two benches back to back (one facing +x, one facing -x) with a flower box between the backrests.
const LEN = 1.6; // bench length along z
const SEAT = { y: 0.31, t: 0.05, x0: 0.12, d: 0.36 }; // seat from x0 outwards
const BACK = { t: 0.04, top: 0.7, x: 0.1 };
const BOX = { w: 0.2, h: 0.32, d: 1.5 };

/** ม้านั่งคู่: two benches back to back with a flower box between. */
export const item: ItemModel = {
  id: 'double-bench',
  name: 'ม้านั่งคู่',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BOX.w, BOX.h, BOX.d], [0, BOX.h / 2, 0], 'terracotta'),
      kit.box([BOX.w - 0.04, 0.03, BOX.d - 0.04], [0, BOX.h - 0.015, 0], 'bark'), // soil
    ];
    for (const s of [1, -1]) {
      const seatX = s * (SEAT.x0 + SEAT.d / 2);
      parts.push(
        kit.box([SEAT.d, SEAT.t, LEN], [seatX, SEAT.y, 0], 'wood'),
        kit.box([BACK.t, BACK.top - SEAT.y, LEN], [s * (SEAT.x0 + BACK.t / 2), (BACK.top + SEAT.y) / 2, 0], 'wood'),
        kit.box([BACK.t + 0.02, 0.05, LEN + 0.04], [s * (SEAT.x0 + BACK.t / 2), BACK.top, 0], 'woodDark'), // top rail
      );
      for (const z of [-0.65, 0.65]) {
        parts.push(
          kit.box([SEAT.d - 0.04, SEAT.y - SEAT.t / 2, 0.05], [seatX, (SEAT.y - SEAT.t / 2) / 2, z], 'charcoal'),
        );
      }
    }
    // flowers and leaf bumps along the box
    const flowers: PaletteColor[] = ['red', 'sunYellow', 'pink', 'orange', 'purple'];
    for (let k = 0; k < 10; k++) {
      const z = -0.66 + k * 0.147;
      parts.push(
        kit.sphere(0.07, [0, BOX.h + 0.03, z], 'leaf', { detail: 0, scale: [1, 0.8, 1.1] }),
        kit.sphere(0.045, [k % 2 === 0 ? 0.03 : -0.03, BOX.h + 0.11, z], flowers[k % flowers.length], { detail: 0 }),
      );
    }
    return kit.finish(parts);
  },
};

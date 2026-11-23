import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { ICO_LOW } from '../../../models/parts';
import type { PaletteColor } from '../../../models/palette';

// Two round wheeled stools side by side along z: a round seat (top 0.31), a column and a four-armed base
// with a little ball wheel on each arm.
const SEAT_TOP = 0.31;
const WHEEL_R = 0.035;
const ARM = 0.17; // reach of a base arm from the column
const STOOLS: readonly { z: number; seat: PaletteColor; cap: PaletteColor }[] = [
  { z: -0.26, seat: 'orange', cap: 'sunYellow' },
  { z: 0.26, seat: 'blue', cap: 'skyBlue' },
];

/** เก้าอี้สตูลคู่: two round wheeled stools. */
export const item: ItemModel = {
  id: 'stool-pair',
  name: 'เก้าอี้สตูลคู่',
  category: 'seating',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [];
    const wy = WHEEL_R * ICO_LOW;
    for (const s of STOOLS) {
      const arm = 0.07 + WHEEL_R; // base arm height above the floor
      parts.push(
        kit.cylinder(0.04, 0.04, SEAT_TOP - 0.06 - arm, [0, arm + (SEAT_TOP - 0.06 - arm) / 2, s.z], 'chrome', { segments: 8 }),
        kit.cylinder(0.22, 0.2, 0.06, [0, SEAT_TOP - 0.03, s.z], s.seat, { segments: 12 }),
        kit.cylinder(0.17, 0.2, 0.02, [0, SEAT_TOP - 0.01 + 0.0, s.z], s.cap, { segments: 12 }),
        kit.box([ARM * 2, 0.03, 0.045], [0, arm, s.z], 'charcoal'),
        kit.box([0.045, 0.03, ARM * 2], [0, arm, s.z], 'charcoal'),
      );
      for (const [dx, dz] of [[ARM, 0], [-ARM, 0], [0, ARM], [0, -ARM]] as const) {
        parts.push(kit.sphere(WHEEL_R, [dx, wy, s.z + dz], 'stoneDark', { detail: 0 }));
        parts.push(kit.box([0.025, arm - wy, 0.025], [dx, (arm + wy) / 2, s.z + dz], 'charcoal'));
      }
    }
    return kit.finish(parts);
  },
};

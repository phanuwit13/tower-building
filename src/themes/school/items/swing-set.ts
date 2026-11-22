import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

const TOP = 1.24; // height of the top bar
const SPREAD = 0.56; // A-frame feet at z = ±SPREAD
const LEG_R = 0.05;
const BAR_HALF = 0.86;
const SEAT_Y = 0.4;
const PIT = { w: 1.86, d: 1.5, edge: 0.08, h: 0.07 }; // sandpit and its wooden edging

/** ชิงช้า: a playground A-frame swing set with two swings, standing in a wood-edged sandpit. */
export const item: ItemModel = {
  id: 'swing-set',
  name: 'ชิงช้า',
  category: 'play',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([PIT.w - PIT.edge, 0.03, PIT.d - PIT.edge], [0, 0.015, 0], 'sand')];
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([PIT.w, PIT.h, PIT.edge], [0, PIT.h / 2, (s * (PIT.d - PIT.edge)) / 2], 'wood'),
        kit.box([PIT.edge, PIT.h, PIT.d - 2 * PIT.edge], [(s * (PIT.w - PIT.edge)) / 2, PIT.h / 2, 0], 'wood'),
      );
    }
    const len = Math.hypot(TOP, SPREAD);
    const tilt = Math.atan2(SPREAD, TOP);
    const lift = LEG_R * Math.sin(tilt); // a tilted cylinder's bottom rim dips by this much: keep it above the ground
    for (const x of [-BAR_HALF + 0.06, BAR_HALF - 0.06]) {
      for (const s of [-1, 1]) {
        parts.push(kit.cylinder(LEG_R, LEG_R, len, [x, TOP / 2 + lift, (s * SPREAD) / 2], 'blue', { rotate: [-s * tilt, 0, 0], segments: 8 }));
      }
    }
    parts.push(
      kit.cylinder(0.055, 0.055, BAR_HALF * 2, [0, TOP, 0], 'red', { rotate: [0, 0, Math.PI / 2], segments: 8 }),
      kit.sphere(0.08, [-BAR_HALF, TOP, 0], 'red', { detail: 0 }),
      kit.sphere(0.08, [BAR_HALF, TOP, 0], 'red', { detail: 0 }),
    );
    const swings: Array<[number, PaletteColor]> = [[-0.38, 'sunYellow'], [0.38, 'orange']];
    for (const [sx, color] of swings) {
      for (const dx of [-0.17, 0.17]) {
        parts.push(kit.cylinder(0.018, 0.018, TOP - SEAT_Y, [sx + dx, (TOP + SEAT_Y) / 2, 0], 'stoneDark', { segments: 4 }));
      }
      parts.push(kit.box([0.44, 0.06, 0.24], [sx, SEAT_Y, 0], color));
    }
    return kit.finish(parts);
  },
};

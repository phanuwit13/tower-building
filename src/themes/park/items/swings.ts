import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

const G = 0.03;
const TOP = 1.2; // top bar height, the bar runs along z
const BAR_HALF = 0.82;
const SPREAD = 0.4; // A-frame feet at x = ±SPREAD
const LEG_R = 0.045;
const SEAT = { y: 0.42, x: 0.2, h: 0.05, z: 0.34 }; // seat size and rest height (its top)
const ROPE_DZ = 0.14;
const AMOUNT = 0.3; // swing angle in radians (about 17 degrees)
// Rope length 0.78. At the tip the seat centre is at x = 0.78 sin(0.3) = 0.23 and y = 1.2 - 0.78 cos(0.3) = 0.45
// (above its rest height); its lowest corner stays at about 0.40, far above the ground (0.03).
// The legs stand at z = ±0.85, outside the seats (z up to ±0.47), so a swing never meets the frame.
const SEATS: Array<{ z: number; color: PaletteColor }> = [{ z: -0.32, color: 'sunYellow' }, { z: 0.32, color: 'orange' }];

/** ชิงช้าคู่: a red A-frame with two swings that swing gently from the top bar, on a soft blue floor. */
export const item: ItemModel = {
  id: 'swings',
  name: 'ชิงช้าคู่',
  category: 'play',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.96, G, 1.96], [0, G / 2, 0], 'blue')];
    for (const s of [-1, 1]) {
      const z = s * (BAR_HALF + 0.03);
      for (const x of [-SPREAD, SPREAD]) {
        parts.push(rod(kit, [0, TOP - 0.02, z], [x, G + 0.03, z], LEG_R, 'red', { segments: 8 }), kit.box([0.14, 0.06, 0.14], [x, G + 0.03, z], 'charcoal'));
      }
      parts.push(kit.sphere(0.07, [0, TOP, s * (BAR_HALF + 0.09)], 'sunYellow', { detail: 0 }));
    }
    parts.push(kit.cylinder(0.05, 0.05, 2 * (BAR_HALF + 0.03), [0, TOP, 0], 'red', { rotate: [Math.PI / 2, 0, 0], segments: 8 }));
    for (const { z, color } of SEATS) {
      const swing: MotionOpts = { kind: 'swing', pivot: [0, TOP, z], axis: [0, 0, 1], amount: AMOUNT };
      for (const dz of [-ROPE_DZ, ROPE_DZ]) {
        parts.push(kit.cylinder(0.016, 0.016, TOP - SEAT.y, [0, (TOP + SEAT.y) / 2, z + dz], 'stoneDark', { segments: 4, motion: swing }));
      }
      parts.push(kit.box([SEAT.x, SEAT.h, SEAT.z], [0, SEAT.y - SEAT.h / 2, z], color, { motion: swing }));
    }
    return kit.finish(parts);
  },
};

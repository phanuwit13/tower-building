import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// 1x2, long side along z. A strip of canal runs the full length (z) between two grass banks, so several can
// be lined up into a canal; a wooden rowboat floats on it, tied with a rope to a post on the +x bank.
const BANK_TOP = 0.14;
const CANAL = 0.5;
const WATER_TOP = 0.05;
const SIDE_X = 0.15; // half-width of the straight part of the hull
const STRAIGHT = 0.35; // half-length of the straight part
const TIP = 0.62; // z of the bow and stern points
const TILT = 0.2; // sides lean outwards
const SIDE_H = 0.16;
const SIDE_Y = 0.14;

/** เรือพาย: a wooden rowboat with paddles on a strip of canal, tied to a post. */
export const item: ItemModel = {
  id: 'rowboat',
  name: 'เรือพาย',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const bankW = (1 - CANAL) / 2 - 0.002;
    const bx = CANAL / 2 + bankW / 2 + 0.001;
    const parts: Part[] = [
      kit.box([CANAL, WATER_TOP, 1.996], [0, WATER_TOP / 2, 0], 'navy', { motion: { kind: 'water', water: 'pond' } }),
    ];
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([bankW, 0.1, 1.996], [s * bx, 0.05, 0], 'stone'),
        kit.box([bankW, BANK_TOP - 0.1, 1.996], [s * bx, 0.1 + (BANK_TOP - 0.1) / 2, 0], 'lime'),
      );
    }
    // hull: a rounded bottom and planked sides that close to a point at bow (+z) and stern (-z)
    parts.push(kit.sphere(0.5, [0, 0.14, 0], 'woodDark', { scale: [0.34, 0.2, 1.2] }));
    const dx = SIDE_X;
    const dz = TIP - STRAIGHT;
    const endLen = Math.hypot(dx, dz);
    const endYaw = Math.atan2(dx, dz);
    for (const sx of [-1, 1]) {
      parts.push(kit.box([0.035, SIDE_H, STRAIGHT * 2], [sx * SIDE_X, SIDE_Y, 0], 'blue', { rotate: [0, 0, -sx * TILT] }));
      for (const sz of [-1, 1]) {
        // from (sx*SIDE_X, sz*STRAIGHT) to (0, sz*TIP)
        parts.push(kit.box([0.035, SIDE_H, endLen], [sx * SIDE_X / 2, SIDE_Y, sz * (STRAIGHT + dz / 2)], 'blue', { rotate: [0, -sx * sz * endYaw, -sx * TILT * 0.6] }));
      }
      // white trim along the top edge
      parts.push(kit.box([0.04, 0.025, STRAIGHT * 2], [sx * (SIDE_X + 0.016), SIDE_Y + SIDE_H / 2 - 0.0, 0], 'white', { rotate: [0, 0, -sx * TILT] }));
    }
    // pointed deck caps at both ends and two seats
    for (const sz of [-1, 1]) {
      parts.push(kit.wedge([0.2, 0.04, 0.2], [0, 0.205, sz * (TIP - 0.14)], 'wood', { rotate: [0, sz > 0 ? 0 : Math.PI, 0] }));
    }
    parts.push(
      kit.box([0.32, 0.03, 0.1], [0, 0.185, 0.12], 'wood'),
      kit.box([0.32, 0.03, 0.1], [0, 0.185, -0.22], 'wood'),
      kit.box([0.2, 0.03, 0.8], [0, 0.09, -0.02], 'sand'), // floor boards
    );
    // two paddles lying on the seats, blades at opposite ends
    for (const s of [-1, 1]) {
      const x = s * 0.06;
      parts.push(
        kit.cylinder(0.016, 0.016, 0.85, [x, 0.222, -0.02], 'woodDark', { segments: 6, rotate: [Math.PI / 2, 0, 0] }),
        kit.box([0.09, 0.015, 0.22], [x, 0.222, -s * 0.38], 'orange'),
        kit.sphere(0.025, [x, 0.222, s * 0.41], 'woodDark', { detail: 0 }),
      );
    }
    // mooring post on the +x bank and the rope to the bow
    parts.push(
      kit.cylinder(0.05, 0.055, 0.38, [0.38, BANK_TOP + 0.19, 0.5], 'woodDark', { segments: 8 }),
      kit.sphere(0.05, [0.38, BANK_TOP + 0.4, 0.5], 'wood', { detail: 0 }),
      rod(kit, [0.36, BANK_TOP + 0.3, 0.5], [0.02, 0.22, TIP - 0.05], 0.016, 'stoneDark', { segments: 4 }),
      kit.sphere(0.12, [-0.34, BANK_TOP + 0.07, -0.7], 'leaf', { detail: 0, scale: [1.2, 0.8, 1] }),
      kit.sphere(0.05, [-0.36, BANK_TOP + 0.15, -0.7], 'sunYellow', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};

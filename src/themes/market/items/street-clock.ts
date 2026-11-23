import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A green post clock: round stone foot, slim post, a double-faced clock drum on top. Both faces glow
// like windows at night.
const FOOT_H = 0.1;
const POST_TOP = 1.5;
const CLOCK = { y: 1.72, r: 0.32, depth: 0.16 };
const FACE_X = CLOCK.depth / 2 + 0.01;

/** นาฬิกาเสา: a green post clock with a glowing face. */
export const item: ItemModel = {
  id: 'street-clock',
  name: 'นาฬิกาเสา',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.26, 0.3, FOOT_H, [0, FOOT_H / 2, 0], 'stone', { segments: 12 }),
      kit.cylinder(0.1, 0.13, 0.2, [0, FOOT_H + 0.1, 0], 'leafDark', { segments: 12 }),
      kit.cylinder(0.055, 0.065, POST_TOP - FOOT_H - 0.2, [0, (FOOT_H + 0.2 + POST_TOP) / 2, 0], 'leaf', { segments: 12 }),
      kit.cylinder(0.09, 0.07, 0.12, [0, POST_TOP + 0.04, 0], 'leafDark', { segments: 12 }),
      // the drum, axis along x so its faces look to +x and -x
      kit.cylinder(CLOCK.r, CLOCK.r, CLOCK.depth, [0, CLOCK.y, 0], 'leafDark', { segments: 16, rotate: [0, 0, Math.PI / 2] }),
      kit.cone(0.1, 0.16, [0, CLOCK.y + CLOCK.r + 0.07, 0], 'sunYellow', { segments: 8 }),
      kit.sphere(0.04, [0, CLOCK.y + CLOCK.r + 0.18, 0], 'sunYellow', { detail: 0 }),
    ];
    for (const s of [1, -1]) {
      parts.push(
        kit.cylinder(0.265, 0.265, 0.02, [s * FACE_X, CLOCK.y, 0], 'white', { segments: 16, rotate: [0, 0, Math.PI / 2], glow: 'windowWarm', light: 'window' }),
        kit.box([0.012, 0.2, 0.03], [s * (FACE_X + 0.016), CLOCK.y + 0.1, 0], 'navy'), // minute hand (12)
        kit.box([0.012, 0.03, 0.15], [s * (FACE_X + 0.016), CLOCK.y, s * -0.07], 'navy'), // hour hand (3)
        kit.sphere(0.03, [s * (FACE_X + 0.02), CLOCK.y, 0], 'sunYellow', { detail: 0 }),
      );
      for (const [dy, dz] of [[0.22, 0], [-0.22, 0], [0, 0.22], [0, -0.22]] as const) {
        parts.push(kit.box([0.012, dz === 0 ? 0.05 : 0.025, dz === 0 ? 0.025 : 0.05], [s * (FACE_X + 0.016), CLOCK.y + dy, dz], 'sunYellow'));
      }
    }
    return kit.finish(parts);
  },
};

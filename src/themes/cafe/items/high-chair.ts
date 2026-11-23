import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { aim } from '../../../models/parts';

// A tall baby chair (1×1) with a tray; the tray and the child face +x.
const SEAT_Y = 0.55;

/** เก้าอี้เด็กเล็ก: a tall baby chair with a tray. */
export const item: ItemModel = {
  id: 'high-chair',
  name: 'เก้าอี้เด็กเล็ก',
  category: 'seating',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [];
    // splayed legs (wide at the floor)
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const top: [number, number] = [sx * 0.17, sz * 0.17];
      const bot: [number, number] = [sx * 0.34, sz * 0.34];
      const dx = bot[0] - top[0];
      const dz = bot[1] - top[1];
      const len = Math.hypot(dx, dz, SEAT_Y);
      const tilt = Math.acos(SEAT_Y / len);
      const cy = (len / 2) * Math.cos(tilt) + 0.035 * Math.sin(tilt);
      parts.push(kit.cylinder(0.035, 0.035, len, [(top[0] + bot[0]) / 2, cy, (top[1] + bot[1]) / 2], 'orange', { segments: 8, rotate: aim([-dx, SEAT_Y, -dz]) }));
    }
    parts.push(
      kit.box([0.7, 0.03, 0.04], [0.0, 0.2, 0.34], 'sunYellow'),
      kit.box([0.7, 0.03, 0.04], [0.0, 0.2, -0.34], 'sunYellow'),
      kit.box([0.44, 0.07, 0.44], [0, SEAT_Y - 0.035, 0], 'mint'),
      kit.box([0.5, 0.05, 0.5], [0, SEAT_Y + 0.01, 0], 'mint'),
      kit.box([0.44, 0.04, 0.44], [0, SEAT_Y + 0.055, 0], 'pink'), // seat cushion
      kit.box([0.06, 0.44, 0.5], [-0.22, SEAT_Y + 0.26, 0], 'mint', { rotate: [0, 0, 0.08] }), // back
      kit.sphere(0.08, [-0.25, SEAT_Y + 0.52, 0.2], 'sunYellow', { detail: 0 }),
      kit.sphere(0.08, [-0.25, SEAT_Y + 0.52, -0.2], 'sunYellow', { detail: 0 }),
      // arms and the tray in front
      kit.box([0.4, 0.04, 0.05], [0.04, SEAT_Y + 0.2, 0.25], 'mint'),
      kit.box([0.4, 0.04, 0.05], [0.04, SEAT_Y + 0.2, -0.25], 'mint'),
      kit.box([0.34, 0.03, 0.62], [0.28, SEAT_Y + 0.2, 0], 'sunYellow'),
      kit.box([0.3, 0.03, 0.04], [0.31, SEAT_Y + 0.225, 0.29], 'orange'),
      kit.box([0.3, 0.03, 0.04], [0.31, SEAT_Y + 0.225, -0.29], 'orange'),
      kit.box([0.04, 0.03, 0.6], [0.45, SEAT_Y + 0.225, 0], 'orange'),
      kit.cylinder(0.08, 0.06, 0.04, [0.3, SEAT_Y + 0.23, 0.12], 'red', { segments: 12 }), // a little bowl and a ball
      kit.sphere(0.05, [0.3, SEAT_Y + 0.28, -0.14], 'leaf', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};

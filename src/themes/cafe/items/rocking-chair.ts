import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// The whole chair is one rigid body rocking back and forth (about z, so the front, +x, tips down and up) around
// the middle of its rockers, on the floor. The rockers are two shallow slopes meeting at that point: each rises
// RISE_ANGLE (about 9 degrees) which is steeper than the rock itself, so neither end can sink through the floor.
const ROCK: MotionOpts = { kind: 'swing', pivot: [0, 0, 0], axis: [0, 0, 1], amount: 0.08 };
const RISE_ANGLE = 0.16;
const HALF = 0.47; // length of each rocker slope
const THICK = 0.045;
const SEAT_Y = 0.31;

/** เก้าอี้โยก: a wooden rocking chair with a striped blanket; it rocks gently on its rockers. */
export const item: ItemModel = {
  id: 'rocking-chair',
  name: 'เก้าอี้โยก',
  category: 'seating',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const m = { motion: ROCK };
    const parts: Part[] = [];
    const c = Math.cos(RISE_ANGLE);
    const s = Math.sin(RISE_ANGLE);
    for (const z of [-0.3, 0.3]) {
      for (const side of [-1, 1]) {
        // each slope's lower inner corner sits exactly on the pivot point (0, 0)
        const cx = side * ((HALF / 2) * c - (THICK / 2) * s);
        const cy = (HALF / 2) * s + (THICK / 2) * c;
        parts.push(kit.box([HALF, THICK, 0.05], [cx, cy, z], 'woodDark', { rotate: [0, 0, side * RISE_ANGLE], ...m }));
      }
      for (const x of [-0.2, 0.2]) parts.push(kit.box([0.05, 0.27, 0.05], [x, 0.185, z], 'wood', m));
      parts.push(kit.box([0.34, 0.03, 0.05], [0.04, 0.46, z], 'wood', m)); // armrest
      parts.push(kit.box([0.04, 0.12, 0.04], [0.19, 0.4, z], 'wood', m)); // arm post
      parts.push(kit.box([0.04, 0.42, 0.04], [-0.26, 0.46, z * 0.9], 'wood', { rotate: [0, 0, 0.15], ...m })); // back post
    }
    parts.push(
      kit.box([0.48, 0.05, 0.6], [0, SEAT_Y - 0.025, 0], 'wood', m),
      // slatted back, leaning with the posts
      kit.box([0.03, 0.08, 0.5], [-0.255, 0.42, 0], 'wood', { rotate: [0, 0, 0.15], ...m }),
      kit.box([0.03, 0.08, 0.5], [-0.28, 0.53, 0], 'wood', { rotate: [0, 0, 0.15], ...m }),
      kit.box([0.03, 0.08, 0.5], [-0.305, 0.64, 0], 'wood', { rotate: [0, 0, 0.15], ...m }),
      // striped blanket over the seat and down the back
      kit.box([0.34, 0.03, 0.46], [0.07, SEAT_Y + 0.015, 0], 'red', m),
      kit.box([0.06, 0.032, 0.46], [0.1, SEAT_Y + 0.016, 0], 'cream', m),
      kit.box([0.06, 0.032, 0.46], [-0.02, SEAT_Y + 0.016, 0], 'cream', m),
      kit.box([0.03, 0.28, 0.46], [-0.225, 0.47, 0], 'red', { rotate: [0, 0, 0.15], ...m }),
      kit.box([0.032, 0.05, 0.46], [-0.235, 0.52, 0], 'cream', { rotate: [0, 0, 0.15], ...m }),
    );
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { aim } from '../../../models/parts';

// A small dish on a post (1x1). The dish, its arm and feed turn together about the post axis.
const BASE = { w: 0.9, h: 0.04 };
const POST_TOP = 0.7;
const PIVOT: Vec3 = [0, POST_TOP, 0];
const SPIN: MotionOpts = { kind: 'spin', pivot: PIVOT, axis: [0, 1, 0], speed: 0.4 };
const TILT = 0.5;
const N: Vec3 = [Math.cos(TILT), Math.sin(TILT), 0];
const DISH = { x: 0.08, y: 0.9, r: 0.28, rBack: 0.07, depth: 0.12 };
const C: Vec3 = [DISH.x, DISH.y, 0];

/**
 * จานรับสัญญาณเล็ก: a small turning dish on a post. Swing check: the dish rim is at most about
 * sqrt(0.3^2 + 0.28^2) = 0.41 from the axis, inside the 0.5 half-footprint; the post top is the pivot.
 */
export const item: ItemModel = {
  id: 'mini-dish',
  name: 'จานรับสัญญาณเล็ก',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.w], [0, BASE.h / 2, 0], 'stone'),
      kit.cylinder(0.16, 0.2, 0.1, [0, BASE.h + 0.05, 0], 'orange', { segments: 10 }),
      kit.cylinder(0.06, 0.08, POST_TOP - BASE.h - 0.1, [0, (POST_TOP + BASE.h + 0.1) / 2, 0], 'white', { segments: 8 }),
      kit.cylinder(0.1, 0.1, 0.06, [0, POST_TOP + 0.03, 0], 'blue', { segments: 10, motion: SPIN }),
      kit.cylinder(0.035, 0.035, DISH.y - POST_TOP - 0.03, [0, (DISH.y + POST_TOP + 0.03) / 2, 0], 'charcoal', { segments: 6, motion: SPIN }),
      kit.cylinder(DISH.r, DISH.rBack, DISH.depth, C, 'white', { segments: 12, rotate: aim(N), motion: SPIN }),
      kit.cylinder(DISH.r + 0.02, DISH.r + 0.02, 0.035, [C[0] + N[0] * (DISH.depth / 2 - 0.018), C[1] + N[1] * (DISH.depth / 2 - 0.018), 0], 'red', { segments: 12, rotate: aim(N), motion: SPIN }),
      kit.cylinder(DISH.r - 0.06, DISH.r - 0.06, 0.02, [C[0] + N[0] * (DISH.depth / 2 + 0.005), C[1] + N[1] * (DISH.depth / 2 + 0.005), 0], 'skyBlue', { segments: 12, rotate: aim(N), motion: SPIN }),
      kit.cylinder(0.012, 0.012, 0.28, [C[0] + N[0] * 0.14, C[1] + N[1] * 0.14, 0], 'charcoal', { segments: 4, rotate: aim(N), motion: SPIN }),
      kit.sphere(0.03, [C[0] + N[0] * 0.28, C[1] + N[1] * 0.28, 0], 'sunYellow', { detail: 0, motion: SPIN }),
    ];
    return kit.finish(parts);
  },
};

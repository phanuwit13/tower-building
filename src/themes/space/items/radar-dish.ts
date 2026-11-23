import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { aim, glassWindow } from '../../../models/parts';

// A big radar dish on a tower (2x2). Everything above the tower top (hub, arm, dish, feed horn,
// counterweight) turns together about the tower axis, one shared pivot.
const PAD = { w: 1.9, h: 0.05, d: 1.9 };
const TOWER = { rTop: 0.12, rBot: 0.2, top: 1.2 };
const PIVOT: Vec3 = [0, TOWER.top, 0];
const SPIN: MotionOpts = { kind: 'spin', pivot: PIVOT, axis: [0, 1, 0], speed: 0.35 };
const TILT = 0.35; // radians above horizontal
const N: Vec3 = [Math.cos(TILT), Math.sin(TILT), 0];
const DISH = { x: 0.25, y: 1.58, r: 0.62, rBack: 0.12, depth: 0.22 };
const C: Vec3 = [DISH.x, DISH.y, 0];
const HUT = { x: -0.62, z: -0.62, w: 0.55, h: 0.42 };

/**
 * จานเรดาร์: a tall tower with a big turning dish. Swing check: the farthest turning point is the
 * dish rim, about sqrt(0.5^2 + 0.62^2) = 0.8 from the axis; the hut (top 0.47) is far below the dish
 * (lowest about 1.0), the tower top is the pivot, so nothing turning meets anything still.
 */
export const item: ItemModel = {
  id: 'radar-dish',
  name: 'จานเรดาร์',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([PAD.w, PAD.h, PAD.d], [0, PAD.h / 2, 0], 'stone'),
      kit.cylinder(TOWER.rTop, TOWER.rBot, TOWER.top - PAD.h, [0, (TOWER.top + PAD.h) / 2, 0], 'white', { segments: 10 }),
      kit.cylinder(0.185, 0.185, 0.1, [0, 0.35, 0], 'red', { segments: 10 }),
      kit.cylinder(0.155, 0.155, 0.1, [0, 0.72, 0], 'red', { segments: 10 }),
      kit.cylinder(0.28, 0.3, 0.1, [0, PAD.h + 0.05, 0], 'stoneDark', { segments: 10 }),
      // control hut
      kit.box([HUT.w, HUT.h, HUT.w], [HUT.x, PAD.h + HUT.h / 2, HUT.z], 'blue'),
      kit.box([HUT.w + 0.08, 0.06, HUT.w + 0.08], [HUT.x, PAD.h + HUT.h + 0.03, HUT.z], 'orange'),
      ...glassWindow(kit, { at: [HUT.x + HUT.w / 2, PAD.h + 0.22, HUT.z], facing: 'x+', w: 0.3, h: 0.16, panes: 2 }),
      ...glassWindow(kit, { at: [HUT.x, PAD.h + 0.22, HUT.z + HUT.w / 2], facing: 'z+', w: 0.3, h: 0.16, panes: 2 }),
      // turning head
      kit.cylinder(0.1, 0.1, 0.12, [0, TOWER.top + 0.06, 0], 'orange', { segments: 10, motion: SPIN }),
      kit.box([0.62, 0.08, 0.1], [-0.05 + 0.0, DISH.y - 0.05, 0], 'charcoal', { motion: SPIN }),
      kit.cylinder(0.05, 0.05, DISH.y - 0.05 - TOWER.top, [0, (DISH.y - 0.05 + TOWER.top) / 2, 0], 'charcoal', { segments: 8, motion: SPIN }),
      kit.box([0.2, 0.26, 0.34], [-0.4, DISH.y - 0.05, 0], 'orange', { motion: SPIN }),
      // the dish: white bowl, red rim, sky-blue face, feed horn out in front
      kit.cylinder(DISH.r, DISH.rBack, DISH.depth, C, 'white', { segments: 14, rotate: aim(N), motion: SPIN }),
      kit.cylinder(DISH.r + 0.02, DISH.r + 0.02, 0.05, [C[0] + N[0] * (DISH.depth / 2 - 0.025), C[1] + N[1] * (DISH.depth / 2 - 0.025), 0], 'red', { segments: 14, rotate: aim(N), motion: SPIN }),
      kit.cylinder(DISH.r - 0.08, DISH.r - 0.08, 0.02, [C[0] + N[0] * (DISH.depth / 2 + 0.005), C[1] + N[1] * (DISH.depth / 2 + 0.005), 0], 'skyBlue', { segments: 14, rotate: aim(N), motion: SPIN }),
      kit.cylinder(0.02, 0.02, 0.5, [C[0] + N[0] * 0.25, C[1] + N[1] * 0.25, 0], 'charcoal', { segments: 4, rotate: aim(N), motion: SPIN }),
      kit.sphere(0.05, [C[0] + N[0] * 0.5, C[1] + N[1] * 0.5, 0], 'sunYellow', { detail: 0, motion: SPIN }),
    ];
    return kit.finish(parts);
  },
};

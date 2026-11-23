import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { rod } from '../../../models/parts';

const WATER_H = 0.05;
const WATER: MotionOpts = { kind: 'water', water: 'pond' };
const HULL = { y: 0.2, rx: 0.38, ry: 0.225, rz: 0.8 };

/** เรือถีบ: a swan-shaped pedal boat (head at +z) with a canopy and a seat, on a patch of water. */
export const item: ItemModel = {
  id: 'pedal-boat',
  name: 'เรือถีบ',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.96, WATER_H, 1.96], [0, WATER_H / 2, 0], 'navy', { motion: WATER }),
      kit.sphere(1, [0, HULL.y + 0.026, 0], 'white', { scale: [HULL.rx, HULL.ry, HULL.rz] }),
      // wings along the sides
      kit.sphere(1, [-0.27, 0.37, -0.1], 'glassBlue', { detail: 0, scale: [0.12, 0.14, 0.45] }),
      kit.sphere(1, [0.27, 0.37, -0.1], 'glassBlue', { detail: 0, scale: [0.12, 0.14, 0.45] }),
      // tail
      kit.cone(0.1, 0.28, [0, 0.35, -0.72], 'white', { segments: 8, rotate: [-1.2, 0, 0] }),
      // neck, head, beak, eyes
      rod(kit, [0, 0.3, 0.55], [0, 0.78, 0.72], 0.06, 'white', { segments: 8 }),
      kit.sphere(0.1, [0, 0.86, 0.74], 'white'),
      kit.cone(0.045, 0.14, [0, 0.83, 0.9], 'orange', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
      kit.sphere(0.022, [0.075, 0.9, 0.78], 'charcoal', { detail: 0 }),
      kit.sphere(0.022, [-0.075, 0.9, 0.78], 'charcoal', { detail: 0 }),
      // seat and backrest
      kit.box([0.5, 0.06, 0.2], [0, 0.42, -0.1], 'blue'),
      kit.box([0.5, 0.24, 0.05], [0, 0.52, -0.24], 'blue'),
      // pedals up front
      kit.box([0.1, 0.03, 0.1], [0.12, 0.3, 0.22], 'orange'),
      kit.box([0.1, 0.03, 0.1], [-0.12, 0.34, 0.3], 'orange'),
      // canopy on four posts
      kit.dome(0.4, [0, 0.82, -0.1], 'orange', { segments: 12, scale: [1, 0.4, 1.4] }),
    ];
    for (const x of [-0.3, 0.3]) {
      for (const z of [-0.4, 0.2]) parts.push(kit.cylinder(0.02, 0.02, 0.5, [x, 0.57, z], 'white', { segments: 4 }));
    }
    return kit.finish(parts);
  },
};

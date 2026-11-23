import type { ItemModel } from '../../../models/contract';
import type { MotionOpts } from '../../../models/motion';
import type { Part, Vec3 } from '../../../models/kit';
import { aim, along, heading } from '../../../models/parts';

// 1x1. A tall clump of bamboo. Every stalk, node and leaf shares ONE sway pivot at the soil line,
// so the clump bends together and the roots stay put.
const SOIL_H = 0.06;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, SOIL_H, 0], amount: 0.035 };
/** [x, z, height, radius]. Tallest about 2.2 (the limit is 2.4). */
const STALKS: Array<[number, number, number, number]> = [
  [0.0, 0.0, 2.1, 0.045], [0.2, 0.12, 1.75, 0.04], [-0.18, 0.1, 1.9, 0.045], [0.08, -0.22, 1.6, 0.04],
  [-0.12, -0.24, 1.45, 0.035], [0.26, -0.18, 1.3, 0.035], [-0.28, -0.04, 1.25, 0.035],
];

/** กอไผ่: a tall clump of bamboo stems that sways. */
export const item: ItemModel = {
  id: 'bamboo-clump',
  name: 'กอไผ่',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.98, 0.03, 0.98], [0, 0.015, 0], 'lime'),
      kit.box([0.7, SOIL_H, 0.7], [0, SOIL_H / 2 + 0.005, 0], 'bark'), // soil mound
    ];
    STALKS.forEach(([x, z, h, r], i) => {
      parts.push(kit.cylinder(r * 0.8, r, h, [x, SOIL_H + h / 2, z], i % 2 === 0 ? 'leaf' : 'lime', { segments: 6, motion: SWAY }));
      parts.push(kit.cylinder(r * 1.25, r * 1.25, 0.03, [x, SOIL_H + h * 0.45, z], 'leafDark', { segments: 6, motion: SWAY })); // node ring
      const blades = i < 4 ? 3 : 2;
      for (let k = 0; k < blades; k++) {
        const yaw = ((k + i * 0.37) / blades) * Math.PI * 2;
        const top: Vec3 = [x, SOIL_H + h - 0.05, z];
        const dir = heading(yaw, 0.7);
        parts.push(kit.cone(0.06, 0.32, along(top, dir, 0.16), i % 3 === 0 ? 'leafDark' : 'leaf', { segments: 4, rotate: aim(dir), scale: [1, 1, 0.5], motion: SWAY }));
      }
    });
    return kit.finish(parts);
  },
};

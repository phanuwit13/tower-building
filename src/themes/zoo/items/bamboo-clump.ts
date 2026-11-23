import type { ItemModel } from '../../../models/contract';
import type { MotionOpts } from '../../../models/motion';
import type { Part, Vec3 } from '../../../models/kit';
import { aim, along, heading } from '../../../models/parts';

// 1x2, long side along z. A dense clump of stalks of different heights; every stalk, node and leaf
// shares one sway pivot at the soil line so the clump bends together and the roots stay put.
const SOIL_H = 0.05;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, SOIL_H, 0], amount: 0.035 };
/** [x, z, height, radius]. */
const STALKS: Array<[number, number, number, number]> = [
  [0.0, -0.1, 1.9, 0.045], [0.16, 0.2, 1.55, 0.04], [-0.14, 0.45, 1.75, 0.045], [0.1, -0.5, 1.45, 0.04],
  [-0.12, -0.3, 1.6, 0.04], [0.04, 0.62, 1.3, 0.035], [-0.04, 0.1, 1.4, 0.04], [0.14, -0.72, 1.15, 0.035], [-0.1, -0.66, 1.25, 0.035],
];

/** กอไผ่: a dense bamboo clump. */
export const item: ItemModel = {
  id: 'bamboo-clump',
  name: 'กอไผ่',
  category: 'nature',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.8, 0.03, 1.7], [0, 0.015, 0], 'lime'),
      kit.box([0.5, SOIL_H, 1.5], [0, SOIL_H / 2 + 0.005, 0.0], 'bark'), // soil mound
    ];
    STALKS.forEach(([x, z, h, r], i) => {
      const color = i % 2 === 0 ? 'leaf' : 'lime';
      const base = SOIL_H;
      parts.push(kit.cylinder(r * 0.8, r, h, [x, base + h / 2, z], color, { segments: 6, motion: SWAY }));
      for (const f of [0.3, 0.6]) parts.push(kit.cylinder(r * 1.2, r * 1.2, 0.03, [x, base + h * f, z], 'leafDark', { segments: 6, motion: SWAY })); // nodes
      // three leaf blades fanned out from the top
      for (let k = 0; k < 3; k++) {
        const yaw = ((k + i * 0.37) / 3) * Math.PI * 2;
        const top: Vec3 = [x, base + h - 0.05, z];
        const dir = heading(yaw, 0.7);
        parts.push(kit.cone(0.06, 0.34, along(top, dir, 0.17), i % 3 === 0 ? 'leafDark' : 'leaf', { segments: 4, rotate: aim(dir), scale: [1, 1, 0.5], motion: SWAY }));
      }
    });
    return kit.finish(parts);
  },
};

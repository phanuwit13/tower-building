import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { rod } from '../../../models/parts';

const RIM = { w: 0.9, d: 1.8, t: 0.1, h: 0.14 }; // outer size of the pool wall, and its thickness
const WATER = { h: 0.08 };
const DUCK = { body: 0.075, head: 0.045 };
/** Floating ducks: [x, z, yaw]. */
const DUCKS: Array<[number, number, number]> = [
  [0.12, -0.6, 0.5], [-0.14, -0.3, 2.4], [0.1, 0.0, 4.2], [-0.12, 0.3, 1.0], [0.14, 0.58, 3.4], [-0.05, -0.05, 5.6],
];
/** Two rods leaning on the +x rim: [z, colour is alternated]. The foot is on the ground outside, the tip over the water. */
const RODS = { z: [-0.5, 0.5], foot: [0.48, 0.02], tip: [0.1, 0.66] };

/** เกมตกเป็ด: a small pool with floating yellow ducks and two fishing rods leaning on the rim. */
export const item: ItemModel = {
  id: 'duck-fishing',
  name: 'เกมตกเป็ด',
  category: 'play',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const iw = RIM.w - 2 * RIM.t;
    const id = RIM.d - 2 * RIM.t;
    const parts: Part[] = [
      kit.box([iw, WATER.h, id], [0, WATER.h / 2, 0], 'skyBlue', { motion: { kind: 'water', water: 'pool' } }),
    ];
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([RIM.t, RIM.h, RIM.d], [s * (RIM.w - RIM.t) / 2, RIM.h / 2, 0], 'red'),
        kit.box([iw, RIM.h, RIM.t], [0, RIM.h / 2, s * (RIM.d - RIM.t) / 2], 'red'),
        // white caps on the rim
        kit.box([RIM.t + 0.02, 0.03, RIM.d * 0.9], [s * (RIM.w - RIM.t) / 2, RIM.h + 0.015, 0], 'white'),
      );
    }
    for (const [x, z, yaw] of DUCKS) {
      const c = Math.cos(yaw);
      const s = Math.sin(yaw);
      // a point in the duck's own frame (+x = its front), turned by `yaw` about y
      const at = (lx: number, ly: number): Vec3 => [x + lx * c, WATER.h + ly, z - lx * s];
      const rotate: Vec3 = [0, yaw, 0];
      parts.push(
        kit.sphere(DUCK.body, at(0, DUCK.body * 0.55), 'sunYellow', { detail: 0, scale: [1.25, 0.8, 1], rotate }),
        kit.sphere(DUCK.head, at(0.075, DUCK.body * 1.3), 'sunYellow', { detail: 0 }),
        kit.box([0.045, 0.02, 0.05], at(0.13, DUCK.body * 1.25), 'orange', { rotate }),
        kit.box([0.04, 0.04, 0.04], at(-0.1, DUCK.body * 0.95), 'sunYellow', { rotate: [0, yaw, 0.4] }),
      );
    }
    RODS.z.forEach((z, k) => {
      parts.push(
        rod(kit, [RODS.foot[0], RODS.foot[1], z], [RODS.tip[0], RODS.tip[1], z], 0.018, k === 0 ? 'wood' : 'woodDark', { segments: 4 }),
        kit.sphere(0.03, [RODS.tip[0], RODS.tip[1], z], k === 0 ? 'orange' : 'pink', { detail: 0 }),
      );
    });
    return kit.finish(parts);
  },
};

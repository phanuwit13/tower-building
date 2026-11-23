import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { along, heading } from '../../../models/parts';

const SAND = { r: 0.46, h: 0.03 };
const CORE = { r: 0.17, ry: 0.07, y: SAND.h + 0.05 };
const ARMS = 5;
/** Each arm is three flat ellipsoids getting smaller towards the tip: [distance from the centre, [rx, ry, rz], detail]. */
const ARM_PIECES: Array<[number, [number, number, number], 0 | 1]> = [
  [0.13, [0.15, 0.065, 0.085], 0],
  [0.27, [0.1, 0.05, 0.06], 0],
  [0.36, [0.06, 0.035, 0.038], 0],
];

/** ปลาดาว: a big orange starfish with a smiley face on the sand. */
export const item: ItemModel = {
  id: 'starfish',
  name: 'ปลาดาว',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(SAND.r, SAND.r, SAND.h, [0, SAND.h / 2, 0], 'sand', { segments: 12 }),
      kit.sphere(1, [0, CORE.y, 0], 'orange', { scale: [CORE.r, CORE.ry, CORE.r] }),
    ];
    for (let a = 0; a < ARMS; a++) {
      const yaw = 0.31 + (a / ARMS) * Math.PI * 2;
      for (const [dist, [rx, ry, rz], detail] of ARM_PIECES) {
        const p = along([0, CORE.y - 0.01, 0], heading(yaw, 0), dist);
        parts.push(kit.sphere(1, p, 'orange', { detail, scale: [rx, ry, rz], rotate: [0, yaw, 0] }));
      }
      // yellow bumps along the arm
      for (const dist of [0.26]) {
        const p = along([0, CORE.y + 0.045, 0], heading(yaw, 0), dist);
        parts.push(kit.sphere(0.018, p, 'sunYellow', { detail: 0 }));
      }
    }
    // face on the core, facing up with its "forehead" towards -x: two eyes and a smile
    const top = (x: number, z: number): number => CORE.y + CORE.ry * Math.sqrt(Math.max(0, 1 - (x * x + z * z) / (CORE.r * CORE.r)));
    for (const z of [-0.06, 0.06]) {
      parts.push(
        kit.sphere(0.03, [-0.035, top(-0.035, z) + 0.004, z], 'white', { detail: 0, scale: [1, 0.55, 1] }),
        kit.sphere(0.016, [-0.03, top(-0.03, z) + 0.016, z], 'charcoal', { detail: 0, scale: [1, 0.6, 1] }),
      );
    }
    const SMILE = 7;
    for (let k = 0; k < SMILE; k++) {
      const z = -0.07 + (k / (SMILE - 1)) * 0.14;
      const x = 0.03 + 0.05 * (1 - (z / 0.07) ** 2); // ends up (-x), middle down (+x): a smile
      parts.push(kit.box([0.022, 0.012, 0.03], [x, top(x, z) + 0.002, z], 'charcoal'));
    }
    return kit.finish(parts);
  },
};

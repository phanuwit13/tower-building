import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { aim } from '../../../models/parts';

// Three entry turnstiles side by side along z (people walk through along x), under a red and white striped roof.
const BASE_H = 0.03;
const GATE_Z = [-0.62, 0, 0.62];
const DIVIDER_Z = [-0.93, -0.31, 0.31, 0.93];
const HUB_Y = 0.46;
const ARM = { len: 0.2, r: 0.025, drop: 0.25 };
const ROOF = { y: 1.0, t: 0.06, stripes: 7 };

/** ประตูหมุนทางเข้า: three turnstiles under a striped roof. */
export const item: ItemModel = {
  id: 'turnstiles',
  name: 'ประตูหมุนทางเข้า',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 2], [0, BASE_H / 2, 0], 'stone')];
    for (const z of DIVIDER_Z) {
      parts.push(
        kit.box([0.7, 0.5, 0.05], [0, BASE_H + 0.25, z], 'blue'),
        kit.box([0.74, 0.04, 0.09], [0, BASE_H + 0.52, z], 'white'),
        kit.box([0.06, ROOF.y - BASE_H - 0.5, 0.06], [-0.4, (BASE_H + 0.5 + ROOF.y) / 2 - 0.02, z], 'white'), // posts at the back; roof above
      );
    }
    for (const z of GATE_Z) {
      parts.push(
        kit.cylinder(0.05, 0.06, HUB_Y - BASE_H, [0, (HUB_Y + BASE_H) / 2, z], 'charcoal', { segments: 8 }),
        kit.sphere(0.07, [0, HUB_Y, z], 'chrome', { detail: 0 }),
      );
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2 + Math.PI / 6;
        const dir: [number, number, number] = [Math.cos(a), -ARM.drop, Math.sin(a)];
        const n = Math.hypot(...dir);
        const u = dir.map((c) => c / n) as [number, number, number];
        parts.push(
          kit.cylinder(ARM.r, ARM.r, ARM.len, [u[0] * ARM.len / 2, HUB_Y + u[1] * ARM.len / 2, z + u[2] * ARM.len / 2], 'chrome', { segments: 6, rotate: aim(u) }),
          kit.sphere(0.035, [u[0] * ARM.len, HUB_Y + u[1] * ARM.len, z + u[2] * ARM.len], 'sunYellow', { detail: 0 }),
        );
      }
    }
    // striped roof: stripes along z, red and white; a yellow valance board on the front
    const sw = 1.96 / ROOF.stripes;
    for (let i = 0; i < ROOF.stripes; i++) {
      parts.push(kit.box([0.96, ROOF.t, sw], [0, ROOF.y + ROOF.t / 2, -0.98 + sw * (i + 0.5)], i % 2 === 0 ? 'red' : 'white'));
    }
    parts.push(kit.box([0.04, 0.12, 1.96], [0.45, ROOF.y - 0.04, 0], 'sunYellow'));
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { aim, rod } from '../../../models/parts';

// A lattice comms tower (2×2): four tapering white legs, orange cross-braces, two dishes and a top light that blinks.
const BASE_H = 0.1;
const SPREAD = 0.5; // leg half-spacing at the bottom
const TOP_SPREAD = 0.14;
const TOP_Y = 1.85;

const legPoint = (sx: number, sz: number, t: number): Vec3 => {
  const sp = SPREAD + (TOP_SPREAD - SPREAD) * t;
  return [sx * sp, BASE_H + (TOP_Y - BASE_H) * t, sz * sp];
};

/** เสาสื่อสาร: a lattice tower with dishes and a blinking top light. */
export const item: ItemModel = {
  id: 'comms-tower',
  name: 'เสาสื่อสาร',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.7, BASE_H, 1.7], [0, BASE_H / 2, 0], 'stone'),
      // equipment hut at the foot, facing +x
      kit.box([0.5, 0.34, 0.6], [0.6, BASE_H + 0.17, 0.5], 'white'),
      kit.box([0.52, 0.05, 0.62], [0.6, BASE_H + 0.36, 0.5], 'teal'),
      kit.box([0.02, 0.16, 0.3], [0.86, BASE_H + 0.2, 0.5], 'skyBlue', { glow: 'windowWarm', light: 'window' }),
    ];
    const corners: Array<[number, number]> = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
    for (const [sx, sz] of corners) {
      parts.push(rod(kit, legPoint(sx, sz, 0), legPoint(sx, sz, 1), 0.04, 'white', { segments: 6 }));
    }
    // three bands of braces
    const ts = [0, 0.33, 0.66, 1];
    for (let k = 0; k < 3; k++) {
      for (let c = 0; c < 4; c++) {
        const [ax, az] = corners[c];
        const [bx, bz] = corners[(c + 1) % 4];
        parts.push(rod(kit, legPoint(ax, az, ts[k]), legPoint(bx, bz, ts[k + 1]), 0.022, 'orange', { segments: 4 }));
        parts.push(rod(kit, legPoint(ax, az, ts[k + 1]), legPoint(bx, bz, ts[k + 1]), 0.025, 'orange', { segments: 4 }));
      }
    }
    // top platform and dishes
    parts.push(kit.box([0.44, 0.05, 0.44], [0, TOP_Y + 0.025, 0], 'red'));
    // dish 1: big, facing +x and up a little; dish 2: smaller, facing +z
    const d1 = aim([1, 0.6, 0]);
    parts.push(kit.cylinder(0.3, 0.05, 0.14, [0.26, TOP_Y + 0.16, 0], 'white', { segments: 12, rotate: d1 }));
    parts.push(kit.sphere(0.04, [0.34, TOP_Y + 0.22, 0], 'sunYellow', { detail: 0 }));
    const d2 = aim([0, 0.4, 1]);
    parts.push(rod(kit, [0, TOP_Y + 0.05, 0.1], [0, TOP_Y + 0.28, 0.1], 0.03, 'stoneDark', { segments: 4 }));
    parts.push(kit.cylinder(0.2, 0.04, 0.1, [0, TOP_Y + 0.3, 0.3], 'orange', { segments: 10, rotate: d2 }));
    // mast and blinking light
    parts.push(rod(kit, [-0.1, TOP_Y + 0.05, -0.1], [-0.1, TOP_Y + 0.4, -0.1], 0.025, 'stoneDark', { segments: 4 }));
    parts.push(kit.sphere(0.08, [-0.1, TOP_Y + 0.45, -0.1], 'orange', { detail: 0, glow: 'red', light: 'blink' }));
    return kit.finish(parts);
  },
};

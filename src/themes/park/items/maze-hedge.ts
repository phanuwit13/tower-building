import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// 2x2. A square hedge maze on a sand path, with a little red flag on a pole in the middle.
const H = 0.34; // hedge height
const T = 0.1; // hedge thickness
const BASE_TOP = 0.04;
/** Hedge walls: [centre x, centre z, length x, length z]. Outer ring (gap on the +x side) and an inner twisty ring. */
const WALLS: Array<[number, number, number, number]> = [
  [0, -0.9, 1.9, T], [0, 0.9, 1.9, T], [-0.9, 0, T, 1.9],
  [0.9, -0.56, T, 0.78], [0.9, 0.56, T, 0.78],
  // second ring: open on the -z side
  [0, 0.55, 1.1, T], [-0.5, 0.05, T, 1.0], [0.5, 0.2, T, 0.8],
  [0.25, -0.55, 0.6, T], [-0.25, -0.2, 0.5, T],
  // dead ends
  [0.7, 0.55, T, 0.4], [-0.7, -0.55, T, 0.5],
];

/** เขาวงกตพุ่มไม้: a low hedge maze with a little flag in the middle. */
export const item: ItemModel = {
  id: 'maze-hedge',
  name: 'เขาวงกตพุ่มไม้',
  category: 'nature',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.96, BASE_TOP, 1.96], [0, BASE_TOP / 2, 0], 'sand')];
    for (const [x, z, sx, sz] of WALLS) {
      parts.push(
        kit.box([sx, H, sz], [x, BASE_TOP + H / 2, z], 'leafDark'),
        kit.box([sx - 0.02, 0.05, sz - 0.02], [x, BASE_TOP + H + 0.01, z], 'leaf'),
      );
    }
    // the middle: a lime lawn spot, a white pole and a red flag
    parts.push(
      kit.cylinder(0.2, 0.2, 0.03, [0, BASE_TOP + 0.015, 0], 'lime', { segments: 12 }),
      kit.cylinder(0.02, 0.02, 0.8, [0, BASE_TOP + 0.4, 0], 'white', { segments: 6 }),
      kit.box([0.22, 0.13, 0.025], [0.12, BASE_TOP + 0.72, 0], 'red'),
      kit.sphere(0.035, [0, BASE_TOP + 0.81, 0], 'sunYellow', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};

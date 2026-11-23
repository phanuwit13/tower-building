import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Soft mat floor (2×3, long side along z) with parallel bars, big bright exercise balls, stacked mats and a little set of steps.
const MAT = { w: 1.9, d: 2.9, h: 0.03 };
const BAR_Y = 0.5; // top of the rails
const BAR_X = [-0.75, -0.45] as const;
const BAR_Z = { a: -1.3, b: -0.2 };

/** ห้องกายภาพบำบัด: parallel bars, big exercise balls, mats and a small set of steps. */
export const item: ItemModel = {
  id: 'physio-room',
  name: 'ห้องกายภาพบำบัด',
  category: 'play',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [kit.box([MAT.w, MAT.h, MAT.d], [0, MAT.h / 2, 0], 'mint')];
    parts.push(kit.box([MAT.w, 0.01, 0.1], [0, MAT.h + 0.005, MAT.d / 2 - 0.05], 'sunYellow'));
    parts.push(kit.box([MAT.w, 0.01, 0.1], [0, MAT.h + 0.005, -MAT.d / 2 + 0.05], 'pink'));
    // parallel bars: a base board, four posts, two wooden rails
    const zMid = (BAR_Z.a + BAR_Z.b) / 2;
    const len = BAR_Z.b - BAR_Z.a;
    parts.push(kit.box([0.6, 0.04, len + 0.2], [-0.6, MAT.h + 0.02, zMid], 'teal'));
    for (const x of BAR_X) {
      for (const z of [BAR_Z.a, BAR_Z.b]) parts.push(kit.cylinder(0.03, 0.03, BAR_Y - MAT.h, [x, (BAR_Y + MAT.h) / 2, z], 'chrome', { segments: 8 }));
      parts.push(kit.cylinder(0.035, 0.035, len + 0.06, [x, BAR_Y, zMid], 'wood', { segments: 8, rotate: [Math.PI / 2, 0, 0] }));
    }
    // big exercise balls
    const ball = (r: number, x: number, z: number, c: 'red' | 'sunYellow' | 'blue' | 'pink'): void => {
      parts.push(kit.sphere(r, [x, MAT.h + r * 0.92, z], c, { detail: 1 }));
    };
    ball(0.3, 0.55, 0.1, 'red');
    ball(0.25, 0.25, 0.85, 'sunYellow');
    ball(0.22, 0.65, 1.05, 'blue');
    ball(0.18, -0.1, 0.2, 'pink');
    // stacked mats
    parts.push(
      kit.box([0.7, 0.06, 0.4], [-0.55, MAT.h + 0.03, 1.15], 'blue'),
      kit.box([0.66, 0.06, 0.38], [-0.55, MAT.h + 0.09, 1.15], 'pink', { rotate: [0, 0.12, 0] }),
      kit.box([0.62, 0.06, 0.36], [-0.55, MAT.h + 0.15, 1.15], 'lime', { rotate: [0, -0.08, 0] }),
    );
    // little steps, rising towards +z
    for (let i = 0; i < 3; i++) {
      const h = 0.1 * (i + 1);
      parts.push(kit.box([0.55, h, 0.24], [0.55, MAT.h + h / 2, -1.2 + i * 0.24], (['sunYellow', 'orange', 'red'] as const)[i]));
    }
    return kit.finish(parts);
  },
};

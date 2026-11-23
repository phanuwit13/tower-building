import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Soft play mat (2×3, long side along z) with a small slide, a ball pit and soft blocks.
const MAT = { w: 1.9, d: 2.9, h: 0.03 };
const BALLS = ['red', 'sunYellow', 'blue', 'pink', 'lime', 'orange', 'purple', 'mint'] as const;

/** มุมเด็กเล่น: a soft play mat with a small slide, a ball pit and soft blocks. */
export const item: ItemModel = {
  id: 'kids-corner',
  name: 'มุมเด็กเล่น',
  category: 'play',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [kit.box([MAT.w, MAT.h, MAT.d], [0, MAT.h / 2, 0], 'mint')];
    // a darker mat border strip on two edges (pure colour blocking, no pattern text)
    parts.push(kit.box([MAT.w, 0.01, 0.12], [0, MAT.h + 0.005, MAT.d / 2 - 0.06], 'sunYellow'));
    parts.push(kit.box([MAT.w, 0.01, 0.12], [0, MAT.h + 0.005, -MAT.d / 2 + 0.06], 'pink'));
    // slide at the -z end: platform, steps, and a ramp running towards +x
    const SZ = -0.95;
    parts.push(
      kit.box([0.5, 0.36, 0.5], [-0.5, MAT.h + 0.18, SZ], 'orange'),
      kit.box([0.5, 0.04, 0.5], [-0.5, MAT.h + 0.38, SZ], 'sunYellow'),
      kit.box([0.14, 0.12, 0.4], [-0.82, MAT.h + 0.06, SZ], 'red'),
      kit.box([0.14, 0.24, 0.4], [-0.72, MAT.h + 0.12, SZ], 'red'),
      kit.box([0.84, 0.03, 0.34], [0.05, 0.245, SZ], 'blue', { rotate: [0, 0, -0.5] }),
      kit.box([0.84, 0.07, 0.03], [0.05, 0.275, SZ - 0.185], 'skyBlue', { rotate: [0, 0, -0.5] }),
      kit.box([0.84, 0.07, 0.03], [0.05, 0.275, SZ + 0.185], 'skyBlue', { rotate: [0, 0, -0.5] }),
    );
    // ball pit at the +z end: a soft pink wall around a heap of coloured balls
    const PZ = 0.85;
    const P = 0.52;
    parts.push(
      kit.box([2 * P, 0.16, 0.1], [0, 0.11, PZ - P], 'pink'),
      kit.box([2 * P, 0.16, 0.1], [0, 0.11, PZ + P], 'pink'),
      kit.box([0.1, 0.16, 2 * P], [-P, 0.11, PZ], 'pink'),
      kit.box([0.1, 0.16, 2 * P], [P, 0.11, PZ], 'pink'),
      kit.box([2 * P - 0.1, 0.04, 2 * P - 0.1], [0, 0.05, PZ], 'skyBlue'),
    );
    let n = 0;
    for (let ix = -2; ix <= 2; ix++) {
      for (let iz = -2; iz <= 2; iz++) {
        const edge = Math.max(Math.abs(ix), Math.abs(iz));
        parts.push(kit.sphere(0.075, [ix * 0.16, 0.19 + (edge === 2 ? 0 : 0.05), PZ + iz * 0.16], BALLS[n++ % BALLS.length], { detail: 0 }));
      }
    }
    // soft blocks near the middle
    parts.push(
      kit.box([0.26, 0.26, 0.26], [0.45, MAT.h + 0.13, -0.15], 'red'),
      kit.box([0.26, 0.26, 0.26], [0.45, MAT.h + 0.13, 0.15], 'sunYellow'),
      kit.box([0.26, 0.26, 0.26], [0.45, MAT.h + 0.39, 0], 'blue', { rotate: [0, 0.3, 0] }),
      kit.box([0.22, 0.22, 0.22], [-0.45, MAT.h + 0.11, 0.05], 'lime', { rotate: [0, 0.5, 0] }),
      kit.sphere(0.13, [-0.45, MAT.h + 0.13, -0.3], 'purple', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};

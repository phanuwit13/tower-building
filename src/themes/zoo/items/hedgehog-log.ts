import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';

// A hollow log lying across the back with a little hedgehog beside it, and mushrooms.
const G = 0.03;
const LOG = { r: 0.2, len: 0.55, x: -0.1, z: -0.25 };
const HOG = { x: 0.15, z: 0.22 };
const MUSH: Array<[number, number, number]> = [[0.3, -0.2, 1], [0.38, -0.05, 0.7], [-0.3, 0.3, 0.85]];

/** เม่นแคระข้างขอนไม้: a hollow log, a hedgehog and mushrooms. */
export const item: ItemModel = {
  id: 'hedgehog-log',
  name: 'เม่นแคระข้างขอนไม้',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const hy = G + 0.09;
    const parts: Part[] = [
      kit.box([0.96, G, 0.96], [0, G / 2, 0], 'lime'),
      // the log, axis along x so the hollow opens to +x
      kit.cylinder(LOG.r, LOG.r, LOG.len, [LOG.x, G + LOG.r, LOG.z], 'wood', { segments: 10, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(LOG.r - 0.045, LOG.r - 0.045, 0.02, [LOG.x + LOG.len / 2 + 0.005, G + LOG.r, LOG.z], 'bark', { segments: 10, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(LOG.r + 0.003, LOG.r + 0.003, 0.012, [LOG.x + LOG.len / 2 - 0.005, G + LOG.r, LOG.z], 'sand', { segments: 10, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(LOG.r - 0.05, LOG.r - 0.05, 0.02, [LOG.x + LOG.len / 2 + 0.012, G + LOG.r, LOG.z], 'bark', { segments: 10, rotate: [0, 0, Math.PI / 2] }),
      kit.sphere(0.04, [LOG.x - 0.1, G + 2 * LOG.r + 0.0, LOG.z], 'leaf', { detail: 0, scale: [1.5, 0.5, 1.5] }), // moss on top
      // hedgehog: brown body with spines, cream face, big eyes
      kit.sphere(0.14, [HOG.x, hy, HOG.z], 'woodDark', { scale: [1.15, 0.85, 1] }),
      kit.sphere(0.085, [HOG.x + 0.12, hy - 0.03, HOG.z], 'cream', { scale: [1.2, 0.9, 0.9] }),
      kit.sphere(0.028, [HOG.x + 0.2, hy - 0.03, HOG.z], 'charcoal', { detail: 0 }),
    ];
    for (const s of [-1, 1]) {
      parts.push(
        kit.sphere(0.03, [HOG.x + 0.15, hy + 0.02, HOG.z + s * 0.05], 'white', { detail: 0 }),
        kit.sphere(0.016, [HOG.x + 0.175, hy + 0.02, HOG.z + s * 0.055], 'charcoal', { detail: 0 }),
        kit.sphere(0.03, [HOG.x + 0.08, hy + 0.08, HOG.z + s * 0.07], 'cream', { detail: 0 }), // ears
        kit.sphere(0.035, [HOG.x + 0.1, G + 0.02, HOG.z + s * 0.07], 'cream', { detail: 0, scale: [1.4, 0.6, 1] }), // feet
      );
    }
    // spines: little cones fanning over the back
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const r = 0.07 + (i % 3) * 0.025;
      const p: Vec3 = [HOG.x - 0.03 + r * Math.cos(a) * 1.1, hy + 0.1 + (0.1 - r) * 0.5, HOG.z + r * Math.sin(a)];
      parts.push(kit.cone(0.035, 0.09, p, i % 2 ? 'bark' : 'wood', { segments: 4, rotate: [Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9 - 0.3] }));
    }
    for (const [x, z, s] of MUSH) {
      parts.push(
        kit.cylinder(0.025 * s, 0.03 * s, 0.1 * s, [x, G + 0.05 * s, z], 'cream', { segments: 6 }),
        kit.dome(0.075 * s, [x, G + 0.09 * s, z], 'red', { segments: 8 }),
        kit.sphere(0.015 * s, [x + 0.03 * s, G + 0.14 * s, z], 'white', { detail: 0 }),
        kit.sphere(0.012 * s, [x - 0.025 * s, G + 0.13 * s, z + 0.03 * s], 'white', { detail: 0 }),
      );
    }
    parts.push(kit.sphere(0.07, [-0.35, 0.09, -0.4], 'leaf', { detail: 0, scale: [1.2, 0.8, 1.2] }), kit.sphere(0.06, [0.35, 0.08, 0.38], 'leafDark', { detail: 0, scale: [1.2, 0.8, 1.2] }));
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A wicker basket of mixed fruit on a wooden stand (1×1), with a woven band, a handle and a bunch of grapes.
const STAND = { h: 0.36, top: 0.03 };
const BASKET = { rTop: 0.34, rBottom: 0.24, h: 0.3 };
const RIM = STAND.h + BASKET.h;

/** ตะกร้าผลไม้: a wicker basket of mixed fruit on a stand. */
export const item: ItemModel = {
  id: 'fruit-basket',
  name: 'ตะกร้าผลไม้',
  category: 'food',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.7, 0.03, 0.7], [0, 0.015, 0], 'stone'),
      // stand: four legs and a top ring
      kit.box([0.62, 0.04, 0.62], [0, STAND.h - 0.02, 0], 'woodDark'),
      kit.cylinder(BASKET.rBottom, BASKET.rBottom + 0.02, BASKET.h, [0, STAND.h + BASKET.h / 2, 0], 'sand', { segments: 12 }),
      kit.cylinder(BASKET.rTop, BASKET.rBottom, BASKET.h * 0.5, [0, STAND.h + BASKET.h * 0.75, 0], 'sand', { segments: 12 }),
      kit.torus(BASKET.rTop, 0.025, [0, RIM, 0], 'wood', { rotate: [Math.PI / 2, 0, 0], radialSegments: 4, tubularSegments: 12 }),
      kit.torus(0.3, 0.018, [0, STAND.h + 0.11, 0], 'woodDark', { rotate: [Math.PI / 2, 0, 0], radialSegments: 4, tubularSegments: 12 }),
      // handle arch across the basket (open ends sit on the rim)
      kit.torus(0.3, 0.025, [0, RIM, 0], 'wood', { arc: Math.PI, radialSegments: 4, tubularSegments: 8, rotate: [0, Math.PI / 2, 0] }),
    ];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) parts.push(kit.box([0.05, STAND.h - 0.04, 0.05], [sx * 0.27, (STAND.h - 0.04) / 2 + 0.03, sz * 0.27], 'wood'));
    // fruit heaped just above the rim
    const y = RIM + 0.02;
    parts.push(
      kit.sphere(0.12, [0.12, y + 0.04, 0.1], 'red', { detail: 1 }),
      kit.sphere(0.12, [-0.14, y + 0.03, 0.08], 'orange', { detail: 1 }),
      kit.sphere(0.11, [0.02, y + 0.03, -0.15], 'lime', { detail: 0 }),
      kit.sphere(0.1, [-0.13, y + 0.04, -0.14], 'sunYellow', { detail: 0, scale: [1.3, 0.8, 0.9] }),
      kit.sphere(0.1, [0.17, y + 0.03, -0.12], 'redDark', { detail: 0 }),
      kit.sphere(0.1, [0.0, y + 0.13, 0.0], 'orange', { detail: 0 }),
      kit.sphere(0.06, [-0.02, y + 0.23, 0.02], 'leaf', { detail: 0 }),
    );
    // a bunch of grapes heaped on the +x side, big enough to read, and a ring of little warm lights round the rim
    const GRAPES: Array<[number, number, number]> = [[0.2, 0.0, 0.14], [0.26, 0.07, 0.12], [0.26, -0.07, 0.12], [0.3, 0.0, 0.1], [0.23, 0.0, 0.2]];
    for (const [x, z, h] of GRAPES) parts.push(kit.sphere(0.06, [x, y + h - 0.04, z], 'purple', { detail: 0 }));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      parts.push(kit.sphere(0.03, [(BASKET.rTop + 0.02) * Math.cos(a), RIM, (BASKET.rTop + 0.02) * Math.sin(a)], i % 2 ? 'sunYellow' : 'pink', { detail: 0, glow: true, light: 'breathe' }));
    }
    return kit.finish(parts);
  },
};

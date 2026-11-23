import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// 1x1. A round, trimmed shrub in a ring of stone.
/** พุ่มไม้ทรงกลม: a round trimmed shrub in a stone ring. */
export const item: ItemModel = {
  id: 'round-shrub',
  name: 'พุ่มไม้ทรงกลม',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.98, 0.03, 0.98], [0, 0.015, 0], 'lime'),
      kit.cylinder(0.38, 0.38, 0.06, [0, 0.06, 0], 'bark', { segments: 16 }),
      kit.torus(0.4, 0.07, [0, 0.1, 0], 'stone', { rotate: [Math.PI / 2, 0, 0], radialSegments: 6, tubularSegments: 16 }),
      kit.sphere(0.34, [0, 0.43, 0], 'leaf', { detail: 2 }),
      kit.sphere(0.22, [0.2, 0.34, 0.2], 'leafDark', { detail: 1, scale: [1, 0.8, 1] }),
      kit.sphere(0.2, [-0.2, 0.36, -0.2], 'leafDark', { detail: 1, scale: [1, 0.8, 1] }),
      kit.sphere(0.17, [-0.08, 0.66, 0.06], 'lime', { detail: 1, scale: [1, 0.6, 1] }),
    ];
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// 1x1. Mossy rocks on raked gravel.
/** Raked gravel lines along z: x positions. */
const RAKE = [-0.4, -0.3, 0.3, 0.4];

/** หินกับมอส: mossy rocks on raked gravel. */
export const item: ItemModel = {
  id: 'rock-and-moss',
  name: 'หินกับมอส',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.98, 0.03, 0.98], [0, 0.015, 0], 'sand')];
    for (const x of RAKE) parts.push(kit.box([0.03, 0.012, 0.9], [x, 0.036, 0], 'cream'));
    parts.push(
      kit.sphere(0.27, [-0.05, 0.24, 0.0], 'stoneDark', { detail: 1, scale: [1.15, 0.85, 1] }),
      kit.sphere(0.17, [0.22, 0.14, 0.2], 'stone', { detail: 1, scale: [1.1, 0.75, 1] }),
      kit.sphere(0.13, [-0.2, 0.1, -0.26], 'stone', { detail: 0, scale: [1.2, 0.7, 1] }),
      // moss caps and patches
      kit.sphere(0.2, [-0.07, 0.36, 0.0], 'leaf', { detail: 1, scale: [1, 0.4, 0.9] }),
      kit.sphere(0.1, [0.2, 0.23, 0.18], 'lime', { detail: 0, scale: [1, 0.4, 1] }),
      kit.sphere(0.09, [0.12, 0.07, -0.2], 'leafDark', { detail: 0, scale: [1.5, 0.6, 1.2] }),
      kit.sphere(0.07, [-0.36, 0.05, 0.3], 'leaf', { detail: 0, scale: [1.5, 0.6, 1.2] }),
      kit.sphere(0.06, [0.0, 0.06, 0.36], 'lime', { detail: 0, scale: [1.3, 0.6, 1.1] }),
    );
    for (const [x, z] of [[0.35, -0.3], [-0.3, 0.15], [0.3, 0.38]] as Array<[number, number]>) parts.push(kit.sphere(0.04, [x, 0.05, z], 'stoneDark', { detail: 0, scale: [1.2, 0.7, 1] }));
    return kit.finish(parts);
  },
};

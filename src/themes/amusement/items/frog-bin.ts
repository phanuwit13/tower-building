import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A green frog-shaped bin facing +x: a round body with a squashed dome head, bulging eyes on top and
// a wide open mouth (a dark slot with lips and a pink tongue).
const BODY = { r: 0.36, h: 0.46 };
const HEAD_TOP = BODY.h + 0.36 * 0.7;

/** ถังขยะปากกบ: a frog-shaped bin with a wide open mouth. */
export const item: ItemModel = {
  id: 'frog-bin',
  name: 'ถังขยะปากกบ',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(BODY.r, BODY.r, BODY.h, [0, BODY.h / 2, 0], 'leaf', { segments: 12 }),
      kit.dome(BODY.r, [0, BODY.h, 0], 'leaf', { segments: 12, scale: [1, 0.7, 1] }),
      // mouth
      kit.box([0.08, 0.2, 0.5], [BODY.r - 0.02, 0.3, 0], 'charcoal'),
      kit.box([0.1, 0.05, 0.58], [BODY.r - 0.01, 0.43, 0], 'leafDark'),
      kit.box([0.1, 0.05, 0.58], [BODY.r - 0.01, 0.17, 0], 'leafDark'),
      kit.box([0.06, 0.03, 0.26], [BODY.r + 0.04, 0.2, 0], 'pink'),
      // eyes
      kit.sphere(0.1, [0.1, HEAD_TOP - 0.02, 0.2], 'white', { detail: 1 }),
      kit.sphere(0.1, [0.1, HEAD_TOP - 0.02, -0.2], 'white', { detail: 1 }),
      kit.sphere(0.05, [0.17, HEAD_TOP - 0.01, 0.2], 'charcoal', { detail: 0 }),
      kit.sphere(0.05, [0.17, HEAD_TOP - 0.01, -0.2], 'charcoal', { detail: 0 }),
      // spots and feet
      kit.sphere(0.06, [-0.2, 0.62, 0.15], 'leafDark', { detail: 0, scale: [1, 0.5, 1] }),
      kit.sphere(0.05, [-0.12, 0.66, -0.2], 'leafDark', { detail: 0, scale: [1, 0.5, 1] }),
      kit.sphere(0.12, [0.28, 0.12 * 0.4 * 0.851, 0.3], 'leafDark', { detail: 0, scale: [1.4, 0.4, 0.9] }),
      kit.sphere(0.12, [0.28, 0.12 * 0.4 * 0.851, -0.3], 'leafDark', { detail: 0, scale: [1.4, 0.4, 0.9] }),
    ];
    return kit.finish(parts);
  },
};

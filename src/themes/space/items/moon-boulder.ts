import type { ItemModel } from '../../../models/contract';
import { ICO_LOW } from '../../../models/parts';
import type { Part } from '../../../models/kit';

// One big round boulder with a lilac streak and two small stones at its foot.
const R = 0.4;
const SY = 0.95;

/** ก้อนหินยักษ์: one big round boulder. */
export const item: ItemModel = {
  id: 'moon-boulder',
  name: 'ก้อนหินยักษ์',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.sphere(R, [0, R * SY * ICO_LOW, 0], 'stoneDark', { detail: 0, scale: [1, SY, 1], rotate: [0, 0.4, 0] }),
      // a lilac cap on top, squashed
      kit.sphere(0.24, [0.05, R * SY * ICO_LOW + 0.26, 0.03], 'purple', { detail: 0, scale: [1, 0.5, 1], rotate: [0, 1, 0] }),
      kit.sphere(0.12, [0.3, 0.12 * 0.8 * ICO_LOW, 0.34], 'stone', { detail: 0, scale: [1, 0.8, 1] }),
      kit.sphere(0.09, [-0.34, 0.09 * 0.8 * ICO_LOW, 0.28], 'charcoal', { detail: 0, scale: [1, 0.8, 1] }),
    ];
    return kit.finish(parts);
  },
};

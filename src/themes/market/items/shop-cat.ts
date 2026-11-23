import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A ginger cat asleep on a doormat (1×1): curled body, head resting on its paws facing +x, tail wrapped round the front. An ordinary cat, nothing else.
const MAT = { w: 0.86, d: 0.64, h: 0.03 };
const Y = MAT.h;

/** แมวนอนหน้าร้าน: a ginger cat asleep on a doormat. */
export const item: ItemModel = {
  id: 'shop-cat',
  name: 'แมวนอนหน้าร้าน',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([MAT.w, MAT.h, MAT.d], [0, MAT.h / 2, 0], 'terracotta'),
      kit.box([MAT.w - 0.12, MAT.h + 0.01, MAT.d - 0.12], [0, (MAT.h + 0.01) / 2, 0], 'sand'),
      // body, paws and head
      kit.sphere(0.2, [-0.08, Y + 0.14, -0.02], 'orange', { scale: [1.3, 0.8, 1] }),
      kit.sphere(0.15, [-0.1, Y + 0.17, -0.02], 'sunYellow', { detail: 0, scale: [1.1, 0.7, 0.9] }),
      kit.sphere(0.13, [0.2, Y + 0.12, 0.03], 'orange', { scale: [1, 0.9, 1] }),
      kit.sphere(0.045, [0.3, Y + 0.045, 0.1], 'sunYellow', { detail: 0, scale: [1.3, 0.8, 1] }),
      kit.sphere(0.045, [0.3, Y + 0.045, -0.04], 'sunYellow', { detail: 0, scale: [1.3, 0.8, 1] }),
      // ears, a pink nose, closed eyes (thin dark lines) and stripes
      kit.cone(0.045, 0.09, [0.17, Y + 0.25, 0.1], 'orange', { segments: 4 }),
      kit.cone(0.045, 0.09, [0.17, Y + 0.25, -0.04], 'orange', { segments: 4 }),
      kit.box([0.025, 0.025, 0.03], [0.325, Y + 0.115, 0.03], 'pink'),
      kit.box([0.02, 0.02, 0.05], [0.31, Y + 0.17, 0.09], 'charcoal'),
      kit.box([0.02, 0.02, 0.05], [0.31, Y + 0.17, -0.03], 'charcoal'),
      kit.box([0.05, 0.02, 0.1], [-0.04, Y + 0.3, -0.02], 'terracotta'),
      kit.box([0.05, 0.02, 0.1], [-0.15, Y + 0.27, -0.02], 'terracotta'),
    ];
    // the tail curls round the front-left side
    const tail: [number, number, number][] = [[-0.3, 0.07, 0.1], [-0.25, 0.06, 0.22], [-0.12, 0.055, 0.27], [0.03, 0.055, 0.26], [0.14, 0.055, 0.2]];
    tail.forEach((p, i) => parts.push(kit.sphere(0.055 - (i === 4 ? 0.01 : 0), [p[0], Y + p[1], p[2]], i === 4 ? 'terracotta' : 'orange', { detail: 0 })));
    return kit.finish(parts);
  },
};

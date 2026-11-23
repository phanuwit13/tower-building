import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const SEAT_Y = 0.31;
const BODY = 'blue';

/** โซฟาสองที่นั่ง: a small two-seat sofa facing +x with two seat cushions and two pillows. */
export const item: ItemModel = {
  id: 'loveseat',
  name: 'โซฟาสองที่นั่ง',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.7, 0.2, 1.7], [0, 0.15, 0], BODY), // base
      kit.box([0.18, 0.4, 1.7], [-0.26, 0.42, 0], BODY), // backrest
      kit.box([0.7, 0.2, 0.15], [0, 0.35, -0.775], BODY), // arms
      kit.box([0.7, 0.2, 0.15], [0, 0.35, 0.775], BODY),
    ];
    for (const z of [-0.37, 0.37]) parts.push(kit.box([0.5, 0.06, 0.72], [0.1, SEAT_Y - 0.03, z], 'mint'));
    parts.push(
      kit.box([0.14, 0.22, 0.22], [-0.12, 0.42, -0.5], 'sunYellow', { rotate: [0, 0.1, 0.25] }),
      kit.box([0.14, 0.22, 0.22], [-0.12, 0.42, 0.5], 'pink', { rotate: [0, -0.1, 0.25] }),
      ...[-0.65, 0.65].flatMap((z) => [kit.cylinder(0.03, 0.03, 0.05, [0.28, 0.025, z], 'woodDark', { segments: 6 }), kit.cylinder(0.03, 0.03, 0.05, [-0.28, 0.025, z], 'woodDark', { segments: 6 })]),
    );
    return kit.finish(parts);
  },
};

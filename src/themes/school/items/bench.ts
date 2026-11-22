import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const LENGTH = 1.62; // along z
const SEAT_Y = 0.31;

/** ม้านั่ง: a long park bench, wooden slats on a dark iron frame, facing +x. */
export const item: ItemModel = {
  id: 'bench',
  name: 'ม้านั่ง',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const x of [-0.1, 0.04, 0.18]) parts.push(kit.box([0.12, 0.06, LENGTH], [x, SEAT_Y, 0], 'wood'));
    // backrest slats lean back a little
    for (const [x, y] of [[-0.2, 0.48], [-0.225, 0.62]]) {
      parts.push(kit.box([0.05, 0.11, LENGTH], [x, y, 0], 'wood', { rotate: [0, 0, 0.18] }));
    }
    for (const z of [-0.66, 0.66]) {
      parts.push(
        kit.box([0.06, 0.29, 0.07], [0.2, 0.145, z], 'charcoal'), // front leg
        kit.box([0.06, 0.7, 0.07], [-0.2, 0.35, z], 'charcoal'), // back leg + backrest post
        kit.box([0.44, 0.05, 0.07], [0, 0.255, z], 'charcoal'), // seat rail
        kit.box([0.05, 0.17, 0.06], [0.22, 0.42, z], 'charcoal'), // armrest post
        kit.box([0.44, 0.05, 0.09], [0.02, 0.52, z], 'charcoal'), // armrest
      );
    }
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A pale-blue ice block sitting in the little pit it was dug from: two turned boxes make a faceted
// look (pale blue over sky blue), white glints on top, shards at the foot, a ring of rocks round the pit.
const PIT = 0.03;
const ICO = 0.851;

/** ก้อนน้ำแข็งดวงจันทร์: a blue ice block dug out of the ground. */
export const item: ItemModel = {
  id: 'ice-block',
  name: 'ก้อนน้ำแข็งดวงจันทร์',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.46, 0.46, PIT, [0, PIT / 2, 0], 'navy', { segments: 12 }),
      kit.box([0.5, 0.44, 0.5], [0, PIT + 0.22, 0], 'skyBlue', { rotate: [0, 0.2, 0] }),
      kit.box([0.5, 0.34, 0.5], [0, PIT + 0.17, 0], 'blue', { rotate: [0, 0.2 + Math.PI / 4, 0] }),
      kit.box([0.3, 0.03, 0.3], [0, PIT + 0.455, 0], 'white', { rotate: [0, 0.2, 0] }),
      kit.box([0.06, 0.2, 0.06], [0.14, PIT + 0.3, 0.255], 'white', { rotate: [0, 0.2, 0] }),
      kit.cone(0.07, 0.2, [0.3, PIT + 0.1, 0.1], 'skyBlue', { segments: 6 }),
      kit.cone(0.06, 0.16, [-0.32, PIT + 0.08, -0.12], 'blue', { segments: 6 }),
    ];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      parts.push(kit.sphere(0.07, [0.4 * Math.cos(a), 0.075 * ICO * 0.8, 0.4 * Math.sin(a)], i % 2 ? 'stone' : 'stoneDark', { detail: 0, scale: [1, 0.8, 1] }));
    }
    return kit.finish(parts);
  },
};

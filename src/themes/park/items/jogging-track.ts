import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const BASE = 0.04; // top of the track surface
const W = 0.96;
const L = 1.96;

/** ลู่วิ่ง: a strip of red running track with white lane lines (no numbers), green kerbs. */
export const item: ItemModel = {
  id: 'jogging-track',
  name: 'ลู่วิ่ง',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([W, BASE, L], [0, BASE / 2, 0], 'red'),
      // green kerbs along both long edges
      kit.box([0.06, 0.07, L], [-(W / 2 - 0.03), 0.035, 0], 'lime'),
      kit.box([0.06, 0.07, L], [W / 2 - 0.03, 0.035, 0], 'lime'),
    ];
    // white lane lines: two inside the lanes, two near the kerbs
    for (const x of [-0.3, -0.1, 0.1, 0.3]) {
      parts.push(kit.box([0.035, 0.02, L - 0.1], [x, BASE + 0.005, 0], 'white'));
    }
    // start line across the track near the +z end
    parts.push(kit.box([W - 0.18, 0.02, 0.06], [0, BASE + 0.005, 0.8], 'white'));
    // two small cones at the far end
    for (const x of [-0.2, 0.2]) {
      parts.push(kit.cone(0.05, 0.12, [x, BASE + 0.06, -0.85], 'orange', { segments: 8 }));
      parts.push(kit.box([0.1, 0.02, 0.1], [x, BASE + 0.01, -0.85], 'orange'));
    }
    return kit.finish(parts);
  },
};

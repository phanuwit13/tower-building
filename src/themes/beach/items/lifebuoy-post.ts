import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A wooden post on a sand mound with a red-and-white life ring hanging on a peg in front (+x), and a red cap.
const POST = { x: -0.1, w: 0.1, h: 1.15 };
const MOUND = { r: 0.44, h: 0.04 };
const RING = { x: POST.x + POST.w / 2 + 0.04, y: 0.7, r: 0.2, tube: 0.06 };

/** เสาห่วงชูชีพ: a wooden post holding a red-and-white life ring. */
export const item: ItemModel = {
  id: 'lifebuoy-post',
  name: 'เสาห่วงชูชีพ',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(MOUND.r, MOUND.r, MOUND.h, [0, MOUND.h / 2, 0], 'sand', { segments: 16 }),
      kit.box([0.3, 0.1, 0.3], [POST.x, MOUND.h + 0.05, 0], 'stone'), // footing
      kit.box([POST.w, POST.h, POST.w], [POST.x, MOUND.h + POST.h / 2, 0], 'wood'),
      kit.box([POST.w + 0.04, 0.05, POST.w + 0.04], [POST.x, MOUND.h + POST.h + 0.025, 0], 'redDark'), // cap
      kit.box([0.1, 0.05, 0.05], [POST.x + POST.w / 2 + 0.03, RING.y + RING.r - 0.02, 0], 'woodDark'), // the peg the ring hangs on
      kit.box([0.28, 0.07, 0.04], [POST.x, MOUND.h + 0.5, 0], 'woodDark'), // brace across the post
    ];
    // ring: four quarters, red and white, standing in the y-z plane and facing +x
    for (let k = 0; k < 4; k++) {
      parts.push(kit.torus(RING.r, RING.tube, [RING.x, MOUND.h + RING.y, 0], k % 2 === 0 ? 'red' : 'white', { arc: Math.PI / 2, rotate: [0, Math.PI / 2, (k * Math.PI) / 2] }));
    }
    return kit.finish(parts);
  },
};

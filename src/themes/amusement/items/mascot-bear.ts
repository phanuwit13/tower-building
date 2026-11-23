import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A friendly round bear statue (an original character) on a plinth, facing +x, waving with the arm on
// the +z side. Round tummy, party hat and a bow tie.
const PLINTH = { w: 0.86, h: 0.14, band: 0.05 };
const TOP = PLINTH.h;
const BODY = { r: 0.3, y: TOP + 0.3 };
const HEAD = { r: 0.22, y: TOP + 0.84 };

/** รูปปั้นมาสคอตหมี: a friendly waving bear statue on a plinth. */
export const item: ItemModel = {
  id: 'mascot-bear',
  name: 'รูปปั้นมาสคอตหมี',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([PLINTH.w, PLINTH.h, PLINTH.w], [0, PLINTH.h / 2, 0], 'stone'),
      kit.box([PLINTH.w + 0.02, PLINTH.band, PLINTH.w + 0.02], [0, PLINTH.band / 2 + 0.03, 0], 'blue'),
      // body and tummy
      kit.sphere(BODY.r, [0, BODY.y, 0], 'wood', { scale: [1, 1.1, 1] }),
      kit.sphere(0.2, [0.14, BODY.y - 0.02, 0], 'sand', { scale: [0.8, 1.05, 1] }),
      // feet
      kit.sphere(0.1, [0.2, TOP + 0.05, 0.15], 'woodDark', { detail: 0, scale: [1.3, 0.55, 1] }),
      kit.sphere(0.1, [0.2, TOP + 0.05, -0.15], 'woodDark', { detail: 0, scale: [1.3, 0.55, 1] }),
      // head
      kit.sphere(HEAD.r, [0.02, HEAD.y, 0], 'wood'),
      kit.sphere(0.09, [0.2, HEAD.y - 0.05, 0], 'sand', { scale: [0.9, 0.8, 1.1] }),
      kit.sphere(0.04, [0.28, HEAD.y - 0.02, 0], 'charcoal', { detail: 0 }),
      kit.sphere(0.03, [0.2, HEAD.y + 0.06, 0.09], 'charcoal', { detail: 0 }),
      kit.sphere(0.03, [0.2, HEAD.y + 0.06, -0.09], 'charcoal', { detail: 0 }),
      kit.sphere(0.08, [0.0, HEAD.y + 0.16, 0.17], 'wood', { detail: 0 }),
      kit.sphere(0.08, [0.0, HEAD.y + 0.16, -0.17], 'wood', { detail: 0 }),
      kit.sphere(0.04, [0.04, HEAD.y + 0.16, 0.18], 'pink', { detail: 0 }),
      kit.sphere(0.04, [0.04, HEAD.y + 0.16, -0.18], 'pink', { detail: 0 }),
      // party hat and bow tie
      kit.cone(0.1, 0.22, [0.0, HEAD.y + 0.3, 0], 'sunYellow', { segments: 8 }),
      kit.sphere(0.035, [0.0, HEAD.y + 0.42, 0], 'red', { detail: 0 }),
      kit.box([0.05, 0.08, 0.08], [0.2, HEAD.y - 0.24, 0.06], 'red', { rotate: [0.3, 0, 0] }),
      kit.box([0.05, 0.08, 0.08], [0.2, HEAD.y - 0.24, -0.06], 'red', { rotate: [-0.3, 0, 0] }),
      // arms: left (z-) rests at the side, right (z+) waves up
      kit.sphere(0.09, [0.06, BODY.y + 0.0, -0.3], 'wood', { scale: [1, 1.5, 0.9] }),
      rod(kit, [0.04, BODY.y + 0.14, 0.26], [0.08, TOP + 0.98, 0.37], 0.07, 'wood', { segments: 6 }),
      kit.sphere(0.08, [0.09, TOP + 1.03, 0.37], 'wood', { detail: 0 }),
    ];
    return kit.finish(parts);
  },
};

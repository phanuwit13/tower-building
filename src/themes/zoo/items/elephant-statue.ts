import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A cute baby-elephant statue (an original, cheerful character, not a religious figure) on a round plinth,
// trunk raised, facing +x.
const PLINTH = { r: 0.42, h: 0.12, band: 0.05 };
const TOP = PLINTH.h + PLINTH.band;
const BODY = { r: 0.23, y: TOP + 0.3 };
const HEAD = { r: 0.17, x: 0.15, y: TOP + 0.45 };

/** รูปปั้นช้างน้อย: a baby-elephant statue on a round plinth. */
export const item: ItemModel = {
  id: 'elephant-statue',
  name: 'รูปปั้นช้างน้อย',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(PLINTH.r, PLINTH.r + 0.04, PLINTH.h, [0, PLINTH.h / 2, 0], 'stone', { segments: 16 }),
      kit.cylinder(PLINTH.r - 0.04, PLINTH.r - 0.04, PLINTH.band, [0, PLINTH.h + PLINTH.band / 2, 0], 'blue', { segments: 16 }),
      // legs, body
      ...[[0.14, 0.12], [0.14, -0.12], [-0.13, 0.12], [-0.13, -0.12]].map(([x, z]) =>
        kit.cylinder(0.075, 0.085, 0.2, [x, TOP + 0.1, z], 'stone', { segments: 8 })),
      kit.sphere(BODY.r, [-0.02, BODY.y, 0], 'stone', { scale: [1.15, 0.95, 0.9] }),
      kit.sphere(0.04, [-0.27, BODY.y - 0.04, 0], 'stoneDark', { detail: 0 }), // tail
      // head
      kit.sphere(HEAD.r, [HEAD.x, HEAD.y, 0], 'stone'),
      // big ears with pink insides
      kit.sphere(0.15, [HEAD.x - 0.06, HEAD.y + 0.01, 0.17], 'stone', { scale: [0.3, 1, 0.9] }),
      kit.sphere(0.15, [HEAD.x - 0.06, HEAD.y + 0.01, -0.17], 'stone', { scale: [0.3, 1, 0.9] }),
      kit.sphere(0.1, [HEAD.x - 0.03, HEAD.y + 0.01, 0.17], 'pink', { detail: 0, scale: [0.25, 1, 0.9] }),
      kit.sphere(0.1, [HEAD.x - 0.03, HEAD.y + 0.01, -0.17], 'pink', { detail: 0, scale: [0.25, 1, 0.9] }),
      // trunk raised in greeting, ending in a curl
      rod(kit, [HEAD.x + 0.14, HEAD.y - 0.06, 0], [HEAD.x + 0.25, HEAD.y + 0.06, 0], 0.062, 'stone', { segments: 8 }),
      rod(kit, [HEAD.x + 0.25, HEAD.y + 0.06, 0], [HEAD.x + 0.27, HEAD.y + 0.22, 0], 0.052, 'stone', { segments: 8 }),
      kit.sphere(0.052, [HEAD.x + 0.27, HEAD.y + 0.23, 0], 'stone', { detail: 0 }),
      // big friendly eyes, rosy cheeks
      kit.sphere(0.04, [HEAD.x + 0.12, HEAD.y + 0.07, 0.085], 'white', { detail: 0 }),
      kit.sphere(0.04, [HEAD.x + 0.12, HEAD.y + 0.07, -0.085], 'white', { detail: 0 }),
      kit.sphere(0.022, [HEAD.x + 0.15, HEAD.y + 0.07, 0.085], 'charcoal', { detail: 0 }),
      kit.sphere(0.022, [HEAD.x + 0.15, HEAD.y + 0.07, -0.085], 'charcoal', { detail: 0 }),
      kit.sphere(0.035, [HEAD.x + 0.1, HEAD.y - 0.04, 0.13], 'pink', { detail: 0, scale: [0.5, 1, 1] }),
      kit.sphere(0.035, [HEAD.x + 0.1, HEAD.y - 0.04, -0.13], 'pink', { detail: 0, scale: [0.5, 1, 1] }),
    ];
    return kit.finish(parts);
  },
};

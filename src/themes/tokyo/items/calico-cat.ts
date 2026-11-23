import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A friendly calico cat (1×1) sitting upright on a low stone wall, facing +x, paws down (not a beckoning pose):
// white with orange and charcoal patches.
const WALL = { w: 0.55, d: 0.95, h: 0.12, cap: 0.03 };
const TOP = WALL.h + WALL.cap; // top of the wall
const HEAD = { x: 0.07, y: TOP + 0.235, r: 0.09 };

/** แมวสามสี: a calico cat sitting on a low wall. */
export const item: ItemModel = {
  id: 'calico-cat',
  name: 'แมวสามสี',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([WALL.w, WALL.h, WALL.d], [0, WALL.h / 2, 0], 'stone'),
      kit.box([WALL.w + 0.04, WALL.cap, WALL.d + 0.04], [0, WALL.h + WALL.cap / 2, 0], 'stoneDark'),
      // body, patches, front paws
      kit.sphere(0.13, [-0.03, TOP + 0.12, 0], 'white', { scale: [0.95, 1.1, 0.9] }),
      kit.sphere(0.08, [-0.06, TOP + 0.19, 0.07], 'orange', { detail: 0, scale: [1, 0.9, 1] }),
      kit.sphere(0.07, [-0.08, TOP + 0.13, -0.09], 'charcoal', { detail: 0 }),
      kit.sphere(0.035, [0.07, TOP + 0.03, 0.05], 'white', { detail: 0 }),
      kit.sphere(0.035, [0.07, TOP + 0.03, -0.05], 'white', { detail: 0 }),
      // head: face patches, ears, eyes, nose, cheeks
      kit.sphere(HEAD.r, [HEAD.x, HEAD.y, 0], 'white'),
      kit.sphere(0.06, [HEAD.x - 0.01, HEAD.y + 0.045, 0.045], 'orange', { detail: 0 }),
      kit.sphere(0.055, [HEAD.x - 0.01, HEAD.y + 0.045, -0.045], 'charcoal', { detail: 0 }),
      kit.cone(0.04, 0.08, [HEAD.x - 0.015, HEAD.y + 0.115, 0.06], 'orange', { segments: 4 }),
      kit.cone(0.04, 0.08, [HEAD.x - 0.015, HEAD.y + 0.115, -0.06], 'charcoal', { segments: 4 }),
      kit.sphere(0.017, [HEAD.x + 0.08, HEAD.y + 0.01, 0.04], 'charcoal', { detail: 0 }),
      kit.sphere(0.017, [HEAD.x + 0.08, HEAD.y + 0.01, -0.04], 'charcoal', { detail: 0 }),
      kit.sphere(0.017, [HEAD.x + 0.09, HEAD.y - 0.022, 0], 'pink', { detail: 0 }),
      // tail resting along the front edge of the wall, tip dark
      kit.sphere(0.03, [-0.12, TOP + 0.035, 0.12], 'orange', { detail: 0 }),
      kit.sphere(0.03, [-0.06, TOP + 0.03, 0.2], 'orange', { detail: 0 }),
      kit.sphere(0.03, [0.02, TOP + 0.03, 0.25], 'charcoal', { detail: 0 }),
    ];
    return kit.finish(parts);
  },
};

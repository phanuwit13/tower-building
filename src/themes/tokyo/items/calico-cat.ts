import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A friendly calico cat (1×1) sitting upright on a low stone wall, facing +x, paws down (not a beckoning pose):
// bold white, orange and black patches, about 0.3 tall.
const WALL = { w: 0.55, d: 0.95, h: 0.12, cap: 0.03 };
const TOP = WALL.h + WALL.cap; // top of the wall
const K = 1.5; // the cat is drawn at 1.5 times a small cat so it reads from the default camera
const HEAD = { x: 0.07 * K, y: TOP + 0.235 * K, r: 0.09 * K };
// a point on the cat: x and z scaled, y measured up from the wall top
const at = (x: number, y: number, z: number): [number, number, number] => [x * K, TOP + y * K, z * K];

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
      // body and big patches (orange saddle, black patch, white chest)
      kit.sphere(0.13 * K, at(-0.03, 0.12, 0), 'white', { scale: [0.95, 1.1, 0.9] }),
      kit.sphere(0.1 * K, at(-0.07, 0.2, 0.06), 'orange', { scale: [1.1, 0.9, 1] }),
      kit.sphere(0.085 * K, at(-0.05, 0.1, -0.1), 'charcoal', { detail: 0, scale: [1, 1.1, 0.8] }),
      kit.sphere(0.05 * K, at(0.02, 0.2, -0.07), 'orange', { detail: 0 }),
      kit.sphere(0.04 * K, at(0.07, 0.03, 0.06), 'white', { detail: 0 }),
      kit.sphere(0.04 * K, at(0.07, 0.03, -0.06), 'white', { detail: 0 }),
      // head: one orange ear patch, one black, white face
      kit.sphere(HEAD.r, [HEAD.x, HEAD.y, 0], 'white'),
      kit.sphere(0.07 * K, at(0.055, 0.28, 0.05), 'orange', { detail: 0 }),
      kit.sphere(0.065 * K, at(0.055, 0.28, -0.05), 'charcoal', { detail: 0 }),
      kit.cone(0.045 * K, 0.09 * K, at(0.055, 0.35, 0.065), 'orange', { segments: 4 }),
      kit.cone(0.045 * K, 0.09 * K, at(0.055, 0.35, -0.065), 'charcoal', { segments: 4 }),
      kit.sphere(0.02 * K, at(0.145, 0.245, 0.04), 'charcoal', { detail: 0 }),
      kit.sphere(0.02 * K, at(0.145, 0.245, -0.04), 'charcoal', { detail: 0 }),
      kit.sphere(0.02 * K, at(0.16, 0.213, 0), 'pink', { detail: 0 }),
      // tail resting along the front edge of the wall, tip dark
      kit.sphere(0.035 * K, at(-0.12, 0.035, 0.12), 'orange', { detail: 0 }),
      kit.sphere(0.035 * K, at(-0.06, 0.03, 0.2), 'orange', { detail: 0 }),
      kit.sphere(0.035 * K, at(0.0, 0.03, 0.25), 'charcoal', { detail: 0 }),
    ];
    return kit.finish(parts);
  },
};

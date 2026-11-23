import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { ICO_LOW } from '../../../models/parts';

// An icy pool (long side along z). A tall white rock ledge runs along the back (-x) with a little slide
// into the water; low rim rocks edge the front. Four penguins stand on rocks, one swims.
const BASE_H = 0.05;
const WATER = { x: 0.32, z: 0, w: 1.12, d: 2.7, top: 0.1 };
const LEDGE = { x: -0.73, w: 0.5, d: 2.9, h: 0.28 }; // top at BASE_H + h
const LEDGE_TOP = BASE_H + LEDGE.h;
const POOL: MotionOpts = { kind: 'water', water: 'pool' };

/** A cartoon penguin standing on `y`, turned by `yaw` about y (0 faces +x). */
function penguin(kit: StyleKit, x: number, y: number, z: number, yaw: number): Part[] {
  const K = 1.4; // size of the penguin
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  /** Local (forward, side, up) to world. */
  const at = (f: number, side: number, up: number): [number, number, number] => [x + K * (f * c + side * s), y + K * up, z + K * (-f * s + side * c)];
  const rot: [number, number, number] = [0, yaw, 0];
  return [
    kit.sphere(0.11 * K, at(0, 0, 0.15), 'charcoal', { scale: [0.9, 1.35, 0.9], rotate: rot }),
    kit.sphere(0.09 * K, at(0.06, 0, 0.14), 'white', { detail: 1, scale: [0.8, 1.45, 0.9], rotate: rot }),
    kit.sphere(0.075 * K, at(0.01, 0, 0.32), 'charcoal', { rotate: rot }),
    kit.sphere(0.026 * K, at(0.055, 0.04, 0.34), 'white', { detail: 0 }),
    kit.sphere(0.026 * K, at(0.055, -0.04, 0.34), 'white', { detail: 0 }),
    kit.sphere(0.013 * K, at(0.077, 0.04, 0.34), 'charcoal', { detail: 0 }),
    kit.sphere(0.013 * K, at(0.077, -0.04, 0.34), 'charcoal', { detail: 0 }),
    kit.cone(0.025 * K, 0.07 * K, at(0.09, 0, 0.305), 'orange', { segments: 6, rotate: [0, yaw, -Math.PI / 2] }),
    kit.sphere(0.04 * K, at(0, 0.11, 0.17), 'charcoal', { detail: 0, scale: [0.5, 1.4, 0.8], rotate: [0, yaw, 0.0] }),
    kit.sphere(0.04 * K, at(0, -0.11, 0.17), 'charcoal', { detail: 0, scale: [0.5, 1.4, 0.8], rotate: [0, yaw, 0.0] }),
    kit.box([0.1 * K, 0.02 * K, 0.05 * K], at(0.04, 0.045, 0.01), 'orange', { rotate: rot }),
    kit.box([0.1 * K, 0.02 * K, 0.05 * K], at(0.04, -0.045, 0.01), 'orange', { rotate: rot }),
  ];
}

/** บ่อเพนกวิน: an icy pool with white rock ledges, a slide and five friendly penguins. */
export const item: ItemModel = {
  id: 'penguin-pool',
  name: 'บ่อเพนกวิน',
  category: 'animal',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.96, BASE_H, 2.96], [0, BASE_H / 2, 0], 'stone'),
      kit.box([WATER.w, WATER.top - BASE_H, WATER.d], [WATER.x, (WATER.top + BASE_H) / 2, WATER.z], 'skyBlue', { motion: POOL }),
      // the tall back ledge: a white block with rounded rock lumps on top and along the sides
      kit.box([LEDGE.w, LEDGE.h, LEDGE.d], [LEDGE.x, BASE_H + LEDGE.h / 2, 0], 'white'),
    ];
    for (const z of [-1.1, -0.45, 0.4, 1.1]) {
      parts.push(kit.sphere(0.27, [LEDGE.x - 0.02, LEDGE_TOP - 0.02, z], 'white', { scale: [0.85, 0.4, 1.35] }));
    }
    for (const z of [-1.3, -0.65, 0.0, 0.65, 1.3]) {
      parts.push(kit.sphere(0.13, [LEDGE.x + LEDGE.w / 2, BASE_H + 0.1, z], 'stone', { detail: 0, scale: [1, 0.8, 1.3] }));
    }
    // slide: a blue ramp from the ledge down into the water, with two white side rails
    parts.push(
      kit.wedge([0.46, 0.3, 0.4], [LEDGE.x + LEDGE.w / 2 + 0.23, BASE_H + 0.15, 0.1], 'blue', { apex: -0.5 }),
      kit.wedge([0.46, 0.3, 0.04], [LEDGE.x + LEDGE.w / 2 + 0.23, BASE_H + 0.15, 0.32], 'white', { apex: -0.5 }),
      kit.wedge([0.46, 0.3, 0.04], [LEDGE.x + LEDGE.w / 2 + 0.23, BASE_H + 0.15, -0.12], 'white', { apex: -0.5 }),
    );
    // front rim rocks along +x and the two z ends
    const rim: Array<[number, number, number]> = [];
    for (let i = 0; i < 6; i++) rim.push([0.8, -1.25 + i * 0.5, i % 2 ? 0.13 : 0.16]);
    for (const x of [-0.1, 0.3, 0.7]) rim.push([x, 1.32, 0.13], [x, -1.32, 0.14]);
    for (const [x, z, r] of rim) parts.push(kit.sphere(r, [x, BASE_H + r * 0.6 * ICO_LOW, z], 'white', { detail: 0, scale: [1.1, 0.6, 1.2] }));
    // a big rock in front for the fourth standing penguin
    parts.push(kit.sphere(0.24, [0.7, BASE_H + 0.1, -0.7], 'white', { scale: [1, 0.55, 1.1] }));
    // penguins: three on the ledge, one on the front rock, one swimming
    parts.push(
      ...penguin(kit, LEDGE.x + 0.02, LEDGE_TOP, -1.0, 0.2),
      ...penguin(kit, LEDGE.x + 0.04, LEDGE_TOP, -0.42, -0.3),
      ...penguin(kit, LEDGE.x, LEDGE_TOP, 1.05, 0.5),
      ...penguin(kit, 0.7, BASE_H + 0.2, -0.7, -0.4),
    );
    // the swimmer: only the back, head and beak show above the water
    parts.push(
      kit.sphere(0.1, [0.35, WATER.top + 0.01, 0.7], 'charcoal', { scale: [1.3, 0.8, 0.9] }),
      kit.sphere(0.07, [0.5, WATER.top + 0.07, 0.7], 'charcoal'),
      kit.sphere(0.024, [0.55, WATER.top + 0.09, 0.74], 'white', { detail: 0 }),
      kit.sphere(0.024, [0.55, WATER.top + 0.09, 0.66], 'white', { detail: 0 }),
      kit.sphere(0.012, [0.575, WATER.top + 0.09, 0.74], 'charcoal', { detail: 0 }),
      kit.sphere(0.012, [0.575, WATER.top + 0.09, 0.66], 'charcoal', { detail: 0 }),
      kit.cone(0.022, 0.06, [0.58, WATER.top + 0.06, 0.7], 'orange', { segments: 6, rotate: [0, 0, -Math.PI / 2] }),
    );
    return kit.finish(parts);
  },
};

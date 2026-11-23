import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';

// Two shallow tiled pools (2×2) on a stone deck, baby turtles in each, and a little picture sign between them.
const DECK = 0.03;
const POOL = { w: 1.7, d: 0.8, t: 0.1, h: 0.14 };
const POOL_Z = 0.5; // pool centres at ±POOL_Z
const WATER = { top: DECK + 0.09 };

/** A baby turtle facing +x at `at` (water surface), turned by `yaw`. */
function turtle(kit: StyleKit, at: Vec3, yaw: number): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const pt = (lx: number, ly: number, lz: number): Vec3 => [at[0] + lx * c + lz * s, at[1] + ly, at[2] - lx * s + lz * c];
  const rotate: Vec3 = [0, yaw, 0];
  return [
    kit.sphere(0.1, pt(0, 0.03, 0), 'leaf', { detail: 0, scale: [1.1, 0.55, 1], rotate }),
    kit.sphere(0.06, pt(0.01, 0.07, 0), 'leafDark', { detail: 0, scale: [1.1, 0.5, 1], rotate }),
    kit.sphere(0.045, pt(0.12, 0.03, 0), 'lime', { detail: 0 }),
    kit.sphere(0.012, pt(0.15, 0.06, 0.03), 'charcoal', { detail: 0 }),
    kit.sphere(0.012, pt(0.15, 0.06, -0.03), 'charcoal', { detail: 0 }),
    kit.box([0.08, 0.016, 0.05], pt(0.06, 0.012, 0.11), 'lime', { rotate: [0, yaw + 0.5, 0] }),
    kit.box([0.08, 0.016, 0.05], pt(0.06, 0.012, -0.11), 'lime', { rotate: [0, yaw - 0.5, 0] }),
    kit.box([0.06, 0.016, 0.04], pt(-0.07, 0.012, 0.09), 'lime', { rotate: [0, yaw - 0.4, 0] }),
    kit.box([0.06, 0.016, 0.04], pt(-0.07, 0.012, -0.09), 'lime', { rotate: [0, yaw + 0.4, 0] }),
  ];
}

/** บ่ออนุบาลเต่าทะเล: two shallow tiled pools with baby turtles and a conservation picture sign. */
export const item: ItemModel = {
  id: 'turtle-nursery',
  name: 'บ่ออนุบาลเต่าทะเล',
  category: 'animal',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.96, DECK, 1.96], [0, DECK / 2, 0], 'stone')];
    const iw = POOL.w - 2 * POOL.t;
    const id = POOL.d - 2 * POOL.t;
    for (const sz of [-1, 1]) {
      const cz = sz * POOL_Z;
      const y = DECK + POOL.h / 2;
      parts.push(
        kit.box([iw + 0.02, WATER.top - DECK, id + 0.02], [0, (DECK + WATER.top) / 2, cz], 'skyBlue', { motion: { kind: 'water', water: 'pool' } }),
        kit.box([POOL.w, POOL.h, POOL.t], [0, y, cz + sz * (POOL.d - POOL.t) / 2], 'teal'),
        kit.box([POOL.w, POOL.h, POOL.t], [0, y, cz - sz * (POOL.d - POOL.t) / 2], 'teal'),
        kit.box([POOL.t, POOL.h, id], [(POOL.w - POOL.t) / 2, y, cz], 'teal'),
        kit.box([POOL.t, POOL.h, id], [-(POOL.w - POOL.t) / 2, y, cz], 'teal'),
        kit.box([POOL.w + 0.02, 0.03, 0.04], [0, DECK + POOL.h + 0.015, cz + sz * (POOL.d / 2 - 0.05)], 'white'),
      );
    }
    parts.push(
      ...turtle(kit, [0.45, WATER.top, -POOL_Z + 0.05], 0.4),
      ...turtle(kit, [-0.3, WATER.top, -POOL_Z - 0.05], 3.4),
      ...turtle(kit, [-0.55, WATER.top, -POOL_Z + 0.1], 5.2),
      ...turtle(kit, [0.4, WATER.top, POOL_Z - 0.05], 5.6),
      ...turtle(kit, [-0.1, WATER.top, POOL_Z + 0.08], 2.6),
    );
    // picture sign between the pools (shapes only): a post, a tilted blue board with a green turtle and a yellow sun
    parts.push(
      kit.cylinder(0.03, 0.03, 0.4, [0.75, DECK + 0.2, 0], 'woodDark', { segments: 6 }),
      kit.box([0.04, 0.3, 0.46], [0.75, DECK + 0.5, 0], 'wood', { rotate: [0, 0, 0.25] }),
      kit.box([0.02, 0.26, 0.42], [0.765, DECK + 0.495, 0], 'skyBlue', { rotate: [0, 0, 0.25] }),
      kit.sphere(0.07, [0.79, DECK + 0.47, 0.02], 'leaf', { detail: 0, scale: [0.4, 0.7, 1] }),
      kit.sphere(0.035, [0.795, DECK + 0.47, -0.1], 'lime', { detail: 0 }),
      kit.sphere(0.04, [0.79, DECK + 0.6, 0.1], 'sunYellow', { detail: 0 }),
      // little pebbles and a shell on the deck
      kit.sphere(0.07, [-0.85, DECK + 0.05, -0.02], 'stoneDark', { detail: 0, scale: [1.2, 0.7, 1] }),
      kit.sphere(0.08, [0.1, DECK + 0.05, -0.02], 'pink', { detail: 0, scale: [1.2, 0.6, 1] }),
    );
    return kit.finish(parts);
  },
};

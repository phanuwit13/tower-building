import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// A white ice shelf along the back (-z) and a cold blue pool in front (+z, towards the camera).
// A polar bear and a cub rest on the shelf, both facing +x. Everything stays inside 2 x 3.
const SHELF = { h: 0.3, cap: 0.05, d: 1.45, z: -0.775 }; // body of the shelf; z = centre
const SHELF_TOP = SHELF.h + SHELF.cap;
const POOL = { rim: 0.14, rimW: 0.1, water: 0.08 }; // rim height, rim thickness, water surface height
const WATER: MotionOpts = { kind: 'water', water: 'pool' };

/** A rounded polar bear lying on all fours, facing +x. `s` scales the whole animal (cub = small). */
function bear(kit: Parameters<ItemModel['build']>[0], cx: number, cz: number, s: number): Part[] {
  const y0 = SHELF_TOP;
  const head: [number, number, number] = [cx + 0.36 * s, y0 + 0.3 * s, cz];
  const parts: Part[] = [
    kit.sphere(1, [cx, y0 + 0.2 * s, cz], 'white', { scale: [0.36 * s, 0.22 * s, 0.24 * s] }),
    kit.sphere(0.17 * s, head, 'white'),
    kit.sphere(0.08 * s, [head[0] + 0.14 * s, head[1] - 0.04 * s, cz], 'cream', { detail: 0, scale: [1.2, 0.85, 1] }),
    kit.sphere(0.03 * s, [head[0] + 0.215 * s, head[1] - 0.01 * s, cz], 'charcoal', { detail: 0 }),
  ];
  for (const sz of [-1, 1]) {
    parts.push(
      kit.sphere(0.09 * s, [cx + 0.2 * s, y0 + 0.07 * s, cz + sz * 0.13 * s], 'white', { detail: 0, scale: [1, 1.2, 1] }), // front paws
      kit.sphere(0.09 * s, [cx - 0.2 * s, y0 + 0.07 * s, cz + sz * 0.13 * s], 'white', { detail: 0, scale: [1, 1.2, 1] }), // back paws
      kit.sphere(0.05 * s, [head[0] - 0.04 * s, head[1] + 0.1 * s, cz + sz * 0.14 * s], 'white', { detail: 0 }), // ears
      kit.sphere(0.028 * s, [head[0] + 0.14 * s, head[1] + 0.05 * s, cz + sz * 0.07 * s], 'charcoal', { detail: 0 }), // big eyes
    );
  }
  return parts;
}

/** บ่อหมีขั้วโลก: the polar bear cove, a bear and a cub on a white ice shelf above a cold blue pool. */
export const item: ItemModel = {
  id: 'polar-bear-cove',
  name: 'อ่าวหมีขั้วโลก',
  category: 'animal',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      // ice shelf: white body, pale blue top
      kit.box([2, SHELF.h, SHELF.d], [0, SHELF.h / 2, SHELF.z], 'white'),
      kit.box([1.94, SHELF.cap, SHELF.d - 0.06], [0, SHELF.h + SHELF.cap / 2, SHELF.z], 'glassBlue'),
      // pool: pale ice rim on three sides, water inside
      kit.box([POOL.rimW, POOL.rim, 1.55], [-0.95, POOL.rim / 2, 0.725], 'glassBlue'),
      kit.box([POOL.rimW, POOL.rim, 1.55], [0.95, POOL.rim / 2, 0.725], 'glassBlue'),
      kit.box([2, POOL.rim, POOL.rimW], [0, POOL.rim / 2, 1.45], 'glassBlue'),
      kit.box([1.8, POOL.water, 1.4], [0, POOL.water / 2, 0.7], 'skyBlue', { motion: WATER }),
      // an ice step into the water, floating floes
      kit.box([0.6, 0.16, 0.3], [0.45, 0.08, 0.1], 'white'),
      kit.cylinder(0.17, 0.17, 0.04, [-0.45, POOL.water + 0.02, 0.7], 'white', { segments: 8 }),
      kit.cylinder(0.12, 0.12, 0.04, [0.3, POOL.water + 0.02, 1.0], 'white', { segments: 8 }),
      // icy peaks and rocks on the shelf, kept behind the animals
      kit.cone(0.2, 0.55, [-0.75, SHELF_TOP + 0.27, -1.2], 'glassBlue', { segments: 5 }),
      kit.cone(0.15, 0.4, [-0.45, SHELF_TOP + 0.2, -1.3], 'white', { segments: 5 }),
      kit.cone(0.17, 0.45, [0.7, SHELF_TOP + 0.22, -1.25], 'glassBlue', { segments: 5 }),
      kit.sphere(0.13, [0.72, SHELF_TOP + 0.04, -0.4], 'stone', { detail: 0, scale: [1.2, 0.6, 1] }),
      kit.sphere(0.1, [-0.8, SHELF_TOP + 0.03, -0.45], 'stoneDark', { detail: 0, scale: [1.2, 0.6, 1] }),
      ...bear(kit, -0.3, -0.95, 1),
      ...bear(kit, 0.3, -0.35, 0.55),
    ];
    return kit.finish(parts);
  },
};

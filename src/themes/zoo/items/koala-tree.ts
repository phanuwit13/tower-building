import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { rod } from '../../../models/parts';

// A eucalyptus tree on a grass patch. One koala hugs the trunk (+x side), one sits in the fork.
// The leaf clumps sway about the top of the trunk; the trunk, branches and koalas stay put.
const GROUND_H = 0.03;
const TRUNK = { z: -0.1, h: 1.0, rTop: 0.09, rBottom: 0.14 };
const FORK: Vec3 = [0, GROUND_H + TRUNK.h, TRUNK.z];
const SWAY: MotionOpts = { kind: 'sway', pivot: FORK, amount: 0.05 };
/** Leaf clumps: [x, y, z, radius, colour]. */
const LEAVES: Array<[number, number, number, number, 'leaf' | 'mint' | 'leafDark']> = [
  [0, 1.82, -0.1, 0.3, 'leaf'], [0, 1.66, 0.68, 0.27, 'mint'], [0, 1.62, -0.7, 0.25, 'mint'],
  [0.2, 1.72, 0.3, 0.2, 'leafDark'], [-0.2, 1.72, -0.5, 0.2, 'leaf'], [-0.15, 1.5, 0.45, 0.17, 'leaf'],
];

/** A round-eared grey koala clinging upright, face towards +x. `s` scales it. */
function koala(kit: Parameters<ItemModel['build']>[0], x: number, y: number, z: number, s: number): Part[] {
  const head: Vec3 = [x + 0.02 * s, y + 0.2 * s, z];
  const parts: Part[] = [
    kit.sphere(1, [x, y, z], 'stone', { scale: [0.09 * s, 0.15 * s, 0.1 * s] }),
    kit.sphere(1, [x + 0.06 * s, y - 0.01 * s, z], 'white', { detail: 0, scale: [0.04 * s, 0.1 * s, 0.07 * s] }),
    kit.sphere(0.095 * s, head, 'stone'),
    kit.sphere(0.03 * s, [head[0] + 0.085 * s, head[1] - 0.02 * s, z], 'charcoal', { detail: 0, scale: [0.8, 1.2, 1] }),
  ];
  for (const sz of [-1, 1]) {
    parts.push(
      kit.sphere(0.06 * s, [head[0] - 0.01 * s, head[1] + 0.07 * s, z + sz * 0.1 * s], 'stone', { detail: 0 }), // big round ears
      kit.sphere(0.03 * s, [head[0] + 0.015 * s, head[1] + 0.07 * s, z + sz * 0.105 * s], 'white', { detail: 0 }),
      kit.sphere(0.02 * s, [head[0] + 0.075 * s, head[1] + 0.025 * s, z + sz * 0.045 * s], 'charcoal', { detail: 0 }), // eyes
      kit.sphere(1, [x - 0.01 * s, y + 0.04 * s, z + sz * 0.1 * s], 'stoneDark', { detail: 0, scale: [0.05 * s, 0.1 * s, 0.04 * s] }), // arms around
    );
  }
  return parts;
}

/** โคอาล่าบนต้นยูคาลิปตัส: a eucalyptus tree with a koala on the trunk and one in the fork. */
export const item: ItemModel = {
  id: 'koala-tree',
  name: 'โคอาล่าบนต้นยูคาลิปตัส',
  category: 'animal',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.95, GROUND_H, 1.95], [0, GROUND_H / 2, 0], 'lime'),
      kit.cylinder(TRUNK.rTop, TRUNK.rBottom, TRUNK.h, [0, GROUND_H + TRUNK.h / 2, TRUNK.z], 'sand'),
      kit.cylinder(0.092, 0.1, 0.3, [0, GROUND_H + 0.65, TRUNK.z], 'stone', { segments: 8, scale: [1.03, 1, 1.03] }), // pale peeling bark patch
      rod(kit, FORK, [0, 1.45, 0.62], 0.05, 'sand'),
      rod(kit, FORK, [0, 1.4, -0.7], 0.05, 'sand'),
      kit.sphere(0.1, FORK, 'sand', { detail: 0 }),
      ...koala(kit, 0.2, GROUND_H + 0.4, TRUNK.z, 1),
      ...koala(kit, 0.02, FORK[1] + 0.16, TRUNK.z, 0.9),
    ];
    for (const [x, y, z, r, color] of LEAVES) parts.push(kit.sphere(r, [x, y, z], color, { motion: SWAY }));
    // two tufts on the grass
    parts.push(kit.sphere(0.07, [0.3, GROUND_H + 0.03, 0.7], 'leaf', { detail: 0, scale: [1, 0.6, 1] }), kit.sphere(0.06, [-0.3, GROUND_H + 0.03, -0.75], 'leafDark', { detail: 0, scale: [1, 0.6, 1] }));
    return kit.finish(parts);
  },
};

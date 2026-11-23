import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { rod } from '../../../models/parts';

// 1x2, long side along z. A sandy pen with a low fence; the ostrich stands in the middle (z < 0) looking
// towards +x, a straw nest with two eggs sits at the +z end.
const SAND_H = 0.03;
const PEN = { w: 0.9, d: 1.9 };
const FENCE = { x: 0.42, z: 0.92, postH: 0.2, post: 0.05 };
const OSTRICH = { x: 0, z: -0.3, legH: 0.42 };
const BODY_Y = SAND_H + OSTRICH.legH + 0.1;
const NEST = { z: 0.62, x: 0.0 };

/** คอกนกกระจอกเทศ: sandy pen, a tall friendly ostrich, a nest with two eggs. */
export const item: ItemModel = {
  id: 'ostrich-pen',
  name: 'คอกนกกระจอกเทศ',
  category: 'animal',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const { x, z } = OSTRICH;
    const parts: Part[] = [kit.box([PEN.w, SAND_H, PEN.d], [0, SAND_H / 2, 0], 'sand')];
    // low fence round the pen
    const F = FENCE;
    const zs = [-F.z, -0.46, 0, 0.46, F.z];
    for (const sx of [-1, 1]) for (const pz of zs) parts.push(kit.box([F.post, F.postH, F.post], [sx * F.x, SAND_H + F.postH / 2 - 0.01, pz], 'woodDark'));
    for (const pz of [-F.z, F.z]) for (const px of [-0.21, 0.21]) parts.push(kit.box([F.post, F.postH, F.post], [px, SAND_H + F.postH / 2 - 0.01, pz], 'woodDark'));
    for (const y of [0.09, 0.17]) {
      for (const sx of [-1, 1]) parts.push(kit.box([0.03, 0.035, 2 * F.z], [sx * F.x, SAND_H + y, 0], 'wood'));
      for (const sz of [-1, 1]) parts.push(kit.box([2 * F.x, 0.035, 0.03], [0, SAND_H + y, sz * F.z], 'wood'));
    }
    // ostrich: black-and-white round body, long pink legs, long neck, small head with big eyes
    parts.push(
      kit.sphere(1, [x, BODY_Y, z], 'charcoal', { scale: [0.22, 0.17, 0.17] }),
      kit.sphere(1, [x - 0.17, BODY_Y + 0.07, z], 'white', { detail: 0, scale: [0.12, 0.1, 0.13] }), // tail feathers
      kit.sphere(1, [x - 0.02, BODY_Y + 0.02, z + 0.145], 'white', { detail: 0, scale: [0.15, 0.1, 0.03] }), // wings
      kit.sphere(1, [x - 0.02, BODY_Y + 0.02, z - 0.145], 'white', { detail: 0, scale: [0.15, 0.1, 0.03] }),
      kit.sphere(1, [x + 0.14, BODY_Y + 0.06, z], 'pink', { detail: 0, scale: [0.09, 0.1, 0.08] }), // chest
    );
    for (const side of [-1, 1]) {
      const hip: Vec3 = [x + 0.02, BODY_Y - 0.12, z + side * 0.07];
      const foot: Vec3 = [x + 0.06, SAND_H, z + side * 0.07];
      parts.push(
        rod(kit, hip, [foot[0], SAND_H + 0.02, foot[2]], 0.025, 'pink', { segments: 6 }),
        kit.box([0.14, 0.03, 0.06], [foot[0] + 0.04, SAND_H + 0.015, foot[2]], 'pink'), // foot
      );
    }
    const neckBase: Vec3 = [x + 0.15, BODY_Y + 0.1, z];
    const head: Vec3 = [x + 0.25, BODY_Y + 0.62, z];
    parts.push(
      rod(kit, neckBase, head, 0.04, 'pink', { segments: 6 }),
      kit.sphere(1, [head[0] + 0.02, head[1] + 0.04, head[2]], 'pink', { scale: [0.09, 0.07, 0.07] }),
      kit.cone(0.025, 0.1, [head[0] + 0.115, head[1] + 0.03, head[2]], 'orange', { segments: 6, rotate: [0, 0, -Math.PI / 2] }), // beak
    );
    for (const side of [-1, 1]) {
      parts.push(
        kit.sphere(0.028, [head[0] + 0.07, head[1] + 0.07, head[2] + side * 0.05], 'white', { detail: 0 }),
        kit.sphere(0.014, [head[0] + 0.09, head[1] + 0.07, head[2] + side * 0.058], 'charcoal', { detail: 0 }),
      );
    }
    // nest: a ring of straw with two eggs
    const nestY = SAND_H + 0.035;
    parts.push(
      kit.torus(0.17, 0.045, [NEST.x, nestY, NEST.z], 'brass', { rotate: [Math.PI / 2, 0, 0], radialSegments: 5, tubularSegments: 12 }),
      kit.cylinder(0.15, 0.15, 0.03, [NEST.x, SAND_H + 0.015, NEST.z], 'sand', { segments: 12 }),
      kit.sphere(1, [NEST.x - 0.06, nestY + 0.07, NEST.z - 0.02], 'cream', { scale: [0.07, 0.09, 0.07] }),
      kit.sphere(1, [NEST.x + 0.07, nestY + 0.07, NEST.z + 0.04], 'white', { scale: [0.07, 0.09, 0.07] }),
    );
    return kit.finish(parts);
  },
};

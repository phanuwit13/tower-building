import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A red cartoon crab on a sand disc, facing +x, both claws raised, standing next to its little hole.
const BASE = { r: 0.46, h: 0.03 };
const GROUND = BASE.h;
const CRAB = { x: 0.1, z: -0.08, bodyY: GROUND + 0.13 };
const HOLE = { x: -0.25, z: 0.26 };

/** ปูน้อย: a friendly red crab with raised claws beside its hole. */
export const item: ItemModel = {
  id: 'little-crab',
  name: 'ปูน้อย',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const { x, z, bodyY } = CRAB;
    const parts: Part[] = [
      kit.cylinder(BASE.r, BASE.r, BASE.h, [0, BASE.h / 2, 0], 'sand', { segments: 16 }),
      // the hole: a low sand mound with a dark opening on top
      kit.dome(0.16, [HOLE.x, GROUND, HOLE.z], 'sand', { segments: 8, scale: [1, 0.4, 1] }),
      kit.cylinder(0.08, 0.08, 0.012, [HOLE.x, GROUND + 0.064, HOLE.z], 'bark', { segments: 8 }),
      // body: wide along z (the crab walks sideways), with eyes on stalks at the front
      kit.sphere(0.17, [x, bodyY, z], 'red', { scale: [0.85, 0.55, 1.3] }),
      kit.sphere(0.12, [x, bodyY + 0.02, z], 'redDark', { detail: 0, scale: [0.8, 0.35, 1.1] }), // shell patch
    ];
    for (const s of [1, -1]) {
      parts.push(
        rod(kit, [x + 0.1, bodyY + 0.03, z + s * 0.06], [x + 0.11, bodyY + 0.14, z + s * 0.06], 0.014, 'red', { segments: 4 }),
        kit.sphere(0.035, [x + 0.11, bodyY + 0.16, z + s * 0.06], 'white', { detail: 0 }),
        kit.sphere(0.017, [x + 0.14, bodyY + 0.16, z + s * 0.06], 'charcoal', { detail: 0 }),
        // arm up to a raised claw: a big ball with two pincer cones
        rod(kit, [x + 0.05, bodyY + 0.03, z + s * 0.2], [x + 0.14, bodyY + 0.2, z + s * 0.3], 0.025, 'red', { segments: 4 }),
        kit.sphere(0.075, [x + 0.15, bodyY + 0.27, z + s * 0.31], 'red', { detail: 0, scale: [1, 1.1, 0.9] }),
        kit.cone(0.03, 0.12, [x + 0.15, bodyY + 0.4, z + s * 0.27], 'redDark', { segments: 6, rotate: [0, 0, 0] }),
        kit.cone(0.03, 0.12, [x + 0.15, bodyY + 0.4, z + s * 0.35], 'redDark', { segments: 6 }),
      );
      // three legs a side, each one bent rod reaching down and out
      for (const f of [-0.08, 0.0, 0.08]) parts.push(rod(kit, [x + f, bodyY - 0.02, z + s * 0.16], [x + f, GROUND, z + s * 0.34], 0.014, 'redDark', { segments: 4 }));
    }
    return kit.finish(parts);
  },
};

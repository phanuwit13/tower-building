import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A bright plastic bucket and a spade beside a little sand mound (1×1).
const BUCKET = { x: 0.14, z: -0.16, rTop: 0.19, rBottom: 0.14, h: 0.3 };

/** ถังทรายกับพลั่ว: a plastic bucket and spade next to a sand mound. */
export const item: ItemModel = {
  id: 'sand-bucket',
  name: 'ถังทรายกับพลั่ว',
  category: 'play',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.dome(0.44, [-0.02, 0, 0.02], 'sand', { segments: 12, scale: [1, 0.32, 1] }),
      // bucket: tapered tub, a yellow rim, a sandy fill and a swinging handle
      kit.cylinder(BUCKET.rTop, BUCKET.rBottom, BUCKET.h, [BUCKET.x, BUCKET.h / 2, BUCKET.z], 'red', { segments: 12 }),
      kit.cylinder(BUCKET.rTop + 0.02, BUCKET.rTop + 0.02, 0.04, [BUCKET.x, BUCKET.h - 0.02, BUCKET.z], 'sunYellow', { segments: 12 }),
      kit.cylinder(BUCKET.rTop - 0.02, BUCKET.rTop - 0.02, 0.02, [BUCKET.x, BUCKET.h - 0.03, BUCKET.z], 'sand', { segments: 12 }),
      kit.torus(BUCKET.rTop - 0.01, 0.014, [BUCKET.x, BUCKET.h - 0.02, BUCKET.z], 'blue', { radialSegments: 4, tubularSegments: 12, arc: Math.PI, rotate: [0, Math.PI / 2, 0] }),
      // spade stuck into the mound: handle with a grip, and a blade
      rod(kit, [-0.2, 0.2, 0.22], [-0.02, 0.5, 0.0], 0.02, 'blue', { segments: 6 }),
      kit.box([0.1, 0.05, 0.05], [0.01, 0.51, -0.02], 'blue', { rotate: [0, 0.8, 0] }),
      kit.box([0.14, 0.015, 0.16], [-0.27, 0.1, 0.27], 'orange', { rotate: [0.9, 0.0, 0.5] }),
    ];
    // a few small shells on the mound
    parts.push(kit.sphere(0.03, [-0.3, 0.06, -0.15], 'pink', { detail: 0, scale: [1, 0.5, 1] }));
    parts.push(kit.sphere(0.025, [0.25, 0.015, 0.3], 'white', { detail: 0, scale: [1, 0.6, 1] }));
    return kit.finish(parts);
  },
};

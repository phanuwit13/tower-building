import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// 1x1. A green cast-iron hand pump on a concrete base, with a bucket under the spout.
const BASE_H = 0.1;
const PX = -0.02; // pump axis (x)
const BODY_TOP = 0.78;

/** ปั๊มน้ำมือโยก: green hand pump on a concrete base with a bucket. */
export const item: ItemModel = {
  id: 'hand-pump',
  name: 'ปั๊มน้ำมือโยก',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.98, 0.03, 0.98], [0, 0.015, 0], 'lime'),
      kit.box([0.8, BASE_H, 0.7], [0, BASE_H / 2, 0], 'stone'), // concrete slab
      kit.box([0.5, 0.025, 0.4], [0.12, BASE_H + 0.0125, 0], 'stoneDark'), // wet patch under the spout
      // pump body: foot flange, column, bulge, cap (chunky)
      kit.cylinder(0.2, 0.22, 0.07, [PX, BASE_H + 0.035, 0], 'leafDark', { segments: 10 }),
      kit.cylinder(0.11, 0.13, 0.5, [PX, BASE_H + 0.31, 0], 'leaf', { segments: 10 }),
      kit.cylinder(0.16, 0.16, 0.22, [PX, BASE_H + 0.5, 0], 'leaf', { segments: 10 }),
      kit.cylinder(0.17, 0.17, 0.05, [PX, BASE_H + 0.63, 0], 'leafDark', { segments: 10 }),
      kit.cylinder(0.1, 0.14, 0.12, [PX, BODY_TOP - 0.01, 0], 'leaf', { segments: 10 }),
      // spout: out towards +x, then a short drop
      kit.cylinder(0.06, 0.06, 0.3, [PX + 0.2, 0.55, 0], 'leaf', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.065, 0.065, 0.12, [PX + 0.34, 0.5, 0], 'leafDark', { segments: 8 }),
      // pivot block and lever handle (long arm to the back, grip on the end)
      kit.box([0.14, 0.1, 0.18], [PX, BODY_TOP + 0.09, 0], 'charcoal'),
      rod(kit, [PX + 0.2, BODY_TOP + 0.08, 0], [PX - 0.34, BODY_TOP + 0.34, 0], 0.04, 'charcoal'),
      kit.cylinder(0.055, 0.055, 0.16, [PX - 0.33, BODY_TOP + 0.35, 0], 'red', { segments: 8, rotate: [0, 0, Math.PI / 2 - 0.5] }),
      // bucket under the spout, with a handle
      kit.cylinder(0.17, 0.12, 0.26, [PX + 0.34, BASE_H + 0.025 + 0.13, 0.0], 'blue', { segments: 12 }),
      kit.cylinder(0.14, 0.14, 0.012, [PX + 0.34, BASE_H + 0.025 + 0.266, 0], 'navy', { segments: 12 }), // water inside
      kit.torus(0.16, 0.018, [PX + 0.34, BASE_H + 0.025 + 0.26, 0], 'stoneDark', { arc: Math.PI, radialSegments: 4, tubularSegments: 8, rotate: [0, Math.PI / 2, 0] }),
    ];
    return kit.finish(parts);
  },
};

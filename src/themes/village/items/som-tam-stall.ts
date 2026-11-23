import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A stall with a big clay mortar and wooden pestle, papayas, red chillies and limes on the counter,
// under a striped tarp. Still.
const COUNTER = { x: -0.05, w: 0.6, d: 1.8, h: 0.62 };

/** ร้านส้มตำ: a som tam stall with a clay mortar, papayas, chillies and limes. */
export const item: ItemModel = {
  id: 'som-tam-stall',
  name: 'ร้านส้มตำ',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const top = COUNTER.h;
    const parts: Part[] = [
      kit.box([COUNTER.w, top - 0.04, COUNTER.d], [COUNTER.x, (top - 0.04) / 2, 0], 'wood'),
      kit.box([COUNTER.w + 0.06, 0.04, COUNTER.d + 0.06], [COUNTER.x, top - 0.02, 0], 'woodDark'),
    ];
    for (const z of [-0.92, 0.92]) {
      parts.push(
        kit.cylinder(0.03, 0.03, 1.4, [-0.4, 0.7, z], 'woodDark', { segments: 6 }),
        kit.cylinder(0.03, 0.03, 1.25, [-0.2, 0.625, z], 'woodDark', { segments: 6 }),
      );
    }
    for (let i = 0; i < 6; i++) {
      parts.push(kit.box([0.4, 0.04, 0.3], [-0.3, 1.38, -0.75 + 0.3 * i], i % 2 === 0 ? 'lime' : 'white', { rotate: [0, 0, -0.1] }));
    }
    // big clay mortar with a wooden pestle and a pile of shredded papaya
    const mz = 0.45;
    parts.push(
      kit.cylinder(0.2, 0.12, 0.24, [COUNTER.x, top + 0.12, mz], 'terracotta', { segments: 12 }),
      kit.torus(0.2, 0.03, [COUNTER.x, top + 0.24, mz], 'terracotta', { radialSegments: 4, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.17, 0.17, 0.02, [COUNTER.x, top + 0.23, mz], 'cream', { segments: 12 }),
      kit.sphere(0.09, [COUNTER.x, top + 0.26, mz], 'lime', { detail: 0, scale: [1.3, 0.6, 1.3] }),
      rod(kit, [COUNTER.x + 0.1, top + 0.32, mz - 0.05], [COUNTER.x - 0.02, top + 0.62, mz - 0.2], 0.035, 'woodDark', { segments: 6 }),
    );
    // papayas (orange, a green one), chillies, limes, tomatoes
    parts.push(
      kit.sphere(0.1, [COUNTER.x - 0.1, top + 0.09, -0.65], 'orange', { detail: 0, scale: [0.8, 0.8, 1.35] }),
      kit.sphere(0.1, [COUNTER.x + 0.12, top + 0.09, -0.55], 'lime', { detail: 0, scale: [0.8, 0.8, 1.35] }),
      kit.cylinder(0.14, 0.12, 0.06, [COUNTER.x, top + 0.03, -0.1], 'wood', { segments: 8 }),
    );
    for (let i = 0; i < 6; i++) {
      parts.push(kit.box([0.1, 0.03, 0.03], [COUNTER.x + (i % 2) * 0.04 - 0.02, top + 0.07 + Math.floor(i / 2) * 0.02, -0.1 + (i - 2.5) * 0.03], i % 3 === 0 ? 'leaf' : 'red', { rotate: [0, 0.5 * i, 0.2] }));
    }
    for (const [dx, dz] of [[-0.14, 0.12], [-0.05, 0.1], [-0.1, 0.2]]) {
      parts.push(kit.sphere(0.045, [COUNTER.x + dx, top + 0.045, dz], 'lime', { detail: 0 }));
    }
    for (const [dx, dz] of [[0.14, 0.12], [0.2, 0.22], [0.1, 0.25]]) {
      parts.push(kit.sphere(0.05, [COUNTER.x + dx, top + 0.05, dz], 'red', { detail: 0 }));
    }
    // plate of finished som tam at the end
    parts.push(
      kit.cylinder(0.14, 0.11, 0.03, [COUNTER.x, top + 0.015, 0.8], 'white', { segments: 12 }),
      kit.sphere(0.1, [COUNTER.x, top + 0.06, 0.8], 'orange', { detail: 0, scale: [1.2, 0.5, 1.2] }),
    );
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

const ARM = { r: 0.28, tube: 0.04, cy: 0.35 }; // the curved crown: a U in the z-y plane
const SHANK_TOP = 1.05;
const COIL = { x: 0.26, r: 0.17, tube: 0.045 };

/** สมอเรือ: a big old iron anchor (in the z-y plane, facing +x) standing on a sand patch beside a coil of rope. */
export const item: ItemModel = {
  id: 'anchor',
  name: 'สมอเรือ',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const bottom = ARM.cy - ARM.r - ARM.tube;
    const parts: Part[] = [
      kit.cylinder(0.45, 0.45, 0.03, [0, 0.015, 0], 'sand', { segments: 12 }),
      kit.cylinder(0.04, 0.04, SHANK_TOP - bottom, [0, (SHANK_TOP + bottom) / 2, 0], 'charcoal', { segments: 8 }),
      kit.torus(ARM.r, ARM.tube, [0, ARM.cy, 0], 'charcoal', { radialSegments: 6, tubularSegments: 12, arc: Math.PI, rotate: [0, Math.PI / 2, Math.PI] }),
      kit.torus(0.07, 0.025, [0, SHANK_TOP + 0.05, 0], 'charcoal', { radialSegments: 4, tubularSegments: 12, rotate: [0, Math.PI / 2, 0] }), // ring
      kit.cylinder(0.03, 0.03, 0.55, [0, 0.88, 0], 'woodDark', { segments: 8, rotate: [0, 0, Math.PI / 2] }), // stock
      kit.sphere(0.045, [0.275, 0.88, 0], 'woodDark', { detail: 0 }),
      kit.sphere(0.045, [-0.275, 0.88, 0], 'woodDark', { detail: 0 }),
      // rope from the ring down to the coil
      rod(kit, [0.02, SHANK_TOP + 0.03, 0.06], [COIL.x, 0.16, 0.12], 0.02, 'wood', { segments: 4 }),
      // rope coil: two flat rings
      kit.torus(COIL.r, COIL.tube, [COIL.x, COIL.tube + 0.03, 0], 'wood', { radialSegments: 4, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }),
      kit.torus(COIL.r - 0.01, COIL.tube, [COIL.x, COIL.tube * 3 + 0.03, 0], 'sand', { radialSegments: 4, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }),
    ];
    for (const s of [-1, 1]) {
      // flukes at the crown tips, pointing outwards and up
      parts.push(kit.cone(0.075, 0.2, [0, ARM.cy + 0.08, s * (ARM.r + 0.05)], 'charcoal', { segments: 4, rotate: [-s * 0.6, 0, 0] }));
    }
    return kit.finish(parts);
  },
};

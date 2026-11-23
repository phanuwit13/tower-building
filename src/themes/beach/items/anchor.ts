import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { rod } from '../../../models/parts';

const ARM = { r: 0.22, tube: 0.035, cy: 0.3 }; // the curved crown: a U in the x-y plane
const SHANK_TOP = 0.95;
const LEAN = 0.25; // the anchor leans towards +x (radians), its +x arm resting on the rope coil
const BASE_Y = 0.03; // top of the sand patch: the lean pivots about the foot of the anchor here
const COIL = { x: 0.34, r: 0.1, tube: 0.04 };
const S = Math.sin(LEAN);
const C = Math.cos(LEAN);

/** A point of the upright anchor, leaned about the z axis through the foot (top moves towards +x). */
const lean = (x: number, y: number, z = 0): Vec3 => [x * C + (y - BASE_Y) * S, BASE_Y + (y - BASE_Y) * C - x * S, z];

/** สมอเรือ: a big old iron anchor leaning against a coil of rope, standing on a sand patch. */
export const item: ItemModel = {
  id: 'anchor',
  name: 'สมอเรือ',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const bottom = ARM.cy - ARM.r - ARM.tube;
    const stockY = 0.78;
    const ring = lean(0, SHANK_TOP + 0.05);
    const parts: Part[] = [
      kit.cylinder(0.45, 0.45, 0.03, [0, 0.015, 0], 'sand', { segments: 12 }),
      kit.cylinder(0.04, 0.04, SHANK_TOP - bottom, lean(0, (SHANK_TOP + bottom) / 2), 'charcoal', { segments: 8, rotate: [0, 0, -LEAN] }),
      kit.torus(ARM.r, ARM.tube, lean(0, ARM.cy), 'charcoal', { radialSegments: 6, tubularSegments: 12, arc: Math.PI, rotate: [0, 0, Math.PI - LEAN] }),
      kit.torus(0.065, 0.025, ring, 'charcoal', { radialSegments: 4, tubularSegments: 12, rotate: [0, 0, -LEAN] }), // ring
      kit.cylinder(0.03, 0.03, 0.5, lean(0, stockY), 'woodDark', { segments: 8, rotate: [Math.PI / 2, 0, 0] }), // stock, across the arms
      kit.sphere(0.045, lean(0, stockY, 0.25), 'woodDark', { detail: 0 }),
      kit.sphere(0.045, lean(0, stockY, -0.25), 'woodDark', { detail: 0 }),
      // rope from the ring down to the coil
      rod(kit, ring, [COIL.x, 0.14, 0.05], 0.02, 'wood', { segments: 4 }),
      // rope coil: two flat rings
      kit.torus(COIL.r, COIL.tube, [COIL.x, COIL.tube + 0.03, 0], 'wood', { radialSegments: 4, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }),
      kit.torus(COIL.r - 0.01, COIL.tube, [COIL.x, COIL.tube * 3 + 0.03, 0], 'sand', { radialSegments: 4, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }),
    ];
    for (const s of [-1, 1]) {
      // flukes at the crown tips, pointing outwards and up
      parts.push(kit.cone(0.07, 0.18, lean(s * (ARM.r + 0.04), ARM.cy + 0.07), 'charcoal', { segments: 4, rotate: [0, 0, -s * 0.6 - LEAN] }));
    }
    return kit.finish(parts);
  },
};

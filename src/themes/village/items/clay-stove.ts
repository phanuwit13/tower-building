import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A clay charcoal stove with a pot on top. Coals glow orange and red in the opening at the front
// and breathe at night; no flames. A wooden fan leans against it.
const STOVE_H = 0.5;
const BREATHE = { glow: true, light: 'breathe' } as const;

/** เตาถ่าน: a clay charcoal stove with a pot; the coals glow. */
export const item: ItemModel = {
  id: 'clay-stove',
  name: 'เตาถ่าน',
  category: 'food',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.3, 0.26, STOVE_H, [0, STOVE_H / 2, 0], 'terracotta', { segments: 12 }),
      kit.cylinder(0.33, 0.33, 0.05, [0, 0.025, 0], 'terracotta', { segments: 12 }),
      kit.torus(0.3, 0.035, [0, STOVE_H, 0], 'redDark', { radialSegments: 4, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }),
      // front opening, dark inside, with coals
      kit.box([0.04, 0.2, 0.26], [0.27, 0.22, 0], 'charcoal'),
      kit.box([0.04, 0.03, 0.34], [0.28, 0.1, 0], 'woodDark'),
      // pot: body, lid, knob, handles
      kit.cylinder(0.25, 0.22, 0.24, [0, STOVE_H + 0.14, 0], 'chrome', { segments: 12 }),
      kit.cylinder(0.26, 0.26, 0.03, [0, STOVE_H + 0.27, 0], 'stoneDark', { segments: 12 }),
      kit.sphere(0.04, [0, STOVE_H + 0.32, 0], 'woodDark', { detail: 0 }),
      kit.box([0.1, 0.04, 0.05], [0, STOVE_H + 0.2, 0.3], 'charcoal'),
      kit.box([0.1, 0.04, 0.05], [0, STOVE_H + 0.2, -0.3], 'charcoal'),
      // hand fan leaning on the side
      kit.cylinder(0.14, 0.14, 0.02, [-0.05, 0.32, -0.42], 'sand', { segments: 8, rotate: [Math.PI / 2 - 0.1, 0, 0.0] }),
      kit.box([0.03, 0.2, 0.03], [-0.05, 0.1, -0.44], 'woodDark'),
    ];
    // glowing coals in the opening and on the front sill
    for (const [y, z, c] of [[0.19, -0.07, 'orange'], [0.17, 0.07, 'red'], [0.27, 0, 'red'], [0.13, 0, 'orange']] as const) {
      parts.push(kit.sphere(0.04, [0.3, y, z], c, { detail: 0, ...BREATHE }));
    }
    for (const [z, c] of [[-0.1, 'red'], [0.1, 'orange']] as const) {
      parts.push(kit.sphere(0.035, [0.31, 0.13, z], c, { detail: 0, ...BREATHE }));
    }
    // a heap of charcoal at the back
    for (const [x, z] of [[-0.3, 0.25], [-0.2, 0.36], [-0.38, 0.36]]) {
      parts.push(kit.sphere(0.07, [x, 0.06, z], 'charcoal', { detail: 0 }));
    }
    return kit.finish(parts);
  },
};

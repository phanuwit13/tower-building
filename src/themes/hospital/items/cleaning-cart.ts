import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A cleaning cart: a yellow mop bucket with a mop standing in it, a blue bucket, a lower shelf of folded
// cloths and an upper tray of colourful spray bottles. Cheerful colours, no scary labels.
const Z0 = 0.1;
const LEN = 1.5;
const TOP_Y = 0.62;
const BOTTLES: PaletteColor[] = ['pink', 'lime', 'skyBlue', 'orange', 'purple'];

/** รถเข็นทำความสะอาด: cart with a mop bucket and spray bottles. */
export const item: ItemModel = {
  id: 'cleaning-cart',
  name: 'รถเข็นทำความสะอาด',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const x of [-0.3, 0.3]) for (const z of [Z0 - LEN / 2 + 0.04, Z0 + LEN / 2 - 0.04]) parts.push(kit.box([0.05, 0.56, 0.05], [x, 0.36, z], 'chrome'));
    parts.push(
      kit.box([0.7, 0.04, LEN], [0, 0.22, Z0], 'stone'),
      kit.box([0.74, 0.05, LEN], [0, TOP_Y - 0.025, Z0], 'teal'),
    );
    for (const x of [-0.33, 0.33]) parts.push(kit.box([0.03, 0.08, LEN], [x, TOP_Y + 0.04, Z0], 'teal'));
    // handle at -z
    const hz = Z0 - LEN / 2 - 0.02;
    parts.push(
      kit.box([0.04, 0.4, 0.04], [-0.28, 0.82, hz], 'chrome'),
      kit.box([0.04, 0.4, 0.04], [0.28, 0.82, hz], 'chrome'),
      kit.box([0.6, 0.05, 0.05], [0, 1.02, hz], 'orange'),
    );
    for (const x of [-0.32, 0.32]) for (const z of [Z0 - 0.62, Z0 + 0.62]) {
      parts.push(
        kit.cylinder(0.08, 0.08, 0.06, [x, 0.07608, z], 'charcoal', { segments: 10, rotate: [0, 0, Math.PI / 2] }),
        kit.cylinder(0.035, 0.035, 0.07, [x, 0.07608, z], 'sunYellow', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
        kit.box([0.04, 0.1, 0.04], [x * 0.95, 0.17, z], 'chrome'),
      );
    }
    // lower shelf: folded cloths and a blue bucket
    for (let k = 0; k < 3; k++) parts.push(kit.box([0.4, 0.05, 0.4], [0, 0.265 + k * 0.052, Z0 - 0.45], (['sunYellow', 'mint', 'pink'] as const)[k]));
    parts.push(
      kit.cylinder(0.17, 0.13, 0.22, [0, 0.35, Z0 + 0.35], 'blue', { segments: 10 }),
      kit.torus(0.17, 0.015, [0, 0.46, Z0 + 0.35], 'white', { rotate: [Math.PI / 2, 0, 0], radialSegments: 4, tubularSegments: 12 }),
    );
    // top: yellow mop bucket with a mop (stick, string head)
    const bz = Z0 + 0.3;
    parts.push(
      kit.cylinder(0.22, 0.17, 0.26, [0, TOP_Y + 0.13, bz], 'sunYellow', { segments: 10 }),
      kit.cylinder(0.19, 0.19, 0.02, [0, TOP_Y + 0.25, bz], 'skyBlue', { segments: 10 }),
      kit.cylinder(0.02, 0.02, 0.75, [0.05, TOP_Y + 0.55, bz], 'wood', { segments: 6 }),
      kit.sphere(0.09, [0.05, TOP_Y + 0.3, bz], 'white', { detail: 0, scale: [1, 0.7, 1] }),
    );
    // spray bottles: body, shoulder, trigger head
    BOTTLES.forEach((c, i) => {
      const z = Z0 - 0.55 + i * 0.2;
      const x = i % 2 ? 0.1 : -0.1;
      parts.push(
        kit.cylinder(0.065, 0.065, 0.2, [x, TOP_Y + 0.1, z], c, { segments: 8 }),
        kit.cylinder(0.03, 0.03, 0.06, [x, TOP_Y + 0.23, z], 'white', { segments: 8 }),
        kit.box([0.12, 0.04, 0.04], [x + 0.04, TOP_Y + 0.28, z], 'white'),
      );
    });
    return kit.finish(parts);
  },
};

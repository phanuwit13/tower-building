import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A chrome cart (long along z, handle at the -z end) with two shelves: stacks of folded sheets below,
// stacks and fluffy pillows on top. Colour on the tops, pastel stripes in the stacks.
const SHELF_Y = [0.26, 0.58];
const BODY = { w: 0.7, len: 1.5, z: 0.1 };
const SHEETS: PaletteColor[] = ['skyBlue', 'white', 'mint', 'cream', 'pink'];

/** รถเข็นผ้าปูเตียง: cart of folded sheets and pillows. */
export const item: ItemModel = {
  id: 'linen-cart',
  name: 'รถเข็นผ้าปูเตียง',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    // posts and shelves
    for (const x of [-0.3, 0.3]) for (const z of [BODY.z - BODY.len / 2 + 0.03, BODY.z + BODY.len / 2 - 0.03]) {
      parts.push(kit.box([0.04, 0.62, 0.04], [x, 0.4, z], 'chrome'));
    }
    for (const y of SHELF_Y) parts.push(kit.box([BODY.w, 0.04, BODY.len], [0, y, BODY.z], 'stone'));
    parts.push(kit.box([BODY.w, 0.05, BODY.len], [0, 0.69, BODY.z], 'teal'));
    // rails at the back and sides of the top
    for (const x of [-0.33, 0.33]) parts.push(kit.box([0.03, 0.1, BODY.len], [x, 0.76, BODY.z], 'chrome'));
    // push handle at the -z end
    const hz = BODY.z - BODY.len / 2 - 0.02;
    parts.push(
      kit.box([0.04, 0.4, 0.04], [-0.28, 0.9, hz], 'chrome'),
      kit.box([0.04, 0.4, 0.04], [0.28, 0.9, hz], 'chrome'),
      kit.box([0.6, 0.05, 0.05], [0, 1.1, hz], 'orange'),
    );
    // wheels (axis along x): 4 chunky wheels with yellow hubs
    for (const x of [-0.31, 0.31]) for (const z of [BODY.z - 0.62, BODY.z + 0.62]) {
      parts.push(
        kit.cylinder(0.08, 0.08, 0.06, [x, 0.07608, z], 'charcoal', { segments: 10, rotate: [0, 0, Math.PI / 2] }),
        kit.cylinder(0.035, 0.035, 0.07, [x, 0.07608, z], 'sunYellow', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
        kit.box([0.04, 0.1, 0.04], [x * 0.95, 0.17, z], 'chrome'),
      );
    }
    // lower shelf: stacks of folded sheets
    for (let s = 0; s < 3; s++) {
      const z = BODY.z - 0.45 + s * 0.45;
      for (let k = 0; k < 4; k++) parts.push(kit.box([0.5, 0.05, 0.38], [0, SHELF_Y[0] + 0.045 + k * 0.052, z], SHEETS[(s + k) % 5]));
    }
    // upper shelf: two sheet stacks (z-) and three fluffy pillows (z+)
    for (let s = 0; s < 2; s++) {
      const z = BODY.z - 0.5 + s * 0.4;
      for (let k = 0; k < 4; k++) parts.push(kit.box([0.5, 0.05, 0.34], [0, 0.72 + k * 0.052 + 0.0, z], SHEETS[(s * 2 + k + 1) % 5]));
    }
    for (let p = 0; p < 2; p++) {
      const z = BODY.z + 0.35 + p * 0.34;
      parts.push(
        kit.sphere(0.22, [0, 0.72 + 0.04 + p * 0.0, z], p ? 'mint' : 'pink', { detail: 1, scale: [1.1, 0.4, 0.8] }),
      );
    }
    parts.push(kit.sphere(0.2, [0, 0.9, BODY.z + 0.45], 'white', { detail: 1, scale: [1.1, 0.4, 0.8] }));
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { wallPanel, wheel } from '../../../models/parts';

const BODY = { w: 0.7, h: 0.5, d: 1.3, y: 0.15 }; // cart body; y = its bottom
const TOP_Y = BODY.y + BODY.h; // counter underside
const COUNTER = { w: 0.8, d: 1.4, t: 0.05 };
const MACHINE_Z = 0.32;
const HOLDER_Z = -0.42;
/** The cloud: [x, y, z, radius, colour]. */
const CLOUD: Array<[number, number, number, number, PaletteColor]> = [
  [0, 1.2, MACHINE_Z, 0.3, 'pink'],
  [0.17, 1.05, MACHINE_Z + 0.16, 0.2, 'white'],
  [-0.2, 1.08, MACHINE_Z - 0.1, 0.19, 'pink'],
  [0.05, 1.42, MACHINE_Z - 0.02, 0.17, 'white'],
  [-0.12, 1.02, MACHINE_Z + 0.2, 0.16, 'pink'],
];

/** ร้านสายไหม: a mint-striped cart with a big pink cotton-candy cloud on a machine and a rack of candy sticks. */
export const item: ItemModel = {
  id: 'cotton-candy',
  name: 'ร้านสายไหม',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    // body in five stripes along z
    for (let i = 0; i < 5; i++) {
      parts.push(kit.box([BODY.w, BODY.h, BODY.d / 5], [0, BODY.y + BODY.h / 2, -BODY.d / 2 + (BODY.d / 5) * (i + 0.5)], i % 2 === 0 ? 'mint' : 'white'));
    }
    parts.push(kit.box([COUNTER.w, COUNTER.t, COUNTER.d], [0, TOP_Y + COUNTER.t / 2, 0], 'pink'));
    for (const s of [-1, 1]) {
      for (const z of [-0.4, 0.4]) {
        parts.push(...wheel(kit, { at: [s * 0.37, 0.14, z], radius: 0.1, tube: 0.04, axis: 'x', color: 'charcoal', hubColor: 'stone', hubRadius: 0.03, hubLength: 0.06 }));
      }
    }
    // push handle at the back
    for (const s of [-1, 1]) parts.push(kit.box([0.04, 0.04, 0.3], [s * 0.2, 0.35, -0.8], 'stoneDark'));
    parts.push(kit.box([0.44, 0.04, 0.04], [0, 0.35, -0.95], 'stoneDark'));
    // front sign
    parts.push(...wallPanel(kit, { at: [BODY.w / 2, 0.4, 0], facing: 'x+', w: 0.9, h: 0.28, depth: 0.02, color: 'sunYellow' }));
    parts.push(...wallPanel(kit, { at: [BODY.w / 2, 0.4, 0], facing: 'x+', w: 0.3, h: 0.18, depth: 0.03, color: 'pink' }));
    // machine bowl and the cloud
    const base = TOP_Y + COUNTER.t;
    parts.push(
      kit.cylinder(0.4, 0.28, 0.22, [0, base + 0.11, MACHINE_Z], 'chrome'),
      kit.cylinder(0.42, 0.4, 0.04, [0, base + 0.24, MACHINE_Z], 'red'),
    );
    for (const [x, y, z, r, c] of CLOUD) parts.push(kit.sphere(r, [x, y, z], c));
    // stick holder with candy on sticks
    parts.push(kit.cylinder(0.17, 0.17, 0.1, [0, base + 0.05, HOLDER_Z], 'sunYellow', { segments: 8 }));
    for (const [dx, dz, c] of [[0, 0, 'pink'], [0.09, 0.06, 'white'], [-0.09, 0.06, 'pink'], [0.07, -0.08, 'pink'], [-0.07, -0.08, 'white']] as const) {
      parts.push(
        kit.cylinder(0.022, 0.022, 0.4, [dx, base + 0.3, HOLDER_Z + dz], 'wood', { segments: 4 }),
        kit.sphere(0.085, [dx, base + 0.5, HOLDER_Z + dz], c, { detail: 0 }),
      );
    }
    return kit.finish(parts);
  },
};

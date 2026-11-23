import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { glassWindow } from '../../../models/parts';

// A glass bus shelter (1×2, long side along z, open to +x) with a bench, and a glowing advert panel
// (a picture of a sun over hills, no text) on a post at the end.
const SH = { x: 0.4, z0: -0.95, z1: 0.3, h: 0.9 }; // shelter half-depth, z range, roof height
const BACK_X = -0.36;
const AD = { x: 0.05, z: 0.7 };

/** ป้ายรถเมล์: a glass bus shelter with a bench and a glowing advert panel. */
export const item: ItemModel = {
  id: 'city-bus-stop',
  name: 'ป้ายรถเมล์',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const zc = (SH.z0 + SH.z1) / 2;
    const len = SH.z1 - SH.z0;
    const parts: Part[] = [
      kit.box([0.98, 0.04, 1.9], [0, 0.02, 0], 'stone'),
      // roof, posts and the back glass wall
      kit.box([0.9, 0.06, len + 0.1], [0, SH.h + 0.03, zc], 'teal'),
      kit.box([0.84, 0.03, len], [0, SH.h + 0.075, zc], 'white'),
      kit.box([0.06, SH.h - 0.04, 0.06], [SH.x - 0.05, 0.04 + (SH.h - 0.04) / 2, SH.z0 + 0.04], 'charcoal'),
      kit.box([0.06, SH.h - 0.04, 0.06], [SH.x - 0.05, 0.04 + (SH.h - 0.04) / 2, SH.z1 - 0.04], 'charcoal'),
      kit.box([0.06, SH.h - 0.04, 0.06], [BACK_X, 0.04 + (SH.h - 0.04) / 2, SH.z0 + 0.04], 'charcoal'),
      kit.box([0.06, SH.h - 0.04, 0.06], [BACK_X, 0.04 + (SH.h - 0.04) / 2, SH.z1 - 0.04], 'charcoal'),
      kit.box([0.04, 0.05, len], [BACK_X, 0.065, zc], 'charcoal'),
      ...glassWindow(kit, { at: [BACK_X + 0.02, 0.5, zc], facing: 'x+', w: len - 0.2, h: 0.6, panes: 3 }),
      ...glassWindow(kit, { at: [BACK_X - 0.02, 0.5, zc], facing: 'x-', w: len - 0.2, h: 0.6, panes: 3 }),
      // a side glass at the far end
      ...glassWindow(kit, { at: [0, 0.5, SH.z0 + 0.04], facing: 'z-', w: 0.55, h: 0.6, panes: 2 }),
      // bench
      kit.box([0.22, 0.04, len - 0.2], [-0.15, 0.3, zc], 'wood'),
      kit.box([0.05, 0.26, 0.05], [-0.1, 0.17, SH.z0 + 0.2], 'charcoal'),
      kit.box([0.05, 0.26, 0.05], [-0.1, 0.17, SH.z1 - 0.2], 'charcoal'),
      // the advert panel post, lightbox and glowing picture (front and back)
      kit.box([0.08, 1.0, 0.08], [AD.x, 0.54, AD.z], 'charcoal'),
      kit.box([0.12, 0.85, 0.56], [AD.x, 0.7, AD.z], 'charcoal'),
      kit.box([0.02, 0.07, 0.56], [AD.x + 0.06, 1.17, AD.z], 'blue'),
    ];
    for (const s of [1, -1]) {
      const x = AD.x + s * 0.07;
      parts.push(
        kit.box([0.02, 0.7, 0.46], [x, 0.7, AD.z], 'skyBlue', { glow: true }),
        kit.sphere(0.09, [x + s * 0.01, 0.84, AD.z - 0.1], 'sunYellow', { detail: 0, glow: true, scale: [0.3, 1, 1] }),
        kit.sphere(0.2, [x + s * 0.01, 0.48, AD.z + 0.08], 'lime', { detail: 0, glow: true, scale: [0.2, 0.55, 1.1] }),
        kit.sphere(0.13, [x + s * 0.01, 0.46, AD.z - 0.12], 'leaf', { detail: 0, glow: true, scale: [0.25, 0.7, 1] }),
        kit.sphere(0.07, [x + s * 0.01, 0.8, AD.z + 0.1], 'white', { detail: 0, glow: true, scale: [0.3, 0.6, 1.3] }),
      );
    }
    return kit.finish(parts);
  },
};

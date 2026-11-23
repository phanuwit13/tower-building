import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A Thai longtail boat (1×2, long side along z, bow at +z) on a patch of water: a long-shaft engine at the stern
// and colourful ribbons on the bow.
const WATER_H = 0.06;
const HULL = { w: 0.34, z0: -0.8, z1: 0.78, y: 0.17 };
const BOW_TILT = -0.55; // rotation about x that lifts the +z end
const RIBBONS: Array<[number, number]> = [[0, -0.4], [1, 0.0], [2, 0.4], [3, -0.2], [4, 0.2]]; // [colour index, sideways swing]
const RIBBON_COLORS = ['red', 'sunYellow', 'pink', 'mint', 'purple'] as const;

/** เรือหางยาว: a Thai longtail boat with a long-shaft engine and ribbons on the bow. */
export const item: ItemModel = {
  id: 'longtail-boat',
  name: 'เรือหางยาว',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const mid = (HULL.z0 + HULL.z1) / 2;
    const len = HULL.z1 - HULL.z0;
    const parts: Part[] = [
      kit.box([0.96, WATER_H, 1.96], [0, WATER_H / 2, 0], 'navy', { motion: { kind: 'water', water: 'pond' } }),
      // hull: keel, blue belly, red side bands and a yellow top rail
      kit.box([0.18, 0.08, len - 0.1], [0, 0.1, mid], 'blue'),
      kit.box([HULL.w - 0.04, 0.1, len], [0, HULL.y - 0.01, mid], 'red'),
      kit.box([HULL.w, 0.04, len + 0.02], [0, HULL.y + 0.065, mid], 'sunYellow'),
      // bow and stern swept up
      kit.box([HULL.w - 0.04, 0.1, 0.34], [0, 0.27, 0.78], 'red', { rotate: [BOW_TILT, 0, 0] }),
      kit.box([HULL.w, 0.04, 0.35], [0, 0.325, 0.795], 'sunYellow', { rotate: [BOW_TILT, 0, 0] }),
      kit.box([HULL.w - 0.06, 0.08, 0.2], [0, 0.23, -0.86], 'red', { rotate: [-BOW_TILT * 0.5, 0, 0] }),
      // thwart seats and a small blue canopy on four posts
      kit.box([HULL.w - 0.04, 0.03, 0.12], [0, 0.26, 0.3], 'wood'),
      kit.box([HULL.w - 0.04, 0.03, 0.12], [0, 0.26, -0.2], 'wood'),
    ];
    for (const sx of [-1, 1]) for (const z of [-0.05, 0.5]) parts.push(kit.box([0.03, 0.4, 0.03], [sx * 0.14, 0.45, z], 'woodDark'));
    parts.push(kit.box([0.4, 0.04, 0.68], [0, 0.67, 0.225], 'blue'));
    parts.push(kit.box([0.42, 0.02, 0.7], [0, 0.69, 0.225], 'white'));
    // engine at the stern: block, fuel tank, handle and the long shaft with a propeller
    parts.push(kit.box([0.2, 0.14, 0.18], [0, 0.34, -0.6], 'charcoal'));
    parts.push(kit.cylinder(0.07, 0.07, 0.12, [0, 0.47, -0.6], 'red', { segments: 8 }));
    parts.push(kit.cylinder(0.04, 0.04, 0.1, [0.12, 0.34, -0.6], 'orange', { segments: 8, rotate: [0, 0, Math.PI / 2] }));
    parts.push(rod(kit, [0, 0.36, -0.62], [0, 0.62, -0.8], 0.015, 'stoneDark', { segments: 4 }));
    parts.push(rod(kit, [0, 0.3, -0.64], [0, 0.1, -0.97], 0.022, 'chrome', { segments: 6 }));
    parts.push(kit.box([0.01 + 0.015, 0.14, 0.03], [0, 0.09, -0.97], 'stoneDark'));
    parts.push(kit.box([0.14, 0.03, 0.02], [0, 0.09, -0.97], 'stoneDark'));
    // ribbons tied to the bow post
    parts.push(kit.cylinder(0.02, 0.02, 0.3, [0, 0.45, 0.88], 'woodDark', { segments: 6 }));
    for (const [ci, swing] of RIBBONS) {
      const x = swing * 0.5;
      parts.push(kit.box([0.04, 0.22, 0.015], [x, 0.58 - Math.abs(swing) * 0.08, 0.9], RIBBON_COLORS[ci], { rotate: [0, 0, -swing * 0.6] }));
    }
    parts.push(kit.sphere(0.035, [0, 0.62, 0.88], 'sunYellow', { detail: 0 }));
    return kit.finish(parts);
  },
};

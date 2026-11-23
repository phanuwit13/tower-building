import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// 1x2 (x 1, z 2). A wooden shelf, open towards +x, two tiers of little bonsai in pots. Still.
const LEN = 1.8;
const TIERS = [0.3, 0.64]; // shelf board tops
const SLOTS = [-0.65, -0.22, 0.22, 0.65]; // bonsai positions along z
const POTS: PaletteColor[] = ['terracotta', 'teal', 'blue', 'white', 'purple', 'terracotta', 'orange', 'teal'];

/** ชั้นบอนไซ: a wooden shelf of little bonsai trees in pots. */
export const item: ItemModel = {
  id: 'bonsai-shelf',
  name: 'ชั้นบอนไซ',
  category: 'nature',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    // frame: two end panels, a back and the boards
    for (const z of [-LEN / 2, LEN / 2]) parts.push(kit.box([0.4, 1.05, 0.07], [0, 0.525, z], 'woodDark'));
    parts.push(kit.box([0.05, 1.05, LEN], [-0.17, 0.525, 0], 'wood'));
    for (const y of TIERS) parts.push(kit.box([0.4, 0.05, LEN], [0, y - 0.025, 0], 'wood'));
    parts.push(kit.box([0.46, 0.05, LEN + 0.1], [0, 1.075, 0], 'woodDark'));
    TIERS.forEach((top, t) => {
      SLOTS.forEach((z, s) => {
        const k = t * 4 + s;
        const x = 0.04;
        parts.push(
          kit.cylinder(0.085, 0.065, 0.08, [x, top + 0.04, z], POTS[k], { segments: 8 }),
          kit.cylinder(0.075, 0.075, 0.015, [x, top + 0.085, z], 'bark', { segments: 8 }),
          kit.cylinder(0.014, 0.022, 0.18, [x, top + 0.17, z], 'woodDark', { segments: 5 }),
        );
        const fy = top + 0.3;
        if (k % 3 === 0) {
          // a pine: stacked cones
          parts.push(
            kit.cone(0.13, 0.12, [x, fy - 0.05, z], 'leafDark', { segments: 6 }),
            kit.cone(0.09, 0.12, [x, fy + 0.06, z], 'leaf', { segments: 6 }),
          );
        } else if (k % 3 === 1) {
          // a round tree
          parts.push(
            kit.sphere(0.12, [x, fy, z], 'leaf', { detail: 0, scale: [1.1, 0.8, 1.1] }),
            kit.sphere(0.08, [x + 0.06, fy + 0.07, z + 0.03], 'lime', { detail: 0 }),
          );
        } else {
          // a flowering tree
          parts.push(
            kit.sphere(0.12, [x, fy, z], 'pink', { detail: 0, scale: [1.1, 0.8, 1.1] }),
            kit.sphere(0.07, [x - 0.05, fy + 0.07, z - 0.03], 'white', { detail: 0 }),
          );
        }
      });
    });
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// 1x2 (x 1, z 2). A wooden shelf, open towards +x, two tiers with two big bonsai each. Still.
const LEN = 1.7;
const HEIGHT = 1.3;
const TIERS = [0.28, 0.78]; // shelf board tops
const SLOTS = [-0.4, 0.4]; // bonsai positions along z
const POTS: PaletteColor[] = ['terracotta', 'blue', 'orange', 'teal'];
const CLOUDS: PaletteColor[] = ['leaf', 'leafDark', 'leaf', 'pink'];

/** ชั้นบอนไซ: a wooden shelf of little bonsai trees in pots. */
export const item: ItemModel = {
  id: 'bonsai-shelf',
  name: 'ชั้นบอนไซ',
  category: 'nature',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const z of [-LEN / 2, LEN / 2]) parts.push(kit.box([0.4, HEIGHT, 0.07], [0, HEIGHT / 2, z], 'woodDark'));
    parts.push(kit.box([0.05, HEIGHT, LEN], [-0.17, HEIGHT / 2, 0], 'wood'));
    for (const y of TIERS) parts.push(kit.box([0.4, 0.05, LEN], [0, y - 0.025, 0], 'wood'));
    parts.push(kit.box([0.46, 0.05, LEN + 0.1], [0, HEIGHT + 0.025, 0], 'woodDark'));
    TIERS.forEach((top, t) => {
      SLOTS.forEach((z, s) => {
        const k = t * 2 + s;
        const x = 0.04;
        parts.push(
          kit.cylinder(0.13, 0.1, 0.12, [x, top + 0.06, z], POTS[k], { segments: 8 }),
          kit.cylinder(0.115, 0.115, 0.015, [x, top + 0.125, z], 'bark', { segments: 8 }),
          kit.cylinder(0.025, 0.04, 0.22, [x, top + 0.23, z], 'woodDark', { segments: 5 }),
        );
        // a cloud-shaped top: three overlapping puffs
        const fy = top + 0.4;
        const c = CLOUDS[k];
        parts.push(
          kit.sphere(0.2, [x, fy, z], c, { detail: 1, scale: [1.05, 0.8, 1.2] }),
          kit.sphere(0.14, [x + 0.07, fy + 0.1, z + 0.12], k % 2 ? 'lime' : 'leaf', { detail: 0 }),
          kit.sphere(0.13, [x - 0.04, fy + 0.1, z - 0.13], c === 'pink' ? 'white' : 'lime', { detail: 0 }),
        );
      });
    });
    return kit.finish(parts);
  },
};

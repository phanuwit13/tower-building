import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A woven bamboo fence (1×2) along z with a flowering vine climbing the +x face. Still.
const HALF = 0.92;
const SLATS = 15;
const SLAT_R = 0.042;
const VINE_X = 0.09;
const BLOOMS: PaletteColor[] = ['pink', 'purple', 'sunYellow', 'pink', 'purple'];

/** รั้วไม้ไผ่: a woven bamboo fence with a climbing flower vine. */
export const item: ItemModel = {
  id: 'bamboo-fence',
  name: 'รั้วไม้ไผ่',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (let i = 0; i < SLATS; i++) {
      const z = -HALF + 0.1 + (i / (SLATS - 1)) * (2 * HALF - 0.2);
      const h = i % 2 === 0 ? 0.78 : 0.7;
      parts.push(
        kit.cylinder(SLAT_R * 0.8, SLAT_R, h, [0, h / 2, z], i % 3 === 1 ? 'wood' : 'sand', { segments: 6 }),
      );
      if (i % 3 === 0) parts.push(kit.cylinder(SLAT_R * 1.15, SLAT_R * 1.15, 0.03, [0, h * 0.5, z], 'woodDark', { segments: 6 }));
    }
    // Two woven rails, one in front of the slats and one behind.
    for (const [y, x, color] of [[0.22, 0.05, 'woodDark'], [0.5, -0.05, 'wood'], [0.5, 0.05, 'woodDark'], [0.22, -0.05, 'wood']] as Array<[number, number, PaletteColor]>) {
      parts.push(kit.box([0.04, 0.05, 2 * HALF], [x, y, 0], color));
    }
    for (const z of [-HALF, HALF]) {
      parts.push(
        kit.cylinder(0.065, 0.075, 0.98, [0, 0.49, z], 'woodDark', { segments: 6 }),
        kit.sphere(0.07, [0, 1.0, z], 'sunYellow', { detail: 0 }),
      );
    }
    // The vine: a thread of leaves wandering up and down the front, with flowers among them.
    for (let i = 0; i < 13; i++) {
      const z = -0.78 + i * 0.13;
      const y = 0.48 + 0.2 * Math.sin(i * 0.9) + (i % 2) * 0.1;
      parts.push(kit.sphere(0.055, [VINE_X, y, z], i % 3 === 0 ? 'leafDark' : 'leaf', { detail: 0, scale: [0.8, 1, 1.2] }));
    }
    for (let i = 0; i < 10; i++) {
      const z = -0.76 + i * 0.17;
      const y = 0.44 + 0.22 * Math.sin(i * 1.3 + 0.8) + (i % 2) * 0.12;
      parts.push(kit.sphere(0.05, [VINE_X + 0.04, y + 0.04, z], BLOOMS[i % BLOOMS.length], { detail: 0 }));
    }
    return kit.finish(parts);
  },
};

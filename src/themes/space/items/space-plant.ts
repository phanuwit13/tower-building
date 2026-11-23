import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { ICO_LOW, rod } from '../../../models/parts';

// An alien plant (1×1): a stone-ringed mound, curly stalks with glowing bulb flowers that breathe, and spiky leaves.
const MOUND_Y = 0.1;

/** ต้นไม้อวกาศ: an alien plant with glowing bulb flowers. */
export const item: ItemModel = {
  id: 'space-plant',
  name: 'ต้นไม้อวกาศ',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.4, 0.44, MOUND_Y, [0, MOUND_Y / 2, 0], 'stoneDark', { segments: 10 }),
      kit.cylinder(0.34, 0.36, 0.03, [0, MOUND_Y + 0.015, 0], 'bark', { segments: 10 }),
      // spiky leaves round the base
      kit.cone(0.08, 0.34, [0.22, MOUND_Y + 0.17, 0.1], 'teal', { segments: 6 }),
      kit.cone(0.08, 0.3, [-0.2, MOUND_Y + 0.15, 0.14], 'leafDark', { segments: 6 }),
      kit.cone(0.07, 0.28, [0.08, MOUND_Y + 0.14, -0.24], 'purple', { segments: 6 }),
      kit.cone(0.07, 0.26, [-0.12, MOUND_Y + 0.13, -0.2], 'teal', { segments: 6 }),
    ];
    // stalks: [tip x, tip y, tip z, bulb radius, colour]
    const stalks: Array<[number, number, number, number, 'purple' | 'sunYellow' | 'skyBlue']> = [
      [0.12, 0.85, 0.02, 0.11, 'purple'],
      [-0.2, 0.62, 0.12, 0.09, 'sunYellow'],
      [0.05, 0.55, -0.2, 0.09, 'skyBlue'],
    ];
    for (const [x, y, z, r, c] of stalks) {
      const base: Vec3 = [x * 0.15, MOUND_Y, z * 0.15];
      parts.push(rod(kit, base, [x, y, z], 0.03, 'leaf', { segments: 5 }));
      parts.push(kit.sphere(r, [x, y + r * ICO_LOW * 0.4, z], c, { detail: 0, glow: true, light: 'breathe' }));
      // a little leaf cap under each bulb
      parts.push(kit.cone(r * 0.9, r * 0.6, [x, y - r * 0.5, z], 'leafDark', { segments: 6 }));
    }
    return kit.finish(parts);
  },
};

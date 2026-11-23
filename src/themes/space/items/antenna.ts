import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A thin antenna mast with cross bars and four guy wires (1x1). Still.
const BASE = { w: 0.8, h: 0.05 };
const TOP = 1.7;
/** Cross bars: height, half-length, axis ('x' or 'z'), colour. Shorter towards the top. */
const BARS: { y: number; half: number; axis: 'x' | 'z'; color: 'red' | 'white' | 'orange' }[] = [
  { y: 0.8, half: 0.3, axis: 'x', color: 'red' },
  { y: 1.05, half: 0.26, axis: 'z', color: 'white' },
  { y: 1.3, half: 0.22, axis: 'x', color: 'orange' },
  { y: 1.5, half: 0.16, axis: 'z', color: 'red' },
];

/** เสาอากาศ: a thin antenna mast with cross bars. */
export const item: ItemModel = {
  id: 'antenna',
  name: 'เสาอากาศ',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.w], [0, BASE.h / 2, 0], 'stone'),
      kit.cylinder(0.1, 0.14, 0.14, [0, BASE.h + 0.07, 0], 'teal', { segments: 8 }),
      kit.cylinder(0.035, 0.045, TOP - BASE.h, [0, (TOP + BASE.h) / 2, 0], 'white', { segments: 8 }),
      kit.cylinder(0.05, 0.05, 0.1, [0, 0.5, 0], 'red', { segments: 8 }),
      kit.sphere(0.06, [0, TOP + 0.04, 0], 'sunYellow', { detail: 0 }),
    ];
    for (const b of BARS) {
      const size: Vec3 = b.axis === 'x' ? [2 * b.half, 0.04, 0.04] : [0.04, 0.04, 2 * b.half];
      parts.push(kit.box(size, [0, b.y, 0], b.color));
      for (const s of [-1, 1]) {
        parts.push(kit.sphere(0.035, b.axis === 'x' ? [s * b.half, b.y, 0] : [0, b.y, s * b.half], 'sunYellow', { detail: 0 }));
      }
    }
    // guy wires from the mast to little stakes in the corners
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const stake: Vec3 = [sx * 0.34, BASE.h, sz * 0.34];
        parts.push(rod(kit, [sx * 0.03, 1.15, sz * 0.03], [stake[0], stake[1] + 0.03, stake[2]], 0.01, 'stoneDark', { segments: 4 }));
        parts.push(kit.box([0.07, 0.07, 0.07], [stake[0], BASE.h + 0.035, stake[2]], 'orange'));
      }
    }
    return kit.finish(parts);
  },
};

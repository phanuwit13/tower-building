import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A small round table (top 0.5) with a pink cloth and a glass vase of bright flowers.
const TOP = 0.5;

/** โต๊ะแจกันดอกไม้: a small round table with a vase of flowers. */
export const item: ItemModel = {
  id: 'flower-vase-table',
  name: 'โต๊ะแจกันดอกไม้',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.22, 0.24, 0.03, [0, 0.015, 0], 'woodDark', { segments: 12 }),
      kit.cylinder(0.06, 0.07, TOP - 0.07, [0, 0.03 + (TOP - 0.07) / 2 - 0.015, 0], 'wood', { segments: 8 }),
      kit.cylinder(0.4, 0.4, 0.04, [0, TOP - 0.03, 0], 'wood', { segments: 16 }),
      kit.cylinder(0.38, 0.38, 0.015, [0, TOP - 0.003, 0], 'pink', { segments: 16 }),
      kit.cylinder(0.3, 0.3, 0.012, [0, TOP + 0.0045, 0], 'white', { segments: 16 }), // doily
      kit.cylinder(0.075, 0.09, 0.2, [0, TOP + 0.1, 0], 'glassBlue', { segments: 10 }),
      kit.cylinder(0.065, 0.065, 0.1, [0, TOP + 0.06, 0], 'skyBlue', { segments: 10 }), // water
    ];
    // stems and blooms
    const blooms: Array<[number, number, number, 'red' | 'sunYellow' | 'pink' | 'purple' | 'orange']> = [
      [0, 0.42, 0, 'sunYellow'],
      [0.08, 0.36, 0.06, 'red'],
      [-0.08, 0.36, 0.06, 'pink'],
      [0.06, 0.34, -0.09, 'purple'],
      [-0.08, 0.33, -0.06, 'orange'],
    ];
    for (const [x, h, z, c] of blooms) {
      const y0 = TOP + 0.12;
      const len = TOP + h - y0;
      parts.push(
        kit.cylinder(0.008, 0.008, len, [x * 0.6, y0 + len / 2, z * 0.6], 'leaf', { segments: 4 }),
        kit.sphere(0.055, [x, TOP + h, z], c, { detail: 0 }),
        kit.sphere(0.02, [x, TOP + h + 0.04, z], 'sunYellow', { detail: 0 }),
      );
    }
    parts.push(
      kit.sphere(1, [0.1, TOP + 0.24, -0.02], 'leaf', { detail: 0, scale: [0.07, 0.025, 0.04] }),
      kit.sphere(1, [-0.1, TOP + 0.22, -0.02], 'leafDark', { detail: 0, scale: [0.07, 0.025, 0.04] }),
    );
    return kit.finish(parts);
  },
};

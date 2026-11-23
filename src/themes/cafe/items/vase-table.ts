import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const TOP_Y = 0.5;

/** โต๊ะดอกไม้: a small round table with a cloth and a glass vase of flowers. */
export const item: ItemModel = {
  id: 'vase-table',
  name: 'โต๊ะดอกไม้',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.22, 0.26, 0.04, [0, 0.02, 0], 'woodDark', { segments: 10 }),
      kit.cylinder(0.05, 0.06, TOP_Y - 0.08, [0, 0.04 + (TOP_Y - 0.08) / 2, 0], 'wood', { segments: 8 }),
      kit.cylinder(0.4, 0.4, 0.04, [0, TOP_Y - 0.02, 0], 'wood', { segments: 14 }),
      kit.cylinder(0.34, 0.34, 0.02, [0, TOP_Y + 0.01, 0], 'pink', { segments: 14 }), // cloth
      kit.cylinder(0.2, 0.2, 0.025, [0, TOP_Y + 0.0225, 0], 'cream', { segments: 12 }),
      // glass vase with flower stems and blossoms
      kit.cylinder(0.07, 0.05, 0.2, [0, TOP_Y + 0.135, 0], 'glassBlue', { segments: 8 }),
    ];
    const blooms: [number, number, number, 'red' | 'sunYellow' | 'pink' | 'purple' | 'white'][] = [
      [0, 0.38, 0, 'red'], [0.1, 0.34, 0.04, 'sunYellow'], [-0.09, 0.35, 0.05, 'purple'], [0.03, 0.34, -0.1, 'pink'], [-0.06, 0.33, -0.06, 'white'],
    ];
    for (const [x, h, z, col] of blooms) {
      parts.push(
        kit.cylinder(0.012, 0.012, h - 0.1, [x * 0.5, TOP_Y + 0.1 + (h - 0.1) / 2, z * 0.5], 'leaf', { segments: 4 }),
        kit.sphere(0.06, [x, TOP_Y + h, z], col, { detail: 0 }),
      );
    }
    parts.push(kit.sphere(0.08, [0, TOP_Y + 0.27, 0], 'leaf', { detail: 0 }));
    return kit.finish(parts);
  },
};

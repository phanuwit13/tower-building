import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A small bistro table with two chairs and a glowing table lamp.
const TOP_Y = 0.42;

/** โต๊ะริมทาง: a small bistro table with two chairs and a glowing table lamp. */
export const item: ItemModel = {
  id: 'sidewalk-table',
  name: 'โต๊ะริมทาง',
  category: 'seating',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.16, 0.18, 0.04, [0, 0.02, 0], 'charcoal', { segments: 8 }),
      kit.cylinder(0.035, 0.035, TOP_Y - 0.04, [0, TOP_Y / 2 + 0.02, 0], 'charcoal', { segments: 6 }),
      kit.cylinder(0.25, 0.25, 0.04, [0, TOP_Y + 0.02, 0], 'sunYellow', { segments: 10 }),
      kit.cylinder(0.25, 0.25, 0.02, [0, TOP_Y - 0.01, 0], 'brass', { segments: 10 }),
      // table lamp: a small base, a glowing globe and a tiny flower vase beside it
      kit.cylinder(0.045, 0.055, 0.05, [0, TOP_Y + 0.065, 0], 'brass', { segments: 8 }),
      kit.sphere(0.085, [0, TOP_Y + 0.15, 0], 'lampWarm', { glow: true, light: 'breathe' }),
      kit.cylinder(0.03, 0.025, 0.07, [0.14, TOP_Y + 0.075, 0.08], 'glassBlue', { segments: 6 }),
      kit.sphere(0.035, [0.14, TOP_Y + 0.14, 0.08], 'pink', { detail: 0 }),
    ];
    for (const s of [-1, 1]) {
      const z = s * 0.34;
      const c = s > 0 ? 'red' : 'teal';
      parts.push(
        kit.cylinder(0.025, 0.025, 0.26, [0, 0.13, z], 'charcoal', { segments: 6 }),
        kit.cylinder(0.11, 0.11, 0.035, [0, 0.27, z], c, { segments: 8 }),
        kit.box([0.17, 0.12, 0.03], [0, 0.36, z + s * 0.09], c),
      );
    }
    return kit.finish(parts);
  },
};

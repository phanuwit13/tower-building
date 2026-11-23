import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const POLE_TOP = 1.2;

/** โคมไฟตั้งพื้น: a tall lamp with a round base, a thin pole and a glowing fabric shade. */
export const item: ItemModel = {
  id: 'floor-lamp',
  name: 'โคมไฟตั้งพื้น',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.3, 0.32, 0.04, [0, 0.02, 0], 'charcoal', { segments: 12 }),
      kit.cylinder(0.22, 0.24, 0.04, [0, 0.06, 0], 'brass', { segments: 12 }),
      kit.cylinder(0.04, 0.05, 0.1, [0, 0.13, 0], 'brass', { segments: 8 }),
      kit.cylinder(0.025, 0.025, POLE_TOP - 0.15, [0, 0.15 + (POLE_TOP - 0.15) / 2, 0], 'charcoal', { segments: 6 }),
      // fabric shade: glowing drum between two coloured rims
      kit.cylinder(0.2, 0.3, 0.34, [0, POLE_TOP + 0.12, 0], 'lampWarm', { segments: 12, glow: true, light: 'breathe' }),
      kit.cylinder(0.21, 0.21, 0.03, [0, POLE_TOP + 0.295, 0], 'pink', { segments: 12 }),
      kit.cylinder(0.31, 0.31, 0.03, [0, POLE_TOP - 0.045, 0], 'pink', { segments: 12 }),
      kit.sphere(0.04, [0, POLE_TOP + 0.34, 0], 'brass', { detail: 0 }),
    ];
    return kit.finish(parts);
  },
};

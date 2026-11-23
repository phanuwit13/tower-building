import type { ItemModel } from '../../../models/contract';

/** เสาไฟ: a park lamp post with a round glowing globe (lights up at dusk and night). */
export const item: ItemModel = {
  id: 'street-lamp',
  name: 'เสาไฟ',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => kit.finish([
    kit.cylinder(0.15, 0.19, 0.1, [0, 0.05, 0], 'charcoal', { segments: 8 }),
    kit.cylinder(0.08, 0.12, 0.14, [0, 0.17, 0], 'navy', { segments: 8 }),
    kit.cylinder(0.045, 0.045, 1.04, [0, 0.76, 0], 'navy', { segments: 8 }),
    kit.cylinder(0.07, 0.07, 0.05, [0, 0.62, 0], 'navy', { segments: 8 }),
    kit.cylinder(0.12, 0.06, 0.08, [0, 1.3, 0], 'navy', { segments: 8 }),
    kit.sphere(0.16, [0, 1.46, 0], 'lampWarm', { glow: true, light: 'breathe' }),
    kit.cylinder(0.075, 0.1, 0.05, [0, 1.625, 0], 'navy', { segments: 8 }),
    kit.sphere(0.035, [0, 1.67, 0], 'navy', { detail: 0 }),
  ]),
};

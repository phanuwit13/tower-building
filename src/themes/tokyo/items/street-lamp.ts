import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A modern street lamp (1×1): a slim charcoal pole off to one side, a long arm over the road and a flat
// head with a warm glowing lens that breathes at night.
const POLE_X = -0.3;
const POLE_H = 2.0;

/** เสาไฟถนน: modern pole with an arm and a lamp head. */
export const item: ItemModel = {
  id: 'street-lamp',
  name: 'เสาไฟถนน',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const armY = POLE_H + 0.03;
    const parts: Part[] = [
      kit.cylinder(0.14, 0.16, 0.06, [POLE_X, 0.03, 0], 'stone', { segments: 8 }),
      kit.cylinder(0.07, 0.09, 0.2, [POLE_X, 0.16, 0], 'charcoal', { segments: 8 }),
      kit.cylinder(0.035, 0.05, POLE_H - 0.06, [POLE_X, (POLE_H + 0.26) / 2, 0], 'charcoal', { segments: 8 }),
      // arm reaching out over the road, with a small brace
      kit.box([0.62, 0.05, 0.05], [POLE_X + 0.29, armY, 0], 'charcoal'),
      kit.box([0.3, 0.035, 0.035], [POLE_X + 0.1, POLE_H - 0.15, 0], 'charcoal', { rotate: [0, 0, Math.PI / 4] }),
      // the head: a flat housing, a glowing lens underneath and a bulb dome on top
      kit.box([0.34, 0.07, 0.2], [0.2, armY + 0.035, 0], 'stoneDark'),
      kit.box([0.28, 0.03, 0.15], [0.2, armY - 0.025, 0], 'lampWarm', { glow: true, light: 'breathe' }),
      kit.sphere(0.06, [POLE_X, POLE_H + 0.06, 0], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }),
    ];
    return kit.finish(parts);
  },
};

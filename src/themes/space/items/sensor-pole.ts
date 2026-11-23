import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A tall pole with sensor boxes, a small solar panel and a blinking red light on top (1x1).
const BASE = { w: 0.7, h: 0.05 };
const TOP = 1.6;

/** เสาเซ็นเซอร์: a tall pole with sensor boxes and a blinking light. */
export const item: ItemModel = {
  id: 'sensor-pole',
  name: 'เสาเซ็นเซอร์',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.w], [0, BASE.h / 2, 0], 'stone'),
      kit.cylinder(0.1, 0.13, 0.15, [0, BASE.h + 0.075, 0], 'blue', { segments: 8 }),
      kit.cylinder(0.065, 0.075, TOP - BASE.h, [0, (TOP + BASE.h) / 2, 0], 'white', { segments: 8 }),
      kit.cylinder(0.09, 0.09, 0.08, [0, 0.6, 0], 'red', { segments: 8 }),
      // sensor boxes on arms
      kit.box([0.16, 0.14, 0.14], [0.13, 1.0, 0.04], 'orange'),
      kit.box([0.02, 0.07, 0.09], [0.22, 1.0, 0.04], 'skyBlue'),
      kit.box([0.14, 0.13, 0.15], [-0.13, 1.22, -0.02], 'teal'),
      kit.cylinder(0.05, 0.05, 0.04, [-0.13, 1.22, 0.1], 'charcoal', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
      kit.box([0.12, 0.12, 0.12], [0.12, 0.4, -0.04], 'sunYellow'),
      // small solar panel, tilted towards +x
      kit.box([0.2, 0.03, 0.24], [0.14, 1.45, 0], 'navy', { rotate: [0, 0, -0.45] }),
      kit.box([0.17, 0.035, 0.21], [0.14, 1.455, 0], 'blue', { rotate: [0, 0, -0.45] }),
      // top: cap and the beacon
      kit.cylinder(0.07, 0.05, 0.05, [0, TOP + 0.025, 0], 'charcoal', { segments: 8 }),
      kit.sphere(0.075, [0, TOP + 0.1, 0], 'red', { detail: 0, glow: true, light: 'blink' }),
    ];
    return kit.finish(parts);
  },
};

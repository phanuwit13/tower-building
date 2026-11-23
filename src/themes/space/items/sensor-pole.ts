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
      kit.cylinder(0.04, 0.04, TOP - BASE.h, [0, (TOP + BASE.h) / 2, 0], 'white', { segments: 8 }),
      kit.cylinder(0.05, 0.05, 0.08, [0, 0.6, 0], 'red', { segments: 8 }),
      // sensor boxes on arms
      kit.box([0.26, 0.2, 0.2], [0.17, 1.0, 0.04], 'orange'),
      kit.box([0.02, 0.1, 0.12], [0.31, 1.0, 0.04], 'skyBlue'),
      kit.box([0.2, 0.18, 0.22], [-0.15, 1.25, -0.02], 'teal'),
      kit.cylinder(0.05, 0.05, 0.04, [-0.15, 1.25, 0.12], 'charcoal', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
      kit.box([0.16, 0.16, 0.16], [0.12, 0.45, -0.04], 'sunYellow'),
      // small solar panel, tilted towards +x
      kit.box([0.34, 0.03, 0.4], [0.2, 1.46, 0], 'navy', { rotate: [0, 0, -0.45] }),
      kit.box([0.3, 0.035, 0.36], [0.2, 1.465, 0], 'blue', { rotate: [0, 0, -0.45] }),
      // top: cap and the beacon
      kit.cylinder(0.07, 0.05, 0.05, [0, TOP + 0.025, 0], 'charcoal', { segments: 8 }),
      kit.sphere(0.075, [0, TOP + 0.1, 0], 'red', { detail: 0, glow: true, light: 'blink' }),
    ];
    return kit.finish(parts);
  },
};

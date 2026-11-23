import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A spider-legged lander (1x2): a gold eight-sided body, four angled legs with foot pads and a ladder on +x.
const BODY_Y = 0.55;
const FOOT = { x: 0.38, z: 0.75 };
const FOOT_H = 0.03;

export const item: ItemModel = {
  id: 'lunar-lander',
  name: 'ยานลงจอด',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      // body: gold drum, white top cap, teal window
      kit.cylinder(0.3, 0.3, 0.34, [0, BODY_Y, 0], 'brass', { segments: 8 }),
      kit.cylinder(0.31, 0.31, 0.05, [0, BODY_Y - 0.1, 0], 'sunYellow', { segments: 8 }),
      kit.cylinder(0.2, 0.3, 0.12, [0, BODY_Y + 0.23, 0], 'white', { segments: 8 }),
      kit.sphere(0.1, [0, BODY_Y + 0.35, 0], 'blue', { detail: 0 }),
      kit.cylinder(0.16, 0.2, 0.1, [0, BODY_Y - 0.22, 0], 'charcoal', { segments: 8 }),
      kit.cone(0.1, 0.14, [0, BODY_Y - 0.34, 0], 'stoneDark', { segments: 8, rotate: [Math.PI, 0, 0] }),
      kit.sphere(0.09, [0.3, BODY_Y + 0.04, 0], 'skyBlue', { glow: 'windowWarm', light: 'window', scale: [0.5, 1, 1] }),
      // dish antenna on a mast
      kit.cylinder(0.015, 0.015, 0.2, [-0.12, BODY_Y + 0.4, -0.1], 'chrome', { segments: 6 }),
      kit.dome(0.1, [-0.12, BODY_Y + 0.5, -0.1], 'white', { scale: [1, 0.5, 1], segments: 8 }),
    ];
    // four legs: a strut from the body down to each foot pad, with a second brace
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const fx = sx * FOOT.x;
        const fz = sz * FOOT.z;
        parts.push(
          rod(kit, [sx * 0.2, BODY_Y - 0.12, sz * 0.2], [fx, FOOT_H, fz], 0.03, 'white', { segments: 6 }),
          rod(kit, [sx * 0.26, BODY_Y + 0.02, sz * 0.26], [fx * 0.62 + sx * 0.0, 0.3, fz * 0.62], 0.016, 'stoneDark', { segments: 4 }),
          kit.cylinder(0.1, 0.1, FOOT_H, [fx, FOOT_H / 2, fz], 'orange', { segments: 8 }),
        );
      }
    }
    // ladder from the +x side of the body down to the ground
    parts.push(
      kit.box([0.025, 0.55, 0.025], [0.36, 0.3, -0.07], 'chrome'),
      kit.box([0.025, 0.55, 0.025], [0.36, 0.3, 0.07], 'chrome'),
    );
    for (let i = 0; i < 5; i++) {
      parts.push(kit.box([0.025, 0.025, 0.16], [0.36, 0.1 + i * 0.1, 0], 'chrome'));
    }
    parts.push(kit.box([0.12, 0.03, 0.2], [0.33, 0.56, 0], 'white'));
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A horizontal traffic light (1×1): a pole at the back corner, an arm over the road and a three-lamp head
// facing +x. Red and amber are dark; the green lamp blinks.
const POLE = { z: -0.38, h: 1.7 };
const HEAD = { y: 1.55, z: 0.08, d: 0.18, h: 0.24, w: 0.66 }; // d: depth along x
const LAMP_DZ = [-0.22, 0, 0.22];
const LAMPS = ['red', 'sunYellow', 'leaf'] as const;

/** สัญญาณไฟจราจร: horizontal signal on a pole. */
export const item: ItemModel = {
  id: 'traffic-light',
  name: 'สัญญาณไฟจราจร',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const front = HEAD.d / 2;
    const parts: Part[] = [
      kit.cylinder(0.09, 0.1, 0.06, [0, 0.03, POLE.z], 'stone', { segments: 8 }),
      kit.cylinder(0.04, 0.055, POLE.h - 0.06, [0, 0.06 + (POLE.h - 0.06) / 2, POLE.z], 'charcoal', { segments: 8 }),
      kit.cylinder(0.06, 0.06, 0.04, [0, 0.5, POLE.z], 'sunYellow', { segments: 8 }),
      // arm from the pole top across, and a short hanger down to the head
      kit.box([0.05, 0.05, 0.56], [0, POLE.h - 0.02, POLE.z + 0.28], 'charcoal'),
      kit.box([0.05, POLE.h - 0.02 - HEAD.y - HEAD.h / 2, 0.05], [0, (POLE.h - 0.02 + HEAD.y + HEAD.h / 2) / 2, HEAD.z], 'charcoal'),
      // head: a dark housing and a pale backing plate
      kit.box([HEAD.d, HEAD.h, HEAD.w], [0, HEAD.y, HEAD.z], 'navy'),
      kit.box([0.03, HEAD.h + 0.08, HEAD.w + 0.08], [-front - 0.01, HEAD.y, HEAD.z], 'white'),
    ];
    LAMP_DZ.forEach((dz, i) => {
      const lit = i === 2;
      parts.push(
        kit.cylinder(0.075, 0.075, 0.035, [front, HEAD.y, HEAD.z + dz], LAMPS[i], {
          segments: 8, rotate: [0, 0, Math.PI / 2], ...(lit ? { glow: 'leaf' as const, light: 'blink' as const } : {}),
        }),
        kit.box([0.1, 0.025, 0.16], [front + 0.03, HEAD.y + 0.1, HEAD.z + dz], 'charcoal'),
      );
    });
    return kit.finish(parts);
  },
};

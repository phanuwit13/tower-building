import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Three teal battery cabinets on a plinth; each front carries five glowing green level bars (window light).
const CAB_Z = [-0.65, 0, 0.65];
const CAB = { w: 0.7, h: 0.62, d: 0.56, y0: 0.06 };
const BAR_H = [0.12, 0.18, 0.24, 0.3, 0.36];
const BAR_STEP = 0.08;

/** ชุดแบตเตอรี่: a row of battery cabinets with glowing level bars. */
export const item: ItemModel = {
  id: 'battery-bank',
  name: 'ชุดแบตเตอรี่',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const top = CAB.y0 + CAB.h;
    const parts: Part[] = [kit.box([0.84, CAB.y0, 1.94], [0, CAB.y0 / 2, 0], 'charcoal')];
    for (const z of CAB_Z) {
      parts.push(
        kit.box([CAB.w, CAB.h, CAB.d], [0, CAB.y0 + CAB.h / 2, z], 'teal'),
        kit.box([CAB.w + 0.04, 0.06, CAB.d + 0.02], [0, top + 0.03, z], 'white'),
        kit.box([CAB.w + 0.02, 0.05, CAB.d + 0.01], [0, 0.5, z], 'sunYellow'),
        kit.box([0.02, 0.44, 0.44], [CAB.w / 2 + 0.01, 0.34, z], 'charcoal'),
        kit.cylinder(0.04, 0.04, 0.06, [-0.12, top + 0.09, z - 0.15], 'chrome', { segments: 8 }),
        kit.cylinder(0.04, 0.04, 0.06, [-0.12, top + 0.09, z + 0.15], 'chrome', { segments: 8 }),
        kit.sphere(0.035, [-0.12, top + 0.15, z - 0.15], 'red', { detail: 0 }),
        kit.sphere(0.035, [-0.12, top + 0.15, z + 0.15], 'orange', { detail: 0 }),
      );
      BAR_H.forEach((h, i) => {
        parts.push(kit.box([0.02, h, 0.05], [CAB.w / 2 + 0.03, 0.15 + h / 2, z + (i - 2) * BAR_STEP], 'leaf', { glow: true, light: 'window' }));
      });
    }
    return kit.finish(parts);
  },
};

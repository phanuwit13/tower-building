import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A fuel pump post (1x1): red-and-white pump on a small base, a lit gauge on the +x face, a hose to a holster.
const BASE = { w: 0.7, d: 0.7, h: 0.05 };
const PUMP = { w: 0.34, d: 0.34, h: 0.7 };

export const item: ItemModel = {
  id: 'fuel-pump',
  name: 'ปั๊มเชื้อเพลิง',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const top = BASE.h + PUMP.h;
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'stoneDark'),
      kit.box([PUMP.w, PUMP.h, PUMP.d], [-0.05, BASE.h + PUMP.h / 2, 0], 'white'),
      kit.box([PUMP.w + 0.02, 0.16, PUMP.d + 0.02], [-0.05, BASE.h + 0.12, 0], 'red'),
      kit.box([PUMP.w + 0.06, 0.08, PUMP.d + 0.06], [-0.05, top + 0.04, 0], 'orange'),
      kit.sphere(0.07, [-0.05, top + 0.12, 0], 'sunYellow', { detail: 0 }),
      // lit gauge on the +x face (glows warm at night), with a blue frame
      kit.box([0.03, 0.26, 0.27], [-0.05 + PUMP.w / 2 + 0.015, BASE.h + 0.5, 0], 'blue'),
      kit.box([0.02, 0.2, 0.21], [-0.05 + PUMP.w / 2 + 0.035, BASE.h + 0.5, 0], 'skyBlue', { glow: 'windowWarm', light: 'window' }),
      kit.box([0.02, 0.025, 0.12], [-0.05 + PUMP.w / 2 + 0.05, BASE.h + 0.5, 0], 'navy'),
      // holster on the +z face and a coiled hose out to the nozzle
      kit.box([0.1, 0.16, 0.06], [-0.05, BASE.h + 0.42, PUMP.d / 2 + 0.03], 'charcoal'),
      kit.cylinder(0.025, 0.025, 0.22, [-0.05, BASE.h + 0.55, PUMP.d / 2 + 0.06], 'charcoal', { segments: 6, rotate: [0, 0, 0.0] }),
      kit.torus(0.14, 0.022, [-0.05 + 0.0, BASE.h + 0.26, PUMP.d / 2 + 0.02], 'charcoal', { rotate: [Math.PI / 2, 0, 0] }),
    ];
    return kit.finish(parts);
  },
};

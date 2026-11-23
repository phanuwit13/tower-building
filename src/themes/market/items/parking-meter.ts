import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A parking meter (1×1, face +x): a charcoal post, a teal head with a small glowing screen and a blinking light on top.
const POST_H = 0.75;
const HEAD = { w: 0.26, d: 0.34, h: 0.4 };
const HEAD_Y = 0.06 + POST_H + HEAD.h / 2 - 0.02;

/** มิเตอร์จอดรถ: a parking meter with a small blinking light. */
export const item: ItemModel = {
  id: 'parking-meter',
  name: 'มิเตอร์จอดรถ',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const f = HEAD.w / 2;
    const top = HEAD_Y + HEAD.h / 2;
    const parts: Part[] = [
      kit.cylinder(0.2, 0.22, 0.06, [0, 0.03, 0], 'stone', { segments: 8 }),
      kit.cylinder(0.04, 0.05, POST_H, [0, 0.06 + POST_H / 2, 0], 'charcoal', { segments: 8 }),
      kit.box([HEAD.w, HEAD.h, HEAD.d], [0, HEAD_Y, 0], 'teal'),
      kit.dome(0.17, [0, top, 0], 'teal', { segments: 8, scale: [0.8, 0.5, 1] }),
      kit.box([0.02, 0.22, 0.26], [f + 0.01, HEAD_Y + 0.05, 0], 'charcoal'),
      // little screen (glowing), a coin slot and a pay button
      kit.box([0.02, 0.1, 0.18], [f + 0.02, HEAD_Y + 0.08, 0], 'skyBlue', { glow: 'windowWarm', light: 'window' }),
      kit.box([0.025, 0.1, 0.03], [f + 0.02, HEAD_Y - 0.04, -0.05], 'stoneDark'),
      kit.cylinder(0.025, 0.025, 0.03, [f + 0.02, HEAD_Y - 0.04, 0.06], 'sunYellow', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.box([0.025, 0.04, 0.2], [f + 0.015, HEAD_Y - 0.15, 0], 'white'),
      // the small blinking light on top
      kit.sphere(0.045, [0, top + 0.1, 0], 'orange', { detail: 0, glow: true, light: 'blink' }),
    ];
    return kit.finish(parts);
  },
};

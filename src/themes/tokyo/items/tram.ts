import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { glassWindow, rod } from '../../../models/parts';

// A small retro tram, cream over green, with a green roof and a pantograph, on rails; runs along z.
const BODY = { w: 0.52, h: 0.44, len: 1.7, y: 0.36 };
const HALF_W = BODY.w / 2;
const HALF_L = BODY.len / 2;
const ROOF_Y = BODY.y + BODY.h / 2;

/** รถราง: a small retro tram in cream and green on rails. */
export const item: ItemModel = {
  id: 'tram',
  name: 'รถราง',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.03, 0.04, 1.96], [-0.17, 0.05, 0], 'chrome'),
      kit.box([0.03, 0.04, 1.96], [0.17, 0.05, 0], 'chrome'),
      ...[-0.8, -0.4, 0, 0.4, 0.8].map((z) => kit.box([0.5, 0.03, 0.08], [0, 0.015, z], 'stoneDark')),
      kit.box([BODY.w, BODY.h, BODY.len], [0, BODY.y, 0], 'cream'),
      kit.box([BODY.w + 0.02, 0.14, BODY.len + 0.02], [0, 0.25, 0], 'leaf'),
      kit.box([BODY.w + 0.06, 0.05, BODY.len + 0.08], [0, ROOF_Y + 0.025, 0], 'leafDark'),
      kit.box([BODY.w - 0.1, 0.05, BODY.len - 0.2], [0, ROOF_Y + 0.07, 0], 'leaf'),
      kit.box([0.3, 0.07, 0.3], [0, 0.11, -0.55], 'charcoal'),
      kit.box([0.3, 0.07, 0.3], [0, 0.11, 0.55], 'charcoal'),
      // bumpers and head lamps
      kit.box([0.4, 0.05, 0.05], [0, 0.17, HALF_L + 0.03], 'charcoal'),
      kit.box([0.4, 0.05, 0.05], [0, 0.17, -HALF_L - 0.03], 'charcoal'),
      kit.sphere(0.045, [0, 0.45, HALF_L + 0.03], 'lampWarm', { detail: 0, glow: true }),
      ...glassWindow(kit, { at: [0, 0.42, HALF_L], facing: 'z+', w: 0.34, h: 0.18, panes: 2 }),
      ...glassWindow(kit, { at: [0, 0.42, -HALF_L], facing: 'z-', w: 0.34, h: 0.18, panes: 2 }),
      // pantograph on the roof
      rod(kit, [0, ROOF_Y + 0.09, -0.3], [-0.0, ROOF_Y + 0.3, -0.1], 0.015, 'chrome', { segments: 4 }),
      rod(kit, [0, ROOF_Y + 0.09, 0.1], [0, ROOF_Y + 0.3, -0.1], 0.015, 'chrome', { segments: 4 }),
      kit.box([0.3, 0.025, 0.04], [0, ROOF_Y + 0.31, -0.1], 'charcoal'),
    ];
    for (const z of [-0.5, 0, 0.5]) {
      parts.push(...glassWindow(kit, { at: [HALF_W, 0.42, z], facing: 'x+', w: 0.28, h: 0.18, panes: 1, frame: 'leafDark' }));
      parts.push(...glassWindow(kit, { at: [-HALF_W, 0.42, z], facing: 'x-', w: 0.28, h: 0.18, panes: 1, frame: 'leafDark' }));
    }
    return kit.finish(parts);
  },
};

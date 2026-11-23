import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { glassWindow } from '../../../models/parts';

// A silver commuter car with an orange stripe on a short track, running along z so cars can line up.
const BODY = { w: 0.5, h: 0.42, len: 1.84, y: 0.36 };
const HALF_W = BODY.w / 2;
const HALF_L = BODY.len / 2;

/** รถไฟฟ้า: a silver commuter train car with a coloured stripe and lit windows. */
export const item: ItemModel = {
  id: 'commuter-train',
  name: 'รถไฟฟ้า',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      // track
      kit.box([0.03, 0.04, 1.96], [-0.17, 0.05, 0], 'chrome'),
      kit.box([0.03, 0.04, 1.96], [0.17, 0.05, 0], 'chrome'),
      ...[-0.8, -0.4, 0, 0.4, 0.8].map((z) => kit.box([0.5, 0.03, 0.08], [0, 0.015, z], 'stoneDark')),
      // body, stripe, roof and its air-conditioners
      kit.box([BODY.w, BODY.h, BODY.len], [0, BODY.y, 0], 'stone'),
      kit.box([BODY.w + 0.02, 0.06, BODY.len + 0.02], [0, 0.26, 0], 'orange'),
      kit.box([BODY.w - 0.08, 0.04, BODY.len - 0.1], [0, BODY.y + BODY.h / 2 + 0.02, 0], 'white'),
      kit.box([0.26, 0.06, 0.34], [0, BODY.y + BODY.h / 2 + 0.07, -0.5], 'chrome'),
      kit.box([0.26, 0.06, 0.34], [0, BODY.y + BODY.h / 2 + 0.07, 0.4], 'chrome'),
      // bogies under the floor
      kit.box([0.36, 0.08, 0.3], [0, 0.11, -0.6], 'charcoal'),
      kit.box([0.36, 0.08, 0.3], [0, 0.11, 0.6], 'charcoal'),
      // cab windscreen and lamps at +z
      ...glassWindow(kit, { at: [0, 0.42, HALF_L], facing: 'z+', w: 0.34, h: 0.16, panes: 2 }),
      kit.sphere(0.04, [-0.17, 0.22, HALF_L + 0.02], 'lampWarm', { detail: 0, glow: true }),
      kit.sphere(0.04, [0.17, 0.22, HALF_L + 0.02], 'lampWarm', { detail: 0, glow: true }),
      kit.sphere(0.035, [0, 0.62, HALF_L - 0.05], 'pink', { detail: 0, glow: true }),
    ];
    for (const z of [-0.7, -0.3, 0.1, 0.5]) {
      parts.push(...glassWindow(kit, { at: [HALF_W, 0.42, z], facing: 'x+', w: 0.26, h: 0.16, panes: 1 }));
      parts.push(...glassWindow(kit, { at: [-HALF_W, 0.42, z], facing: 'x-', w: 0.26, h: 0.16, panes: 1 }));
    }
    return kit.finish(parts);
  },
};

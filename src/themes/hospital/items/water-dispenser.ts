import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';

// A water cooler (1×1) facing +x: a mint cabinet with two taps, a drip tray, a big blue bottle on top
// and a cup holder on the side with a few small cups.
const BODY = { w: 0.46, h: 0.95 };

/** ตู้กดน้ำ: water cooler with a blue bottle and cups. */
export const item: ItemModel = {
  id: 'water-dispenser',
  name: 'ตู้กดน้ำ',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit: StyleKit) => {
    const fx = BODY.w / 2;
    const parts: Part[] = [
      kit.box([BODY.w + 0.06, 0.06, BODY.w + 0.06], [0, 0.03, 0], 'charcoal'),
      kit.box([BODY.w, BODY.h - 0.06, BODY.w], [0, 0.06 + (BODY.h - 0.06) / 2, 0], 'mint'),
      kit.box([BODY.w + 0.04, 0.05, BODY.w + 0.04], [0, BODY.h + 0.025, 0], 'teal'),
      // front: dark tap panel, a blue and a warm-orange tap, drip tray
      kit.box([0.02, 0.3, 0.34], [fx + 0.01, 0.66, 0], 'teal'),
      kit.box([0.1, 0.04, 0.05], [fx + 0.06, 0.7, -0.08], 'blue'),
      kit.box([0.1, 0.04, 0.05], [fx + 0.06, 0.7, 0.08], 'orange'),
      kit.box([0.03, 0.08, 0.05], [fx + 0.11, 0.66, -0.08], 'blue'),
      kit.box([0.03, 0.08, 0.05], [fx + 0.11, 0.66, 0.08], 'orange'),
      kit.box([0.14, 0.03, 0.34], [fx + 0.07, 0.45, 0], 'chrome'),
      kit.box([0.14, 0.015, 0.3], [fx + 0.07, 0.4675, 0], 'stoneDark'),
      // bottle: neck, shoulders, body, cap
      kit.cylinder(0.12, 0.2, 0.06, [0, BODY.h + 0.08, 0], 'skyBlue', { segments: 12 }),
      kit.cylinder(0.2, 0.2, 0.28, [0, BODY.h + 0.25, 0], 'skyBlue', { segments: 12 }),
      kit.cylinder(0.14, 0.2, 0.06, [0, BODY.h + 0.42, 0], 'skyBlue', { segments: 12 }),
      kit.cylinder(0.08, 0.1, 0.05, [0, BODY.h + 0.465, 0], 'blue', { segments: 10 }),
      kit.cylinder(0.17, 0.17, 0.1, [0, BODY.h + 0.15, 0], 'blue', { segments: 12 }),
    ];
    // cup holder on the +z side with a stack of cups
    parts.push(
      kit.box([0.14, 0.12, 0.04], [0, 0.55, BODY.w / 2 + 0.02], 'charcoal'),
      kit.cylinder(0.045, 0.035, 0.06, [0, 0.64, BODY.w / 2 + 0.07], 'white', { segments: 8 }),
      kit.cylinder(0.045, 0.035, 0.06, [0, 0.58, BODY.w / 2 + 0.07], 'sunYellow', { segments: 8 }),
      kit.cylinder(0.045, 0.035, 0.06, [0, 0.52, BODY.w / 2 + 0.07], 'pink', { segments: 8 }),
    );
    // cups on the drip tray top (cups are about 0.06 tall)
    parts.push(kit.cylinder(0.035, 0.03, 0.06, [fx + 0.07, 0.4825 + 0.03, 0.08], 'white', { segments: 8 }));
    return kit.finish(parts);
  },
};

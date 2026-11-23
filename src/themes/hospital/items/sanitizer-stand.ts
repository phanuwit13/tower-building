import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';

// A hand-gel stand (1×1): round foot, a pole, a bright board with a hand picture (palm and four
// fingers and a thumb), a mint pump bottle in a holder and a drip tray. Faces +x.
const BOARD_Y = 1.12;

/** เจลล้างมือ: hand-gel stand with a pump bottle and a hand picture. */
export const item: ItemModel = {
  id: 'sanitizer-stand',
  name: 'เจลล้างมือ',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit: StyleKit) => {
    const parts: Part[] = [
      kit.cylinder(0.3, 0.34, 0.05, [0, 0.025, 0], 'charcoal', { segments: 12 }),
      kit.cylinder(0.05, 0.06, 0.9, [-0.05, 0.5, 0], 'teal', { segments: 10 }),
      // board with the hand picture on +x
      kit.box([0.05, 0.4, 0.5], [-0.05, BOARD_Y, 0], 'teal'),
      kit.box([0.03, 0.34, 0.44], [-0.015, BOARD_Y, 0], 'sunYellow'),
      kit.box([0.02, 0.12, 0.14], [0.005, BOARD_Y - 0.06, 0], 'pink'),
      kit.box([0.02, 0.09, 0.03], [0.005, BOARD_Y + 0.045, -0.055], 'pink'),
      kit.box([0.02, 0.11, 0.03], [0.005, BOARD_Y + 0.055, -0.018], 'pink'),
      kit.box([0.02, 0.11, 0.03], [0.005, BOARD_Y + 0.055, 0.018], 'pink'),
      kit.box([0.02, 0.09, 0.03], [0.005, BOARD_Y + 0.045, 0.055], 'pink'),
      kit.box([0.02, 0.03, 0.09], [0.005, BOARD_Y - 0.03, 0.12], 'pink', { rotate: [0, 0, 0.5] }),
      // sparkle dots
      kit.sphere(0.025, [0.01, BOARD_Y + 0.13, -0.17], 'white', { detail: 0, scale: [0.4, 1, 1] }),
      kit.sphere(0.02, [0.01, BOARD_Y + 0.1, 0.17], 'skyBlue', { detail: 0, scale: [0.4, 1, 1] }),
      // holder shelf, drip tray and bottle with a pump head
      kit.box([0.26, 0.04, 0.26], [0.08, 0.7, 0], 'charcoal'),
      kit.box([0.28, 0.015, 0.28], [0.08, 0.7275, 0], 'stoneDark'),
      kit.cylinder(0.08, 0.09, 0.24, [0.08, 0.855, 0], 'mint', { segments: 10 }),
      kit.cylinder(0.04, 0.08, 0.04, [0.08, 0.995, 0], 'mint', { segments: 10 }),
      kit.cylinder(0.025, 0.025, 0.07, [0.08, 1.04, 0], 'white', { segments: 8 }),
      kit.box([0.12, 0.03, 0.04], [0.13, 1.085, 0], 'white'),
      kit.box([0.04, 0.05, 0.04], [0.19, 1.06, 0], 'white'),
    ];
    return kit.finish(parts);
  },
};

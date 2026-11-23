import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// An empty wheeled stretcher along z (head at -z): a mint pad, a pillow, a folded blanket, low rails and a push bar.
const TOP = 0.55;
const W = 0.66;

/** เปลเข็นผู้ป่วย: an empty wheeled stretcher with a pillow. */
export const item: ItemModel = {
  id: 'stretcher',
  name: 'เปลเข็นผู้ป่วย',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([W, 0.1, 1.8], [0, TOP - 0.05, 0], 'mint'),
      kit.box([W - 0.1, 0.04, 1.76], [0, TOP - 0.12, 0], 'white'),
      kit.box([W - 0.22, 0.03, 1.5], [0, 0.29, 0], 'chrome'),
      kit.box([0.5, 0.09, 0.3], [0, TOP + 0.045, -0.62], 'white'),
      kit.box([0.46, 0.02, 0.26], [0, TOP + 0.1, -0.62], 'skyBlue'),
      kit.box([W - 0.04, 0.05, 0.4], [0, TOP + 0.025, 0.55], 'glassBlue'),
      kit.box([W - 0.04, 0.052, 0.08], [0, TOP + 0.027, 0.55], 'pink'),
    ];
    for (const x of [-0.26, 0.26]) {
      for (const z of [-0.72, 0.72]) {
        parts.push(
          kit.box([0.04, 0.2, 0.04], [x, 0.2, z], 'chrome'),
          kit.cylinder(0.06, 0.06, 0.05, [x, 0.06, z], 'charcoal', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
        );
      }
      // low rail on each side
      parts.push(
        kit.box([0.03, 0.03, 1.2], [x * 1.3, TOP + 0.09, 0], 'chrome'),
        kit.box([0.03, 0.09, 0.03], [x * 1.3, TOP + 0.045, -0.5], 'chrome'),
        kit.box([0.03, 0.09, 0.03], [x * 1.3, TOP + 0.045, 0.5], 'chrome'),
      );
    }
    // push bar at the foot end
    parts.push(
      kit.box([0.04, 0.34, 0.04], [-0.27, TOP + 0.15, 0.93], 'chrome'),
      kit.box([0.04, 0.34, 0.04], [0.27, TOP + 0.15, 0.93], 'chrome'),
      kit.box([0.6, 0.04, 0.05], [0, TOP + 0.34, 0.93], 'teal'),
    );
    return kit.finish(parts);
  },
};

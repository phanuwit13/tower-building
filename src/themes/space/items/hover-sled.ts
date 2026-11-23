import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const PAD = { r: 0.17, h: 0.05, x: 0.32, zs: [-0.55, 0.55] }; // glowing pads, sticking out past the hull sides
const HULL = { w: 0.6, h: 0.1, l: 1.4, y: 0.26 }; // low wide hull, raised on the pads

/** ยานลอยตัว: a flat, sleek hover sled with a seat and cargo deck, raised on four glowing pads that breathe. */
export const item: ItemModel = {
  id: 'hover-sled',
  name: 'ยานลอยตัว',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const top = HULL.y + HULL.h / 2;
    const parts: Part[] = [
      kit.box([HULL.w, HULL.h, HULL.l], [0, HULL.y, 0], 'orange'),
      kit.wedge([HULL.w, HULL.h, 0.3], [0, HULL.y, 0.8], 'orange', { rotate: [0, Math.PI, 0] }), // pointed-ish nose
      kit.box([HULL.w + 0.04, 0.04, HULL.l - 0.1], [0, HULL.y - 0.07, 0], 'blue'), // underbelly
      kit.box([0.02, 0.05, 1.2], [HULL.w / 2 + 0.005, HULL.y + 0.01, -0.1], 'sunYellow'), // side stripes
      kit.box([0.02, 0.05, 1.2], [-HULL.w / 2 - 0.005, HULL.y + 0.01, -0.1], 'sunYellow'),
      // deck: low windscreen, a seat (empty) and a small cargo box at the back
      kit.box([0.5, 0.18, 0.04], [0, top + 0.09, 0.35], 'skyBlue', { rotate: [-0.4, 0, 0], glow: 'sunYellow', light: 'window' }),
      kit.box([0.34, 0.07, 0.26], [0, top + 0.035, 0.0], 'white'),
      kit.box([0.34, 0.2, 0.06], [0, top + 0.1, -0.15], 'white'),
      kit.box([0.4, 0.16, 0.34], [0, top + 0.08, -0.55], 'teal'),
      // small fins at the back
      kit.box([0.04, 0.2, 0.3], [0.3, top + 0.1, -0.7], 'blue', { rotate: [0.25, 0, 0] }),
      kit.box([0.04, 0.2, 0.3], [-0.3, top + 0.1, -0.7], 'blue', { rotate: [0.25, 0, 0] }),
    ];
    for (const s of [-1, 1]) {
      for (const z of PAD.zs) {
        parts.push(
          kit.cylinder(0.05, 0.07, HULL.y - HULL.h / 2 - PAD.h, [s * PAD.x, (HULL.y - HULL.h / 2 + PAD.h) / 2, z], 'charcoal', { segments: 8 }),
          kit.cylinder(PAD.r, PAD.r, PAD.h, [s * PAD.x, PAD.h / 2, z], 'mint', { segments: 12, glow: true, light: 'breathe' }),
        );
      }
    }
    return kit.finish(parts);
  },
};

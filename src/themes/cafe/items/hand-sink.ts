import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Footprint 1x1 (front faces +x). A small wooden cabinet with a white top, a round basin, tap, soap pump and a towel on a rail.
const TOP_Y = 0.62;

/** อ่างล้างมือ: small sink with a soap pump and a towel. */
export const item: ItemModel = {
  id: 'hand-sink',
  name: 'อ่างล้างมือ',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.64, 0.04, 0.6], [-0.05, 0.02, 0], 'woodDark'),
      kit.box([0.64, TOP_Y - 0.1, 0.6], [-0.05, 0.04 + (TOP_Y - 0.1) / 2, 0], 'wood'),
      kit.box([0.72, 0.06, 0.68], [-0.05, TOP_Y - 0.03, 0], 'white'),
      kit.box([0.02, 0.4, 0.5], [0.275, 0.3, 0], 'woodDark'),
      kit.sphere(0.03, [0.3, 0.38, 0.14], 'sunYellow', { detail: 0 }),
      // basin: chrome rim, blue water
      kit.cylinder(0.21, 0.21, 0.014, [0.02, TOP_Y + 0.007, 0], 'chrome', { segments: 12 }),
      kit.cylinder(0.185, 0.185, 0.02, [0.02, TOP_Y + 0.01, 0], 'skyBlue', { segments: 12 }),
      kit.sphere(0.03, [0.02, TOP_Y + 0.02, 0], 'stoneDark', { detail: 0, scale: [1, 0.3, 1] }),
      // tap: a post, an arched spout and a handle
      kit.cylinder(0.025, 0.03, 0.2, [-0.22, TOP_Y + 0.1, 0], 'chrome', { segments: 8 }),
      kit.box([0.2, 0.035, 0.04], [-0.14, TOP_Y + 0.21, 0], 'chrome'),
      kit.cylinder(0.02, 0.02, 0.04, [-0.05, TOP_Y + 0.185, 0], 'chrome', { segments: 6 }),
      kit.box([0.03, 0.03, 0.12], [-0.22, TOP_Y + 0.22, 0], 'blue'),
      // soap pump bottle
      kit.cylinder(0.055, 0.055, 0.14, [-0.22, TOP_Y + 0.07, 0.24], 'mint', { segments: 8 }),
      kit.cylinder(0.02, 0.02, 0.06, [-0.22, TOP_Y + 0.17, 0.24], 'white', { segments: 6 }),
      kit.box([0.1, 0.025, 0.03], [-0.18, TOP_Y + 0.21, 0.24], 'white'),
      // a little sponge
      kit.box([0.1, 0.04, 0.07], [-0.2, TOP_Y + 0.02, -0.24], 'sunYellow'),
      // towel on a rail at the +z side
      kit.cylinder(0.014, 0.014, 0.6, [-0.05, 0.9, 0.4], 'chrome', { segments: 6, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.014, 0.014, 0.04, [-0.34, 0.9, 0.4], 'chrome', { segments: 6, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.014, 0.014, 0.04, [0.24, 0.9, 0.4], 'chrome', { segments: 6, rotate: [Math.PI / 2, 0, 0] }),
      kit.box([0.3, 0.32, 0.05], [-0.05, 0.72, 0.42], 'red'),
      kit.box([0.3, 0.04, 0.052], [-0.05, 0.64, 0.42], 'white'),
      kit.box([0.3, 0.04, 0.052], [-0.05, 0.72, 0.42], 'white'),
      kit.box([0.3, 0.04, 0.05], [-0.05, 0.88, 0.4], 'red'),
    ];
    // rail posts reaching the floor behind the towel
    for (const x of [-0.34, 0.24]) parts.push(kit.cylinder(0.014, 0.014, 0.9, [x, 0.45, 0.4], 'chrome', { segments: 6 }));
    return kit.finish(parts);
  },
};

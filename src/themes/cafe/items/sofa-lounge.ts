import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const SEAT_Y = 0.31; // shared café seat height
const BODY = 'teal';
const CUSHION = 'mint';

/** มุมโซฟาตัวแอล: an L-shaped sofa along the back and +z end, a coffee table on a round rug, and a glowing floor lamp. */
export const item: ItemModel = {
  id: 'sofa-lounge',
  name: 'มุมโซฟาตัวแอล',
  category: 'seating',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      // main run along z at the back (-x), and the chaise reaching out to +x at the +z end
      kit.box([0.6, 0.2, 2.8], [-0.65, 0.15, 0], BODY),
      kit.box([0.6, 0.2, 0.77], [-0.05, 0.15, 1.015], BODY),
      kit.box([0.18, 0.4, 2.8], [-0.86, 0.42, 0], BODY), // backrest
      kit.box([0.6, 0.2, 0.14], [-0.65, 0.35, -1.33], BODY), // arm at the -z end
      kit.box([0.6, 0.2, 0.14], [-0.05, 0.35, 1.33], BODY), // arm at the +z end of the chaise
    ];
    for (const z of [-0.95, -0.32, 0.31]) parts.push(kit.box([0.45, 0.06, 0.62], [-0.575, SEAT_Y - 0.03, z], CUSHION));
    parts.push(
      kit.box([0.45, 0.06, 0.6], [-0.575, SEAT_Y - 0.03, 0.94], CUSHION),
      kit.box([0.57, 0.06, 0.6], [-0.065, SEAT_Y - 0.03, 0.94], CUSHION),
      // scatter pillows
      kit.box([0.14, 0.2, 0.2], [-0.72, 0.41, -1.05], 'sunYellow', { rotate: [0, 0, 0.2] }),
      kit.box([0.14, 0.2, 0.2], [-0.72, 0.41, 0.0], 'pink', { rotate: [0, 0, 0.2] }),
      kit.box([0.14, 0.18, 0.18], [-0.1, 0.4, 1.2], 'orange', { rotate: [0, 0, 0.3] }),
    );
    // round rug: three rings, each top above 0.02
    const rug: [number, number] = [0.5, -0.35];
    parts.push(
      kit.cylinder(0.5, 0.5, 0.03, [rug[0], 0.015, rug[1]], 'orange'),
      kit.cylinder(0.4, 0.4, 0.035, [rug[0], 0.0175, rug[1]], 'cream'),
      kit.cylinder(0.3, 0.3, 0.04, [rug[0], 0.02, rug[1]], 'pink'),
      // coffee table (top 0.26) with two cups and a book
      kit.cylinder(0.14, 0.14, 0.03, [rug[0], 0.055, rug[1]], 'woodDark', { segments: 10 }),
      kit.cylinder(0.05, 0.05, 0.14, [rug[0], 0.14, rug[1]], 'woodDark', { segments: 8 }),
      kit.cylinder(0.26, 0.26, 0.04, [rug[0], 0.24, rug[1]], 'wood', { segments: 12 }),
      kit.cylinder(0.04, 0.04, 0.06, [rug[0] + 0.1, 0.29, rug[1] + 0.08], 'white', { segments: 8 }),
      kit.cylinder(0.04, 0.04, 0.06, [rug[0] - 0.05, 0.29, rug[1] + 0.12], 'red', { segments: 8 }),
      kit.box([0.16, 0.04, 0.12], [rug[0] - 0.02, 0.28, rug[1] - 0.1], 'blue', { rotate: [0, 0.4, 0] }),
      // floor lamp in the front corner: glowing fabric shade
      kit.cylinder(0.14, 0.15, 0.04, [0.78, 0.02, -1.2], 'charcoal', { segments: 10 }),
      kit.cylinder(0.025, 0.025, 1.1, [0.78, 0.59, -1.2], 'charcoal', { segments: 6 }),
      kit.cylinder(0.13, 0.2, 0.26, [0.78, 1.28, -1.2], 'lampWarm', { segments: 10, glow: true, light: 'breathe' }),
      kit.cylinder(0.1, 0.1, 0.03, [0.78, 1.43, -1.2], 'brass', { segments: 8 }),
    );
    return kit.finish(parts);
  },
};

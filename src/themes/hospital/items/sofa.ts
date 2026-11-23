import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A soft two-seat waiting sofa (1×2, long side along z), back at -x, front faces +x.
const W = 0.8; // depth (x)
const L = 1.8; // length (z)
const SEAT_Y = 0.31;

/** โซฟารอ: a soft two-seat sofa with cushions. */
export const item: ItemModel = {
  id: 'sofa',
  name: 'โซฟารอ',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.1, 0.06, 0.1], [-0.3, 0.03, -L / 2 + 0.1], 'woodDark'),
      kit.box([0.1, 0.06, 0.1], [0.3, 0.03, -L / 2 + 0.1], 'woodDark'),
      kit.box([0.1, 0.06, 0.1], [-0.3, 0.03, L / 2 - 0.1], 'woodDark'),
      kit.box([0.1, 0.06, 0.1], [0.3, 0.03, L / 2 - 0.1], 'woodDark'),
      kit.box([W, 0.16, L], [0, 0.14, 0], 'blue'), // base
      kit.box([0.2, 0.34, L], [-W / 2 + 0.1, 0.39, 0], 'blue'), // back: top at 0.56
      kit.dome(1, [-W / 2 + 0.1, 0.55, 0], 'blue', { segments: 8, scale: [0.1, 0.07, L / 2 - 0.02] }),
    ];
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([W, 0.2, 0.16], [0, 0.32, s * (L / 2 - 0.08)], 'navy'), // arms: top at 0.42
        kit.sphere(1, [0, 0.42, s * (L / 2 - 0.08)], 'navy', { detail: 0, scale: [W / 2 - 0.02, 0.05, 0.08] }),
        // seat cushions: top at 0.31
        kit.box([0.52, 0.08, 0.7], [0.07, SEAT_Y - 0.04, s * 0.42], 'skyBlue'),
        kit.dome(1, [0.07, SEAT_Y - 0.02, s * 0.42], 'skyBlue', { segments: 8, scale: [0.24, 0.04, 0.33] }),
      );
    }
    // scatter cushions leaning on the back
    parts.push(
      kit.box([0.1, 0.24, 0.24], [-0.2, 0.43, -0.55], 'sunYellow', { rotate: [0, 0, -0.2] }),
      kit.box([0.1, 0.24, 0.24], [-0.2, 0.43, 0.55], 'pink', { rotate: [0, 0, -0.2] }),
    );
    return kit.finish(parts);
  },
};

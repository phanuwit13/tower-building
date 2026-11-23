import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A reading corner (2×2): a low bookshelf along the -x side, a round striped rug and three bean bags with a few books.
const RUG = { x: 0.2, r: 0.78 };
const SHELF = { x: -0.82, d: 0.3, len: 1.7, h: 0.7, t: 0.04 };
const SPINES: PaletteColor[] = ['red', 'blue', 'sunYellow', 'leaf', 'pink', 'orange', 'purple', 'skyBlue'];
const WIDTHS = [0.06, 0.08, 0.05, 0.07, 0.09, 0.055];
const HEIGHTS = [0.25, 0.21, 0.27, 0.23, 0.19, 0.26];

/** มุมหนังสือ: a low bookshelf, bean bags and a round rug. */
export const item: ItemModel = {
  id: 'reading-corner',
  name: 'มุมหนังสือ',
  category: 'decoration',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      // rug: three rings, each top 0.01 higher than the one outside it
      kit.cylinder(RUG.r, RUG.r, 0.03, [RUG.x, 0.015, 0], 'pink', { segments: 16 }),
      kit.cylinder(RUG.r * 0.8, RUG.r * 0.8, 0.04, [RUG.x, 0.02, 0], 'skyBlue', { segments: 16 }),
      kit.cylinder(RUG.r * 0.52, RUG.r * 0.52, 0.05, [RUG.x, 0.025, 0], 'sunYellow', { segments: 16 }),
    ];
    // shelf: back, ends, boards
    const inner = SHELF.len - 2 * SHELF.t;
    parts.push(
      kit.box([0.03, SHELF.h, SHELF.len], [SHELF.x - SHELF.d / 2 + 0.015, SHELF.h / 2, 0], 'mint'),
      kit.box([SHELF.d, SHELF.h, SHELF.t], [SHELF.x, SHELF.h / 2, SHELF.len / 2 - SHELF.t / 2], 'mint'),
      kit.box([SHELF.d, SHELF.h, SHELF.t], [SHELF.x, SHELF.h / 2, -SHELF.len / 2 + SHELF.t / 2], 'mint'),
      kit.box([SHELF.d, SHELF.t, inner], [SHELF.x, SHELF.t / 2, 0], 'mint'),
      kit.box([SHELF.d, SHELF.t, inner], [SHELF.x, 0.36, 0], 'mint'),
      kit.box([SHELF.d + 0.02, SHELF.t, SHELF.len], [SHELF.x + 0.01, SHELF.h - SHELF.t / 2, 0], 'sunYellow'),
    );
    // books on both levels, standing spines to the front
    [SHELF.t, 0.36 + SHELF.t / 2].forEach((top, level) => {
      let z = -SHELF.len / 2 + SHELF.t + 0.02;
      let n = level * 2;
      while (z + WIDTHS[n % WIDTHS.length] < SHELF.len / 2 - SHELF.t - 0.3) {
        const w = WIDTHS[n % WIDTHS.length];
        const h = HEIGHTS[(n * 5) % HEIGHTS.length];
        parts.push(kit.box([0.22, h, w], [SHELF.x + 0.02, top + h / 2, z + w / 2], SPINES[(n * 3 + level) % SPINES.length]));
        z += w + 0.005;
        n++;
      }
      // the last third of each level: picture books lying flat
      for (let i = 0; i < 3; i++) parts.push(kit.box([0.22 - i * 0.03, 0.05, 0.28 - i * 0.03], [SHELF.x + 0.02, top + 0.025 + i * 0.05, SHELF.len / 2 - SHELF.t - 0.16], SPINES[(n + i * 2 + level) % SPINES.length]));
    });
    // bean bags: a squashed ball with a small top knob and a stripe (colour only)
    const bags: Array<[number, number, number, PaletteColor, PaletteColor]> = [
      [0.55, -0.42, 0.3, 'red', 'sunYellow'],
      [0.62, 0.3, 0.27, 'lime', 'purple'],
      [-0.12, 0.45, 0.28, 'purple', 'pink'],
    ];
    for (const [x, z, r, c, c2] of bags) {
      parts.push(
        kit.sphere(1, [x, 0.04 + r * 0.7, z], c, { scale: [r, r * 0.7, r] }),
        kit.sphere(1, [x, 0.04 + r * 1.3, z], c2, { detail: 0, scale: [r * 0.35, r * 0.14, r * 0.35] }),
      );
    }
    // books lying on the rug, and a cushion
    parts.push(
      kit.box([0.22, 0.04, 0.3], [0.2, 0.07, -0.05], 'blue', { rotate: [0, 0.4, 0] }),
      kit.box([0.2, 0.04, 0.27], [0.21, 0.11, -0.05], 'orange', { rotate: [0, 0.7, 0] }),
      kit.box([0.2, 0.04, 0.28], [0.1, 0.07, 0.15], 'leaf', { rotate: [0, -0.3, 0] }),
      kit.box([0.2, 0.07, 0.2], [-0.05, 0.085, -0.4], 'pink', { rotate: [0, 0.3, 0] }),
    );
    return kit.finish(parts);
  },
};

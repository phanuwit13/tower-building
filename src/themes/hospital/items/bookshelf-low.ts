import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A low shelf of picture books (1×2, the shelf runs along z, the books face +x) with a plant and a toy block on top.
const SHELF = { d: 0.46, len: 1.84, h: 0.9, t: 0.04 }; // depth along x, length along z, height, board thickness
const LEVELS = [SHELF.t, 0.45 + SHELF.t / 2]; // tops of the two shelf boards
const SPINES: PaletteColor[] = ['red', 'blue', 'sunYellow', 'leaf', 'pink', 'orange', 'purple', 'skyBlue', 'lime', 'mint'];
const WIDTHS = [0.06, 0.08, 0.05, 0.07, 0.09, 0.055, 0.075];
const HEIGHTS = [0.3, 0.26, 0.33, 0.28, 0.24, 0.31, 0.27];

/** ชั้นหนังสือเด็ก: a low shelf of colourful picture books with a plant on top. */
export const item: ItemModel = {
  id: 'bookshelf-low',
  name: 'ชั้นหนังสือเด็ก',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const inner = SHELF.len - 2 * SHELF.t;
    const parts: Part[] = [
      kit.box([0.03, SHELF.h, SHELF.len], [-SHELF.d / 2 + 0.015, SHELF.h / 2, 0], 'blue'), // back
      kit.box([SHELF.d, SHELF.h, SHELF.t], [0, SHELF.h / 2, SHELF.len / 2 - SHELF.t / 2], 'skyBlue'), // ends
      kit.box([SHELF.d, SHELF.h, SHELF.t], [0, SHELF.h / 2, -SHELF.len / 2 + SHELF.t / 2], 'skyBlue'),
      kit.box([SHELF.d, SHELF.t, inner], [0, SHELF.t / 2, 0], 'skyBlue'), // bottom board
      kit.box([SHELF.d, SHELF.t, inner], [0, 0.45, 0], 'skyBlue'), // middle board
      kit.box([SHELF.d + 0.02, SHELF.t, SHELF.len], [0.01, SHELF.h - SHELF.t / 2, 0], 'sunYellow'), // top board, a little proud
    ];
    // books: a run of standing spines, a leaning one, then a flat stack at the +z end of each bay
    LEVELS.forEach((top, level) => {
      let z = -SHELF.len / 2 + SHELF.t + 0.02;
      let n = level * 3;
      const stop = 0.3;
      while (true) {
        const w = WIDTHS[n % WIDTHS.length];
        if (z + w > stop) break;
        const h = HEIGHTS[(n * 3) % HEIGHTS.length];
        parts.push(kit.box([0.3, h, w], [0.02, top + h / 2, z + w / 2], SPINES[(n * 3 + level) % SPINES.length]));
        z += w + 0.005;
        n++;
      }
      // a book leaning on the last one
      parts.push(kit.box([0.3, 0.28, 0.06], [0.02, top + 0.135, z + 0.07], SPINES[(n * 3 + 1) % SPINES.length], { rotate: [0.28, 0, 0] }));
      // flat stack of three
      const colours: PaletteColor[] = ['pink', 'sunYellow', 'leaf'];
      colours.forEach((c, i) => parts.push(kit.box([0.3 - i * 0.03, 0.05, 0.38 - i * 0.04], [0.02, top + 0.025 + i * 0.05, 0.62 + (i === 1 ? 0.01 : 0)], c)));
      // a small toy on the stack
      parts.push(kit.sphere(0.04, [0.02, top + 0.15 + 0.035, 0.62], level === 0 ? 'orange' : 'red', { detail: 0 }));
    });
    // on top: a potted plant and a toy block
    const topY = SHELF.h;
    parts.push(
      kit.cylinder(0.1, 0.075, 0.13, [0.02, topY + 0.065, -0.5], 'terracotta', { segments: 8 }),
      kit.sphere(0.16, [0.02, topY + 0.27, -0.5], 'leaf', { scale: [1, 1.05, 1] }),
      kit.sphere(0.09, [0.1, topY + 0.38, -0.46], 'leafDark', { detail: 0 }),
      kit.sphere(0.08, [-0.06, topY + 0.34, -0.57], 'lime', { detail: 0 }),
      kit.box([0.14, 0.14, 0.14], [0.05, topY + 0.07, 0.35], 'red', { rotate: [0, 0.4, 0] }),
      kit.box([0.14, 0.14, 0.14], [0.03, topY + 0.07, 0.62], 'sunYellow', { rotate: [0, -0.2, 0] }),
      kit.box([0.14, 0.14, 0.14], [0.04, topY + 0.21, 0.5], 'blue', { rotate: [0, 0.7, 0] }),
    );
    return kit.finish(parts);
  },
};

import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const TABLE_TOP = 0.5; // shared table height
const TOP = { s: 0.62, h: 0.06 }; // square stone slab
const BOARD = { s: 0.5, n: 4 }; // charcoal board with n x n cells (alternate cells white)
const STOOL = { r: 0.12, h: 0.3 };
const PAD = { w: 1.85, d: 1.85, h: 0.03 };
const TABLE_Z = [-0.5, 0.5];

/** โต๊ะหมากรุก: two stone tables with checkered boards, a few game pieces and four stools on a paved pad. */
export const item: ItemModel = {
  id: 'chess-tables',
  name: 'โต๊ะหมากรุก',
  category: 'play',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([PAD.w, PAD.h, PAD.d], [0, PAD.h / 2, 0], 'sand')];
    const slabBottom = TABLE_TOP - TOP.h;
    const boardY = TABLE_TOP + 0.006;
    const cell = BOARD.s / BOARD.n;
    for (const z of TABLE_Z) {
      parts.push(
        kit.cylinder(0.09, 0.14, slabBottom - PAD.h, [0, PAD.h + (slabBottom - PAD.h) / 2, z], 'stone', { segments: 8 }),
        kit.box([TOP.s, TOP.h, TOP.s], [0, TABLE_TOP - TOP.h / 2, z], 'stone'),
        kit.box([BOARD.s, 0.012, BOARD.s], [0, boardY, z], 'charcoal'),
      );
      for (let i = 0; i < BOARD.n; i++) {
        for (let j = 0; j < BOARD.n; j++) {
          if ((i + j) % 2 !== 0) continue;
          parts.push(kit.box([cell, 0.012, cell], [-BOARD.s / 2 + cell * (i + 0.5), boardY + 0.006, z - BOARD.s / 2 + cell * (j + 0.5)], 'white'));
        }
      }
      // game pieces: a yellow and a red one, each a little stem with a round head
      for (const [px, pz, c] of [[-0.1, -0.1, 'sunYellow'], [0.12, 0.1, 'red']] as const) {
        parts.push(
          kit.cylinder(0.03, 0.04, 0.07, [px, boardY + 0.006 + 0.035, z + pz], c, { segments: 8 }),
          kit.sphere(0.035, [px, boardY + 0.006 + 0.09, z + pz], c, { detail: 0 }),
        );
      }
      // stools either side of the board
      for (const [x, c] of [[0.6, 'orange'], [-0.6, 'teal']] as const) {
        parts.push(
          kit.cylinder(0.05, 0.07, STOOL.h - 0.05, [x, PAD.h + (STOOL.h - 0.05) / 2, z], 'woodDark', { segments: 8 }),
          kit.cylinder(STOOL.r, STOOL.r, 0.05, [x, STOOL.h - 0.025 + PAD.h, z], c, { segments: 8 }),
        );
      }
    }
    return kit.finish(parts);
  },
};

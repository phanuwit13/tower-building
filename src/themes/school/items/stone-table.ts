import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A long grey stone (concrete) table with a stone bench each side, long side along z. The +x
// bench faces the camera; the chessboard sits in the middle of the top.
const TOP = { w: 0.48, t: 0.07, len: 1.62, y: 0.5 }; // table top: width (x), thickness, length (z), top surface height
const UNDER = { inset: 0.03, h: 0.04 }; // a darker lip under the top makes the slab read as thick
const LEG = { w: 0.26, d: 0.14, z: 0.52 }; // two slab legs at z = ±LEG.z
const SEAT = { x: 0.38, w: 0.18, t: 0.07, len: 1.5, y: 0.31 }; // benches at x = ±SEAT.x; y = seat top
const SEAT_LEG = { w: 0.12, d: 0.12, z: 0.5 };
const BOARD = { n: 8, sq: 0.05, border: 0.025 }; // 8 x 8 chessboard, inlaid in layers 0.01 apart
/** A few pieces mid-game: [file, rank, colour] (files and ranks 0..7). */
const PIECES: Array<[number, number, PaletteColor]> = [[2, 1, 'white'], [5, 2, 'white'], [3, 5, 'charcoal'], [6, 6, 'charcoal']];

/** โต๊ะหินนั่งเล่น: a grey stone table with two stone benches and a chessboard on top. */
export const item: ItemModel = {
  id: 'stone-table',
  name: 'โต๊ะหินนั่งเล่น',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const legH = TOP.y - TOP.t;
    const parts: Part[] = [
      kit.box([TOP.w, TOP.t, TOP.len], [0, TOP.y - TOP.t / 2, 0], 'stone'),
      kit.box([TOP.w - 2 * UNDER.inset, UNDER.h, TOP.len - 2 * UNDER.inset], [0, legH - UNDER.h / 2, 0], 'stoneDark'),
    ];
    for (const z of [-LEG.z, LEG.z]) parts.push(kit.box([LEG.w, legH - UNDER.h, LEG.d], [0, (legH - UNDER.h) / 2, z], 'stoneDark'));
    // benches: a slab on two blocks each side
    const seatLegH = SEAT.y - SEAT.t;
    for (const x of [-SEAT.x, SEAT.x]) {
      parts.push(kit.box([SEAT.w, SEAT.t, SEAT.len], [x, SEAT.y - SEAT.t / 2, 0], 'stone'));
      for (const z of [-SEAT_LEG.z, SEAT_LEG.z]) parts.push(kit.box([SEAT_LEG.w, seatLegH, SEAT_LEG.d], [x, seatLegH / 2, z], 'stoneDark'));
    }
    // chessboard: a dark border, white squares under the lot, then the 32 dark squares on top
    const side = BOARD.n * BOARD.sq;
    const y0 = TOP.y;
    parts.push(
      kit.box([side + 2 * BOARD.border, 0.01, side + 2 * BOARD.border], [0, y0 + 0.005, 0], 'stoneDark'),
      kit.box([side + 0.006, 0.02, side + 0.006], [0, y0 + 0.01, 0], 'white'), // a hair wider: no z-fighting at the edge squares
    );
    const sq = (i: number) => (i - (BOARD.n - 1) / 2) * BOARD.sq; // centre of square i along x or z
    for (let i = 0; i < BOARD.n; i++) {
      for (let j = 0; j < BOARD.n; j++) {
        if ((i + j) % 2 === 0) parts.push(kit.box([BOARD.sq, 0.03, BOARD.sq], [sq(i), y0 + 0.015, sq(j)], 'charcoal'));
      }
    }
    // chess pieces (simple pawns): a cone body and a round head
    const boardTop = y0 + 0.03;
    for (const [i, j, color] of PIECES) {
      parts.push(
        kit.cylinder(0.013, 0.025, 0.07, [sq(i), boardTop + 0.035, sq(j)], color, { segments: 6 }),
        kit.sphere(0.024, [sq(i), boardTop + 0.082, sq(j)], color, { detail: 0 }),
      );
    }
    return kit.finish(parts);
  },
};

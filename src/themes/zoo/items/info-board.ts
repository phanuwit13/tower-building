import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A wide animal-information board (1 x 2, long side along z) on two wooden posts, facing +x.
// The picture is a giraffe made of colour blocks (no text) under a little roof.
const GROUND_H = 0.03;
const POST = { z: 0.62, w: 0.09, h: 0.95 };
const BOARD = { w: 1.5, h: 0.62, y: 0.78, depth: 0.07 }; // frame centre height; w along z
const FRONT = BOARD.depth / 2; // the front face of the frame (x)

/** Colour blocks on the board: [z (left-right, +z is the board's left from the front), y offset, w (z), h, colour]. */
const BLOCKS: Array<[number, number, number, number, PaletteColor]> = [
  [0, -0.26, 1.38, 0.1, 'leaf'], // grass
  [-0.5, 0.2, 0.17, 0.17, 'sunYellow'], // sun (z = -0.5: the one block not on the giraffe)
  // giraffe: the head is on the +z side, so from the front (+x) it faces the viewer's left
  [0.0, -0.1, 0.5, 0.2, 'sunYellow'], // body
  [-0.2, -0.2, 0.08, 0.14, 'sunYellow'], [-0.1, -0.2, 0.08, 0.14, 'sunYellow'], [0.1, -0.2, 0.08, 0.14, 'sunYellow'], [0.2, -0.2, 0.08, 0.14, 'sunYellow'], // legs
  [0.25, 0.05, 0.1, 0.4, 'sunYellow'], // neck
  [0.32, 0.25, 0.2, 0.1, 'sunYellow'], // head
  [0.42, 0.24, 0.07, 0.06, 'orange'], // muzzle
  [0.27, 0.34, 0.03, 0.06, 'orange'], // horn
  [0.32, 0.27, 0.03, 0.03, 'charcoal'], // eye
  [-0.12, -0.06, 0.07, 0.07, 'orange'], [0.05, -0.04, 0.07, 0.07, 'orange'], [0.24, 0.0, 0.05, 0.06, 'orange'], [-0.02, -0.14, 0.06, 0.05, 'orange'], // spots
];

/** ป้ายข้อมูลสัตว์: a wide board on two posts with a giraffe picture in colour blocks. */
export const item: ItemModel = {
  id: 'info-board',
  name: 'ป้ายข้อมูลสัตว์',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.9, GROUND_H, 1.84], [0, GROUND_H / 2, 0], 'lime'),
      kit.box([0.42, 0.045, 0.2], [0.18, GROUND_H + 0.022, 0.62], 'stone'), // two stone footings
      kit.box([0.42, 0.045, 0.2], [0.18, GROUND_H + 0.022, -0.62], 'stone'),
    ];
    for (const s of [-1, 1]) {
      parts.push(kit.box([POST.w, POST.h, POST.w], [0, GROUND_H + POST.h / 2, s * POST.z], 'woodDark'));
    }
    parts.push(
      // frame and the board itself
      kit.box([BOARD.depth, BOARD.h, BOARD.w], [0.02, BOARD.y, 0], 'wood'),
      kit.box([0.02, BOARD.h - 0.1, BOARD.w - 0.1], [0.02 + FRONT, BOARD.y, 0], 'skyBlue'),
      // little roof over the board, tilted forward-up
      kit.box([0.3, 0.04, BOARD.w + 0.14], [0.02, BOARD.y + BOARD.h / 2 + 0.06, 0], 'red', { rotate: [0, 0, -0.18] }),
    );
    for (const [z, dy, w, h, color] of BLOCKS) {
      // later layers sit 0.006 further out so blocks that overlap never share a plane
      const layer = color === 'charcoal' ? 0.012 : color === 'orange' && z !== -0.5 ? 0.006 : 0;
      parts.push(kit.box([0.012, h, w], [0.02 + FRONT + 0.016 + layer, BOARD.y + dy, z], color));
    }
    return kit.finish(parts);
  },
};

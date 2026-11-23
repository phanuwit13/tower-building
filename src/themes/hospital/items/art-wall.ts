import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';

// A free-standing board of kids' drawings (1×2, the board runs along z, the drawings face +x): sun, house, cat, rainbow.
// Every drawing is a picture made of colour blocks on a pastel sheet; there is no writing.
const BOARD = { y0: 0.3, h: 1.1, len: 1.8, t: 0.06 }; // board: bottom y, height, length along z, thickness
const FACE = BOARD.t / 2; // front face x
const SHEET = { w: 0.78, h: 0.46, t: 0.02 };
const COLS = [-0.45, 0.45]; // sheet centres along z
const ROWS = [BOARD.y0 + 0.28, BOARD.y0 + 0.82]; // sheet centres, bottom and top row
const DRAW_X = FACE + SHEET.t + 0.01; // the drawing's centre x, on top of the sheet

/** บอร์ดรูปวาดเด็ก: a free-standing board of kids' drawings (sun, house, cat, rainbow). */
export const item: ItemModel = {
  id: 'art-wall',
  name: 'บอร์ดรูปวาดเด็ก',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const yMid = BOARD.y0 + BOARD.h / 2;
    const parts: Part[] = [
      kit.box([BOARD.t, BOARD.h, BOARD.len], [0, yMid, 0], 'cream'), // the board
      // frame round the edge
      kit.box([BOARD.t + 0.02, 0.05, BOARD.len + 0.06], [0, BOARD.y0 + BOARD.h + 0.025, 0], 'woodDark'),
      kit.box([BOARD.t + 0.02, 0.05, BOARD.len + 0.06], [0, BOARD.y0 - 0.025, 0], 'woodDark'),
      kit.box([BOARD.t + 0.02, BOARD.h, 0.05], [0, yMid, BOARD.len / 2 + 0.025], 'woodDark'),
      kit.box([BOARD.t + 0.02, BOARD.h, 0.05], [0, yMid, -BOARD.len / 2 - 0.025], 'woodDark'),
    ];
    // two feet and two posts: the board stands on its own
    for (const sz of [-1, 1]) {
      parts.push(
        kit.box([0.62, 0.06, 0.09], [0, 0.03, sz * 0.7], 'orange'),
        kit.box([0.07, BOARD.y0, 0.09], [0, BOARD.y0 / 2, sz * 0.7], 'orange'),
      );
    }
    // sheets of paper on the front (+x), one colour each, and the back (-x) with plain colour sheets
    const front = ['glassBlue', 'pink', 'mint', 'lampWarm'] as const; // sun, house, cat, rainbow
    const sheets: Array<[number, number, (typeof front)[number]]> = [
      [COLS[0], ROWS[1], front[0]], [COLS[1], ROWS[1], front[1]], [COLS[0], ROWS[0], front[2]], [COLS[1], ROWS[0], front[3]],
    ];
    for (const [z, y, c] of sheets) parts.push(kit.box([SHEET.t, SHEET.h, SHEET.w], [FACE + SHEET.t / 2, y, z], c));
    const back = ['sunYellow', 'skyBlue', 'lime', 'purple'] as const;
    sheets.forEach(([z, y], i) => parts.push(kit.box([SHEET.t, SHEET.h * 0.8, SHEET.w * 0.8], [-FACE - SHEET.t / 2, y, z], back[i])));

    // 1) sun: a yellow disc with eight short rays, on a pale sky
    {
      const [z, y] = [COLS[0], ROWS[1]];
      parts.push(kit.cylinder(0.13, 0.13, 0.02, [DRAW_X, y, z], 'sunYellow', { rotate: [0, 0, Math.PI / 2], segments: 12 }));
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        parts.push(kit.box([0.02, 0.1, 0.035], [DRAW_X, y + Math.cos(a) * 0.19, z + Math.sin(a) * 0.19], 'orange', { rotate: [-a, 0, 0] }));
      }
      parts.push(kit.box([0.02, 0.05, 0.78 - 0.04], [DRAW_X, y - 0.2, z], 'leaf')); // a strip of grass
    }
    // 2) house: orange walls, a red gable roof, a blue door and a yellow window, with a green lawn
    {
      const [z, y] = [COLS[1], ROWS[1]];
      parts.push(
        kit.box([0.02, 0.05, 0.78 - 0.04], [DRAW_X, y - 0.2, z], 'leaf'),
        kit.box([0.02, 0.2, 0.36], [DRAW_X, y - 0.05, z], 'orange'),
        kit.wedge([0.46, 0.14, 0.02], [DRAW_X, y + 0.12, z], 'red', { rotate: [0, Math.PI / 2, 0] }),
        kit.box([0.02, 0.13, 0.07], [DRAW_X + 0.01, y - 0.085, z + 0.09], 'blue'),
        kit.box([0.02, 0.07, 0.07], [DRAW_X + 0.01, y - 0.02, z - 0.09], 'sunYellow'),
      );
    }
    // 3) cat: an orange body and head with ears, a tail, dark eyes and a pink nose, on a green sheet
    {
      const [z, y] = [COLS[0], ROWS[0]];
      const P = (dy: number, dz: number): Vec3 => [DRAW_X + 0.01, y + dy, z + dz];
      parts.push(
        kit.sphere(1, P(-0.1, 0.05), 'orange', { detail: 0, scale: [0.02, 0.1, 0.17] }), // body
        kit.sphere(1, P(0.03, -0.08), 'orange', { detail: 0, scale: [0.02, 0.1, 0.11] }), // head
        kit.cone(0.05, 0.08, P(0.14, -0.14), 'orange', { segments: 4, scale: [0.4, 1, 1] }), // ears
        kit.cone(0.05, 0.08, P(0.14, -0.02), 'orange', { segments: 4, scale: [0.4, 1, 1] }),
        kit.box([0.02, 0.025, 0.16], P(-0.05, 0.24), 'terracotta', { rotate: [-0.8, 0, 0] }), // tail
        kit.sphere(0.02, P(0.05, -0.115), 'charcoal', { detail: 0, scale: [0.4, 1, 1] }),
        kit.sphere(0.02, P(0.05, -0.045), 'charcoal', { detail: 0, scale: [0.4, 1, 1] }),
        kit.sphere(0.018, P(0.0, -0.08), 'pink', { detail: 0, scale: [0.4, 1, 1] }),
      );
    }
    // 4) rainbow: five arches, red outside to blue inside, with two white clouds at its feet
    {
      const [z, y] = [COLS[1], ROWS[0]];
      const arches = [['red', 0.3], ['orange', 0.25], ['sunYellow', 0.2], ['leaf', 0.15], ['blue', 0.1]] as const;
      for (const [c, r] of arches) parts.push(kit.torus(r, 0.025, [DRAW_X, y - 0.17, z], c, { radialSegments: 4, tubularSegments: 8, arc: Math.PI, rotate: [0, Math.PI / 2, 0] }));
      for (const s of [-1, 1]) parts.push(kit.sphere(0.07, [DRAW_X + 0.01, y - 0.17, z + s * 0.2], 'white', { detail: 0, scale: [0.3, 0.7, 1.1] }));
    }
    return kit.finish(parts);
  },
};

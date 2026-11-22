import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A wooden post with three arrow boards, each pointing a different way. Each board is a plank plus
// a wedge arrow head, built pointing +x and then turned about the post (y) by its angle.
const BASE = { w: 0.28, h: 0.06 };
const POST = { w: 0.09, top: 1.38 };
const CAP = { r: 0.085, h: 0.09 }; // little pyramid roof on the post
const BOARD = { len: 0.34, h: 0.13, t: 0.035, tail: 0.07 }; // plank; `tail` = how far it sticks out behind the post
const HEAD = { len: 0.12, h: 0.21 }; // arrow head: length along the board, height across it
const LINE = { len: 0.17, h: 0.026 }; // white stripe on both faces of each board, like writing
/** Height of the board's centre, angle about y (0 = pointing +x, π/2 = pointing -z), colour. */
const BOARDS: Array<[number, number, PaletteColor]> = [
  [1.18, 0.45, 'red'],
  [0.95, Math.PI + 0.3, 'sunYellow'],
  [0.72, 1.3, 'blue'],
];

/** ป้ายบอกทาง: a wooden signpost with red, yellow and blue arrows pointing three ways. */
export const item: ItemModel = {
  id: 'signpost',
  name: 'ป้ายบอกทาง',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const postH = POST.top - BASE.h;
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.w], [0, BASE.h / 2, 0], 'stone'),
      kit.box([POST.w + 0.05, 0.08, POST.w + 0.05], [0, BASE.h + 0.04, 0], 'woodDark'), // foot collar
      kit.box([POST.w, postH, POST.w], [0, BASE.h + postH / 2, 0], 'wood'),
      kit.cone(CAP.r, CAP.h, [0, POST.top + CAP.h / 2, 0], 'woodDark', { segments: 4, rotate: [0, Math.PI / 4, 0] }),
    ];
    for (const [y, angle, color] of BOARDS) {
      // a point `d` along the board from the post (before the turn), turned with it
      const along = (d: number): [number, number] => [d * Math.cos(angle), -d * Math.sin(angle)];
      const plankMid = BOARD.len / 2 - BOARD.tail;
      const front = BOARD.len - BOARD.tail; // where the plank meets the arrow head
      const [px, pz] = along(plankMid);
      const [hx, hz] = along(front + HEAD.len / 2);
      const [lx, lz] = along((POST.w / 2 + front) / 2); // centred on the part of the plank in front of the post
      parts.push(
        kit.box([BOARD.len, BOARD.h, BOARD.t], [px, y, pz], color, { rotate: [0, angle, 0] }),
        // the wedge's apex points up; a -90° turn about z points it along +x before the turn about y
        kit.wedge([HEAD.h, HEAD.len, BOARD.t], [hx, y, hz], color, { rotate: [0, angle, -Math.PI / 2] }),
        kit.box([LINE.len, LINE.h, BOARD.t + 0.012], [lx, y, lz], 'white', { rotate: [0, angle, 0] }),
      );
    }
    return kit.finish(parts);
  },
};

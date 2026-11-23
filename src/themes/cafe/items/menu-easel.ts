import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A pavement-style A-frame board for the café floor (1×1): two boards leaning together. The +x board
// is a chalkboard with three pictures (cup, cake slice, juice glass) and no text; the back is plain.
const TILT = 0.35;
const C = Math.cos(TILT);
const S = Math.sin(TILT);
const BOARD = { w: 0.7, h: 0.8, t: 0.04 };
const FRAME = { w: 0.76, h: 0.86, t: 0.05 };
const CY = (FRAME.h / 2) * C + (FRAME.t / 2) * S; // centre height so the lowest corner touches the ground
const CX = 0.19;

/** A point on the front board: u along z, v up the slope, n out of the face. */
function front(u: number, v: number, n: number): Vec3 {
  return [CX - v * S + n * C, CY + v * C + n * S, u];
}

/** โต๊ะป้ายเมนูขาตั้ง: an A-frame board with cup, cake and juice pictures. */
export const item: ItemModel = {
  id: 'menu-easel',
  name: 'ป้ายเมนูขาตั้ง',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit: StyleKit) => {
    const rf: Vec3 = [0, 0, TILT];
    const rb: Vec3 = [0, 0, -TILT];
    const pic = (size: Vec3, u: number, v: number, n: number, color: PaletteColor): Part =>
      kit.box(size, front(u, v, 0.02 + n), color, { rotate: rf });
    const parts: Part[] = [
      // front board: wooden frame, charcoal chalkboard
      kit.box([FRAME.t, FRAME.h, FRAME.w], [CX, CY, 0], 'wood', { rotate: rf }),
      kit.box([BOARD.t, BOARD.h, BOARD.w], front(0, 0, 0.012), 'charcoal', { rotate: rf }),
      // back board: teal with a yellow sun
      kit.box([FRAME.t, FRAME.h, FRAME.w], [-CX, CY, 0], 'woodDark', { rotate: rb }),
      kit.box([BOARD.t, BOARD.h, BOARD.w], [-CX - 0.012 * C, CY + 0.012 * S, 0], 'teal', { rotate: rb }),
      kit.cylinder(0.14, 0.14, 0.02, [-CX + 0.2 * S - 0.03 * C, CY + 0.2 * C + 0.03 * S, 0], 'sunYellow', { segments: 10, rotate: [0, 0, Math.PI / 2 - TILT] }),
      // hinge strip along the top
      kit.box([0.14, 0.05, 0.66], [0, CY + (FRAME.h / 2) * C + 0.0, 0], 'woodDark'),
      // picture 1, a cup with steam
      pic([0.02, 0.1, 0.15], 0, 0.27, 0.0, 'white'),
      pic([0.02, 0.05, 0.05], 0.1, 0.27, 0.0, 'white'),
      pic([0.02, 0.025, 0.2], 0, 0.205, 0.0, 'sunYellow'),
      pic([0.02, 0.08, 0.025], -0.04, 0.37, 0.0, 'mint'),
      pic([0.02, 0.08, 0.025], 0.04, 0.37, 0.0, 'mint'),
      // picture 2, a cake slice with a cherry
      pic([0.02, 0.1, 0.22], 0, 0.02, 0.0, 'cream'),
      pic([0.022, 0.04, 0.22], 0, 0.09, 0.0, 'pink'),
      pic([0.024, 0.03, 0.03], 0, 0.13, 0.0, 'red'),
      // picture 3, a juice glass with a slice of orange and a straw
      pic([0.02, 0.16, 0.12], 0, -0.26, 0.0, 'glassBlue'),
      pic([0.022, 0.1, 0.1], 0, -0.29, 0.0, 'orange'),
      pic([0.022, 0.1, 0.02], 0.03, -0.17, 0.0, 'red'),
      pic([0.024, 0.05, 0.05], -0.08, -0.2, 0.0, 'sunYellow'),
    ];
    return kit.finish(parts);
  },
};

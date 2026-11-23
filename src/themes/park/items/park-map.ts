import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A park map board (1x1), a lectern-style picture board on four short legs, tilted up about 49 degrees so its
// face looks at the default camera. The picture has no text: a green field, a big blue lake, a yellow path, round
// tree dots and a red "you are here" dot with a white middle.
const TILT = 0.85; // radians the board leans back from upright (its face looks this far above the horizon)
const BOARD = { w: 0.88, h: 0.56 }; // width (z) and length down the slope
const CX: Vec3 = [0, 0.48, 0]; // board centre

// Board-local axes: u along z, v up the slope, w out of the face.
const UP: Vec3 = [-Math.sin(TILT), Math.cos(TILT), 0];
const OUT: Vec3 = [Math.cos(TILT), Math.sin(TILT), 0];
const on = (u: number, v: number, w: number): Vec3 =>
  [CX[0] + UP[0] * v + OUT[0] * w, CX[1] + UP[1] * v + OUT[1] * w, CX[2] + u];
const DISC = TILT - Math.PI / 2; // lays a cylinder's axis along the board's face normal

/** ป้ายแผนที่สวน: a map board with a picture map of the park, no text. */
export const item: ItemModel = {
  id: 'park-map',
  name: 'ป้ายแผนที่สวน',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const rot: Vec3 = [0, 0, TILT];
    /** A flat tile of the picture: size along the board's width (su) and height (sv), `w` out from the face. */
    const tile = (su: number, sv: number, u: number, v: number, w: number, color: PaletteColor): Part =>
      kit.box([0.012, sv, su], on(u, v, w), color, { rotate: rot });
    const W = 0.04;
    const parts: Part[] = [
      kit.box([0.5, 0.03, 0.9], [0, 0.015, 0], 'stone'), // base slab
      // legs: two tall at the back (-x), two short at the front (+x)
      ...[-0.38, 0.38].flatMap((z) => [
        kit.box([0.06, 0.66, 0.06], [-0.2, 0.33, z], 'woodDark'),
        kit.box([0.06, 0.2, 0.06], [0.2, 0.1, z], 'woodDark'),
      ]),
      kit.box([0.05, BOARD.h + 0.07, BOARD.w + 0.07], on(0, 0, 0), 'woodDark', { rotate: rot }), // frame
      kit.box([0.03, BOARD.h, BOARD.w], on(0, 0, 0.012), 'lime', { rotate: rot }), // the green field
      // big blue lake (a blue blob with a lighter shore) on the left
      kit.cylinder(0.24, 0.24, 0.012, on(-0.2, 0.08, W), 'skyBlue', { segments: 14, rotate: [0, 0, DISC], scale: [0.85, 1, 1.15] }),
      kit.cylinder(0.2, 0.2, 0.012, on(-0.2, 0.08, W + 0.008), 'blue', { segments: 14, rotate: [0, 0, DISC], scale: [0.85, 1, 1.15] }),
      // yellow path: along the bottom and up the right side
      tile(0.8, 0.07, 0, -0.2, W, 'sunYellow'),
      tile(0.07, 0.4, 0.28, 0.0, W, 'sunYellow'),
      // the red "you are here" dot with a white middle, on the path
      kit.cylinder(0.075, 0.075, 0.012, on(0.0, -0.2, W + 0.01), 'red', { segments: 12, rotate: [0, 0, DISC] }),
      kit.cylinder(0.03, 0.03, 0.012, on(0.0, -0.2, W + 0.02), 'white', { segments: 8, rotate: [0, 0, DISC] }),
    ];
    // round tree dots
    for (const [u, v, c] of [[0.2, 0.2, 'leaf'], [0.33, 0.2, 'leafDark'], [0.13, 0.06, 'leafDark'], [0.0, -0.02, 'leaf'], [-0.32, -0.08, 'leafDark'], [0.38, -0.02, 'leaf']] as Array<[number, number, PaletteColor]>) {
      parts.push(kit.sphere(0.06, on(u, v, W + 0.02), c, { detail: 0 }));
    }
    return kit.finish(parts);
  },
};

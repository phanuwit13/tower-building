import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A park map board (1x1): two posts, a small red roof, and a board leaning back a little to face the camera.
// The board is a PICTURE map with no text: a green field, a blue lake, sand paths, tree dots, small coloured
// squares for playgrounds and a red "you are here" pin with a white dot.
const TILT = 0.2; // radians the board leans back
const POST = { z: 0.32, h: 0.92 };
const BOARD = { y: 0.68, w: 0.74, h: 0.56 }; // board centre height, width (z), height
const CX: [number, number, number] = [0.02, BOARD.y, 0];

// Board-local axes: u along z, v up the board's face, w out of the face.
const UP: Vec3 = [-Math.sin(TILT), Math.cos(TILT), 0];
const OUT: Vec3 = [Math.cos(TILT), Math.sin(TILT), 0];
const on = (u: number, v: number, w: number): Vec3 =>
  [CX[0] + UP[0] * v + OUT[0] * w, CX[1] + UP[1] * v + OUT[1] * w, CX[2] + u];

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
    const parts: Part[] = [
      kit.box([0.5, 0.04, 0.56], [0, 0.02, 0], 'stone'), // base slab
      kit.box([0.06, 0.9, 0.06], [0, 0.45, -POST.z], 'woodDark'),
      kit.box([0.06, 0.9, 0.06], [0, 0.45, POST.z], 'woodDark'),
      kit.box([0.06, BOARD.h + 0.08, BOARD.w + 0.08], on(0, 0, 0), 'woodDark', { rotate: rot }), // frame
      kit.box([0.04, BOARD.h, BOARD.w], on(0, 0, 0.03), 'lime', { rotate: rot }), // the green field
      kit.wedge([0.36, 0.16, BOARD.w + 0.16], [0.0, POST.h + 0.04 + 0.08, 0], 'red'), // little roof, ridge along z
    ];
    const W = 0.052; // first layer height above the field
    parts.push(
      // lake: a blue pond with a lighter shore
      kit.cylinder(0.14, 0.14, 0.012, on(0.12, 0.08, W), 'skyBlue', { segments: 12, rotate: [0, 0, TILT - Math.PI / 2], scale: [0.85, 1, 1.35] }),
      kit.cylinder(0.11, 0.11, 0.012, on(0.12, 0.08, W + 0.008), 'blue', { segments: 12, rotate: [0, 0, TILT - Math.PI / 2], scale: [0.85, 1, 1.35] }),
      // sand paths: a long one across and a shorter one down
      tile(0.62, 0.04, 0, -0.08, W, 'sand'),
      tile(0.04, 0.34, -0.12, 0.08, W, 'sand'),
      tile(0.04, 0.24, 0.22, -0.2, W, 'sand'),
      // playground and picnic squares
      tile(0.1, 0.1, -0.26, 0.2, W, 'orange'),
      tile(0.08, 0.08, -0.26, -0.2, W, 'pink'),
      tile(0.1, 0.08, 0.26, 0.2, W, 'sunYellow'),
      // the red "you are here" pin: a ring with a white dot, beside the path crossing
      kit.cylinder(0.05, 0.05, 0.012, on(-0.12, -0.08, W + 0.01), 'red', { segments: 10, rotate: [0, 0, TILT - Math.PI / 2] }),
      kit.cylinder(0.02, 0.02, 0.012, on(-0.12, -0.08, W + 0.02), 'white', { segments: 8, rotate: [0, 0, TILT - Math.PI / 2] }),
    );
    // tree dots
    for (const [u, v, c] of [[-0.05, 0.2, 'leaf'], [0.04, 0.2, 'leafDark'], [0.3, -0.05, 'leaf'], [-0.3, 0.02, 'leafDark'], [0.2, -0.22, 'leaf'], [-0.04, -0.2, 'leafDark']] as Array<[number, number, PaletteColor]>) {
      parts.push(kit.sphere(0.04, on(u, v, W + 0.01), c, { detail: 0 }));
    }
    return kit.finish(parts);
  },
};

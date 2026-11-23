import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

const BOARD = { len: 0.2, h: 0.26, t: 0.04 };
const TILT = 0.35; // boards lean back so their faces tilt up towards the camera
const BOARD_X = 0.09; // boards sit against the +x side of the post
const FACE = BOARD.t / 2 + 0.012; // pictures sit just off each face
const COS = Math.cos(TILT);
const SIN = Math.sin(TILT);

/** ป้ายบอกทาง: a wooden post with three big tilted arrow boards showing pictures (swan, slide, cup) on both faces. No words. */
export const item: ItemModel = {
  id: 'signpost',
  name: 'ป้ายบอกทาง',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.15, 0.17, 0.06, [0, 0.03, 0], 'stone', { segments: 8 }),
      kit.cylinder(0.055, 0.06, 1.75, [0, 0.875, 0], 'woodDark', { segments: 8 }),
      kit.sphere(0.07, [0, 1.78, 0], 'brass', { detail: 0 }),
    ];

    // A point in a board's own frame (lx out of the face, ly up the face, lz along the arrow), turned with the tilt.
    const at = (y: number, cz: number, lx: number, ly: number, lz: number): Vec3 => [
      BOARD_X + lx * COS - ly * SIN,
      y + lx * SIN + ly * COS,
      cz + lz,
    ];
    const tilt: [number, number, number] = [0, 0, TILT];

    const board = (y: number, dir: 1 | -1, colour: PaletteColor, pictures: (kit: StyleKit, side: 1 | -1, y: number, cz: number, dir: 1 | -1) => Part[]): void => {
      const cz = dir * 0.15;
      parts.push(
        kit.box([BOARD.t, BOARD.h, BOARD.len], [BOARD_X, y, cz], colour, { rotate: tilt }),
        kit.cylinder(0.15, 0.15, BOARD.t, [BOARD_X, y, dir * (0.15 + BOARD.len / 2 + 0.075)], colour, {
          segments: 3,
          rotate: [0, 0, Math.PI / 2 + TILT],
          scale: [1, 1, dir],
        }),
        ...pictures(kit, 1, y, cz, dir),
        ...pictures(kit, -1, y, cz, dir),
      );
    };

    const swan = (k: StyleKit, side: 1 | -1, y: number, cz: number, dir: 1 | -1): Part[] => {
      const p = (ly: number, lz: number): Vec3 => at(y, cz, side * FACE, ly, dir * lz);
      return [
        k.sphere(0.065, p(-0.045, 0), 'white', { detail: 1, scale: [0.25, 0.6, 1.15], rotate: tilt }),
        k.cylinder(0.018, 0.024, 0.1, p(0.02, 0.07), 'white', { segments: 6, rotate: tilt }),
        k.sphere(0.03, p(0.085, 0.075), 'white', { detail: 0, scale: [0.5, 1, 1], rotate: tilt }),
        k.box([0.014, 0.018, 0.06], p(0.08, 0.125), 'orange', { rotate: tilt }),
      ];
    };
    const slide = (k: StyleKit, side: 1 | -1, y: number, cz: number, dir: 1 | -1): Part[] => {
      const p = (ly: number, lz: number): Vec3 => at(y, cz, side * FACE, ly, dir * lz);
      return [
        k.box([0.014, 0.15, 0.024], p(0.0, -0.06), 'white', { rotate: tilt }),
        k.box([0.014, 0.024, 0.06], p(0.075, -0.04), 'white', { rotate: tilt }),
        rod(k, p(0.07, -0.02), p(-0.07, 0.09), 0.02, 'sunYellow', { segments: 4 }),
        k.box([0.014, 0.024, 0.05], p(-0.075, 0.105), 'white', { rotate: tilt }),
      ];
    };
    const cup = (k: StyleKit, side: 1 | -1, y: number, cz: number, dir: 1 | -1): Part[] => {
      const p = (ly: number, lz: number): Vec3 => at(y, cz, side * FACE, ly, dir * lz);
      return [
        k.cylinder(0.065, 0.048, 0.12, p(-0.005, 0), 'white', { segments: 8, rotate: tilt }),
        k.box([0.016, 0.075, 0.018], p(0.0, 0.09), 'white', { rotate: tilt }),
        k.box([0.016, 0.018, 0.045], p(0.034, 0.07), 'white', { rotate: tilt }),
        k.box([0.016, 0.018, 0.045], p(-0.034, 0.07), 'white', { rotate: tilt }),
        k.box([0.016, 0.02, 0.1], p(-0.075, 0), 'white', { rotate: tilt }), // saucer
      ];
    };
    board(1.5, 1, 'blue', swan);
    board(1.12, -1, 'leaf', slide);
    board(0.74, 1, 'orange', cup);
    return kit.finish(parts);
  },
};

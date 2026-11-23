import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

const BOARD = { len: 0.3, h: 0.17, t: 0.03 };
const BOARD_X = 0.075; // boards sit on the +x side of the post
const PIC_X = BOARD_X + BOARD.t / 2 + 0.012;

/** ป้ายบอกทาง: a wooden post with three arrow boards that show pictures (a swan, a slide, a cup), no words. */
export const item: ItemModel = {
  id: 'signpost',
  name: 'ป้ายบอกทาง',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.14, 0.16, 0.06, [0, 0.03, 0], 'stone', { segments: 8 }),
      kit.cylinder(0.05, 0.055, 1.5, [0, 0.75, 0], 'woodDark', { segments: 8 }),
      kit.sphere(0.065, [0, 1.52, 0], 'brass', { detail: 0 }),
    ];
    // an arrow board: a slab with a triangle tip; dir = +1 points to +z, -1 to -z
    const board = (y: number, dir: 1 | -1, colour: PaletteColor): void => {
      const cz = dir * 0.16;
      parts.push(
        kit.box([BOARD.t, BOARD.h, BOARD.len], [BOARD_X, y, cz], colour),
        kit.cylinder(0.092, 0.092, BOARD.t, [BOARD_X, y, dir * (BOARD.len / 2 + 0.05 + 0.16)], colour, {
          segments: 3,
          rotate: [0, 0, Math.PI / 2],
          scale: [1, 1, dir],
        }),
      );
    };
    board(1.3, 1, 'blue');
    board(1.04, -1, 'leaf');
    board(0.78, 1, 'orange');

    // swan on the blue board (faces +z)
    const sz = 0.18;
    parts.push(
      kit.sphere(0.04, [PIC_X, 1.28, sz - 0.015], 'white', { detail: 0, scale: [0.4, 0.7, 1.2] }),
      kit.cylinder(0.012, 0.016, 0.07, [PIC_X, 1.33, sz + 0.03], 'white', { segments: 6 }),
      kit.sphere(0.02, [PIC_X, 1.375, sz + 0.035], 'white', { detail: 0, scale: [0.6, 1, 1] }),
      kit.box([0.012, 0.012, 0.035], [PIC_X, 1.372, sz + 0.065], 'orange'),
    );
    // slide on the green board (faces -z): a ladder and a sloped slide
    const lz = -0.16;
    parts.push(
      kit.box([0.012, 0.11, 0.016], [PIC_X, 1.04, lz + 0.05], 'white'),
      rod(kit, [PIC_X, 1.095, lz + 0.05], [PIC_X, 0.99, lz - 0.06], 0.012, 'sunYellow', { segments: 4 }),
      kit.box([0.012, 0.016, 0.05], [PIC_X, 0.985, lz - 0.075], 'white'),
    );
    // cup on the orange board (faces +z)
    const cz = 0.16;
    parts.push(
      kit.cylinder(0.04, 0.03, 0.075, [PIC_X, 0.78, cz], 'white', { segments: 8 }),
      kit.torus(0.022, 0.009, [PIC_X, 0.785, cz + 0.045], 'white', { radialSegments: 4, tubularSegments: 8, rotate: [0, Math.PI / 2, 0] }),
    );
    return kit.finish(parts);
  },
};

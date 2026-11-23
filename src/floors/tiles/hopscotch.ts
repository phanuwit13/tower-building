import type { Part } from '../../models/kit';
import type { PaletteColor } from '../../models/palette';
import type { FloorTile } from '../types';

const BASE_H = 0.008;
const BOX_H = 0.007; // top at 0.015, the most a tile may rise
/** Hopscotch squares, one then two then one then two across: [x, z, w, d, colour]. Kept off the cell edge. */
const SQUARES: Array<[number, number, number, number, PaletteColor]> = [
  [0, -0.36, 0.26, 0.26, 'pink'],
  [-0.14, -0.06, 0.26, 0.26, 'sunYellow'], [0.14, -0.06, 0.26, 0.26, 'skyBlue'],
  [0, 0.24, 0.26, 0.26, 'mint'],
  [0, 0.44, 0.5, 0.1, 'orange'],
];

/** ตั้งเตแปะ: a hopscotch court chalked on grey paving, with bright squares to hop through. */
export const tile: FloorTile = {
  id: 'hopscotch',
  name: 'ตั้งเตแปะ',
  group: 'special',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'stone')];
    for (const [x, z, w, d, c] of SQUARES) parts.push(kit.box([w, BOX_H, d], [x, BASE_H + BOX_H / 2, z], c));
    return kit.finish(parts);
  },
};

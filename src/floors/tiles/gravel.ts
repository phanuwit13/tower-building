import type { Part } from '../../models/kit';
import type { PaletteColor } from '../../models/palette';
import type { FloorTile } from '../types';

const BASE_H = 0.008;
/** Pebbles: [x, z, size, turn, height, colour]. On a loose 4 x 3 grid so none overlap, each a different height, all clear of the cell edge. */
const PEBBLES: Array<[number, number, number, number, number, PaletteColor]> = [
  [-0.38, -0.34, 0.12, 0.3, 0.0065, 'stone'], [-0.13, -0.37, 0.1, 1.0, 0.0055, 'cream'], [0.13, -0.33, 0.13, 0.6, 0.007, 'white'], [0.38, -0.36, 0.1, 1.3, 0.006, 'sand'],
  [-0.36, 0.0, 0.1, 0.9, 0.0058, 'white'], [-0.12, 0.03, 0.12, 0.2, 0.0068, 'sand'], [0.14, -0.02, 0.1, 1.2, 0.0052, 'stone'], [0.38, 0.02, 0.12, 0.5, 0.0062, 'cream'],
  [-0.37, 0.35, 0.13, 0.7, 0.0072, 'cream'], [-0.1, 0.37, 0.1, 1.4, 0.0054, 'stone'], [0.14, 0.34, 0.11, 0.1, 0.0066, 'sand'], [0.38, 0.37, 0.1, 0.8, 0.0056, 'white'],
];

/** กรวด: a bed of loose pebbles in stone, cream and sand. */
export const tile: FloorTile = {
  id: 'gravel',
  name: 'กรวด',
  group: 'stone',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'stoneDark')];
    for (const [x, z, s, turn, h, color] of PEBBLES) {
      parts.push(kit.box([s, h, s * 0.8], [x, BASE_H + h / 2, z], color, { rotate: [0, turn, 0] }));
    }
    return kit.finish(parts);
  },
};

import type { Part } from '../../models/kit';
import type { PaletteColor } from '../../models/palette';
import type { FloorTile } from '../types';

const BASE_H = 0.01;
const TUFT = { w: 0.09, h: 0.005 } // tufts top out at 0.015, the most a tile may rise;
/** Tufts and daisies: [x, z, colour]. Kept away from the cell edge so neighbouring lawns never show a seam. */
const SPECKS: Array<[number, number, PaletteColor]> = [
  [-0.3, -0.28, 'leaf'], [0.22, -0.34, 'leaf'], [0.32, 0.18, 'leaf'], [-0.18, 0.3, 'leaf'], [0.02, -0.02, 'leaf'],
  [-0.36, 0.08, 'white'], [0.1, 0.38, 'sunYellow'],
];

/** สนามหญ้า: a bright lawn with darker tufts and a couple of tiny flowers. */
export const tile: FloorTile = {
  id: 'lawn',
  name: 'สนามหญ้า',
  group: 'earth',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'lime')];
    for (const [x, z, color] of SPECKS) {
      const s = color === 'leaf' ? TUFT.w : TUFT.w * 0.6;
      parts.push(kit.box([s, TUFT.h, s], [x, BASE_H + TUFT.h / 2, z], color));
    }
    return kit.finish(parts);
  },
};

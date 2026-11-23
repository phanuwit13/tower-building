import type { Part } from '../../models/kit';
import type { FloorTile } from '../types';

const WHITE_H = 0.011;
const BLUE_H = 0.003; // blue diamonds
const DOT_H = 0.004; // white centres, top at 0.015, the most a tile may rise
const QUARTER = Math.PI / 4;
const CENTRES: Array<[number, number]> = [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]];

/** กระเบื้องลายฟ้าขาว: a white tile with a blue diamond in each of 2 x 2 squares, and a blue star where they meet. */
export const tile: FloorTile = {
  id: 'tile-blue',
  name: 'กระเบื้องลายฟ้าขาว',
  group: 'tile',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, WHITE_H, 1], [0, WHITE_H / 2, 0], 'white')];
    for (const [x, z] of CENTRES) {
      parts.push(kit.box([0.26, BLUE_H, 0.26], [x, WHITE_H + BLUE_H / 2, z], 'blue', { rotate: [0, QUARTER, 0] }));
      parts.push(kit.box([0.11, DOT_H, 0.11], [x, WHITE_H + DOT_H / 2, z], 'white', { rotate: [0, QUARTER, 0] }));
    }
    parts.push(kit.box([0.1, DOT_H, 0.1], [0, WHITE_H + DOT_H / 2, 0], 'blue', { rotate: [0, QUARTER, 0] }));
    return kit.finish(parts);
  },
};

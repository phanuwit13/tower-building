import type { Part } from '../../models/kit';
import type { FloorTile } from '../types';

const BASE_H = 0.008; // the white squares
const DARK_H = 0.007; // top at 0.015, the most a tile may rise
const U = 0.25; // a 4 x 4 board: even, so the checks carry on across the cell edge

/** กระเบื้องหมากรุก: a black and white chessboard, the black squares raised a little. */
export const tile: FloorTile = {
  id: 'tile-checker',
  name: 'กระเบื้องหมากรุก',
  group: 'tile',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'white')];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if ((i + j) % 2 === 0) continue;
        parts.push(kit.box([U, DARK_H, U], [-0.5 + U * (i + 0.5), BASE_H + DARK_H / 2, -0.5 + U * (j + 0.5)], 'charcoal'));
      }
    }
    return kit.finish(parts);
  },
};

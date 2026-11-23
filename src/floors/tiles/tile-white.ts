import type { Part } from '../../models/kit';
import type { FloorTile } from '../types';

const BASE_H = 0.008; // the grout
const TILE_H = 0.007; // top at 0.015, the most a tile may rise
const SIZE = 0.31; // 3 x 3 tiles, 0.023 of grout between them
const AT = [-1 / 3, 0, 1 / 3];

/** กระเบื้องขาว: glossy white square tiles, 3 x 3, with light grey grout. */
export const tile: FloorTile = {
  id: 'tile-white',
  name: 'กระเบื้องขาว',
  group: 'tile',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'stone')];
    for (const x of AT) for (const z of AT) parts.push(kit.box([SIZE, TILE_H, SIZE], [x, BASE_H + TILE_H / 2, z], 'white'));
    return kit.finish(parts);
  },
};

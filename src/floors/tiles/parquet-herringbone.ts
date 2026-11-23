import type { Part } from '../../models/kit';
import type { FloorTile } from '../types';

const BASE_H = 0.008; // the dark joints
const BLOCK_H = 0.007; // top at 0.015, the most a tile may rise
const U = 0.25; // the cell is a 4 x 4 grid of units; every block is a 2 x 1 domino
const GAP = 0.02;
/** Blocks: [first column, first row, horizontal?]. Flat steps of horizontal and upright blocks, flush with every edge. */
const BLOCKS: Array<[number, number, boolean]> = [
  [0, 0, true], [2, 0, false], [3, 0, false],
  [0, 1, true],
  [0, 2, false], [1, 2, true], [3, 2, false],
  [1, 3, true],
];

/** ไม้ปาร์เก้ก้างปลา: short blocks laid in alternating directions, light across and dark along. */
export const tile: FloorTile = {
  id: 'parquet-herringbone',
  name: 'ไม้ปาร์เก้ก้างปลา',
  group: 'wood',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'woodDark')];
    for (const [c, r, horizontal] of BLOCKS) {
      const w = (horizontal ? 2 * U : U) - GAP;
      const d = (horizontal ? U : 2 * U) - GAP;
      const x = -0.5 + c * U + (horizontal ? U : U / 2);
      const z = -0.5 + r * U + (horizontal ? U / 2 : U);
      parts.push(kit.box([w, BLOCK_H, d], [x, BASE_H + BLOCK_H / 2, z], horizontal ? 'sand' : 'wood'));
    }
    return kit.finish(parts);
  },
};

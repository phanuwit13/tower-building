import type { Part } from '../../models/kit';
import type { FloorTile } from '../types';

const BASE_H = 0.015; // the mortar
const BRICK_H = 0.012;
const BRICK_D = 0.21;
const ROWS_Z = [-0.375, -0.125, 0.125, 0.375];
/** Bricks of a row: [centre x, width]. Odd rows are shifted half a brick so the courses interlock (and still tile). */
const ROW_EVEN: Array<[number, number]> = [[-0.25, 0.46], [0.25, 0.46]];
const ROW_ODD: Array<[number, number]> = [[-0.385, 0.23], [0, 0.46], [0.385, 0.23]];

/** อิฐแดง: red brick in a running bond with pale mortar. */
export const tile: FloorTile = {
  id: 'brick-red',
  name: 'พื้นอิฐแดง',
  group: 'stone',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'stone')];
    ROWS_Z.forEach((z, r) => {
      (r % 2 === 0 ? ROW_EVEN : ROW_ODD).forEach(([x, w], i) => {
        parts.push(kit.box([w, BRICK_H, BRICK_D], [x, BASE_H + BRICK_H / 2, z], (r + i) % 2 === 0 ? 'terracotta' : 'red'));
      });
    });
    return kit.finish(parts);
  },
};

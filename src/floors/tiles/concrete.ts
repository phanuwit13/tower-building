import type { Part } from '../../models/kit';
import type { FloorTile } from '../types';

const BASE_H = 0.011;
const SPECK_H = 0.004; // specks top out at 0.015, the most a tile may rise
/** Tiny darker pits: [x, z, size]. Kept away from the cell edge so neighbours never show a seam. */
const SPECKS: Array<[number, number, number]> = [
  [-0.3, -0.25, 0.05], [0.25, -0.33, 0.04], [0.32, 0.2, 0.05], [-0.2, 0.32, 0.04], [0.02, 0.0, 0.04],
];

/** ปูนเรียบ: smooth grey concrete with a few small pits. */
export const tile: FloorTile = {
  id: 'concrete',
  name: 'ปูนเรียบ',
  group: 'tile',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'stone')];
    for (const [x, z, s] of SPECKS) parts.push(kit.box([s, SPECK_H, s], [x, BASE_H + SPECK_H / 2, z], 'stoneDark'));
    return kit.finish(parts);
  },
};

import type { Part } from '../../models/kit';
import type { FloorTile } from '../types';

const BASE_H = 0.006; // the dark furrows
const RIDGE_H = 0.009; // top at 0.015, the most a tile may rise
const RIDGE_D = 0.16; // four ridges across the cell leave a 0.09 furrow between them
const RIDGE_Z = [-0.375, -0.125, 0.125, 0.375];

/** แปลงดินยกร่อง: raised ridges of soil running along x, with dark furrows between. They end on the cell edge, so they continue. */
export const tile: FloorTile = {
  id: 'tilled-soil',
  name: 'แปลงดินยกร่อง',
  group: 'earth',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'bark')];
    RIDGE_Z.forEach((z) => parts.push(kit.box([1, RIDGE_H, RIDGE_D], [0, BASE_H + RIDGE_H / 2, z], 'woodDark')));
    return kit.finish(parts);
  },
};

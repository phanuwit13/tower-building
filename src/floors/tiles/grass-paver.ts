import type { Part } from '../../models/kit';
import type { FloorTile } from '../types';

const BASE_H = 0.011; // the concrete grid
const GRASS_H = 0.004; // top at 0.015
const SIZE = 0.24; // a grass hole
const STEP = 1 / 3;

/** บล็อกหญ้า: a concrete grid block with a 3 x 3 field of grass holes, the bricks in a car park. */
export const tile: FloorTile = {
  id: 'grass-paver',
  name: 'บล็อกหญ้า',
  group: 'stone',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'stone')];
    for (let i = 0; i < 9; i++) {
      const x = ((i % 3) - 1) * STEP, z = (Math.floor(i / 3) - 1) * STEP;
      parts.push(kit.box([SIZE, GRASS_H, SIZE], [x, BASE_H + GRASS_H / 2, z], i % 2 === 0 ? 'lime' : 'leaf'));
    }
    return kit.finish(parts);
  },
};

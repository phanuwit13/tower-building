import type { Part } from '../../models/kit';
import type { FloorTile } from '../types';

const BASE_H = 0.008; // the dark gaps
const COBBLE_H = 0.007; // top at 0.015
const SIZE = 0.27;
const STEP = 1 / 3;
/** Turns, in rad, for the nine cobbles (row by row): small, so they stay inside their third and the gaps stay open. */
const TURNS = [0.17, -0.12, 0.2, -0.18, 0.1, -0.2, 0.12, 0.19, -0.1];

/** หินก้อนกลม: a 3 x 3 field of cobbles, each a little turned, in two greys over dark gaps. */
export const tile: FloorTile = {
  id: 'cobblestone',
  name: 'หินก้อนกลม',
  group: 'stone',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'charcoal')];
    TURNS.forEach((turn, i) => {
      const x = ((i % 3) - 1) * STEP, z = (Math.floor(i / 3) - 1) * STEP;
      parts.push(kit.box([SIZE, COBBLE_H, SIZE], [x, BASE_H + COBBLE_H / 2, z], i % 2 === 0 ? 'stone' : 'chrome', { rotate: [0, turn, 0] }));
    });
    return kit.finish(parts);
  },
};

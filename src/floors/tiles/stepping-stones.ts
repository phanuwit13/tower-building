import type { Part } from '../../models/kit';
import type { FloorTile } from '../types';

const BASE_H = 0.008;
const STONE_H = 0.007; // top at 0.015
/** Two flat stones per cell, a path that zigzags along x: [x, z, w, d, turn]. Side by side the stones are about half a cell apart. */
const STONES: Array<[number, number, number, number, number]> = [
  [-0.26, 0.1, 0.36, 0.3, 0.25],
  [0.24, -0.12, 0.34, 0.3, -0.3],
];
/** Grass tufts: [x, z]. */
const TUFTS: Array<[number, number]> = [[-0.36, -0.32], [0.04, 0.3], [0.38, 0.32], [-0.04, -0.4], [0.4, -0.4]];

/** หินทางเดินบนหญ้า: flat stones in a lawn, so a row of cells reads as a garden path. */
export const tile: FloorTile = {
  id: 'stepping-stones',
  name: 'หินทางเดินบนหญ้า',
  group: 'stone',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'lime')];
    for (const [x, z] of TUFTS) parts.push(kit.box([0.07, 0.005, 0.07], [x, BASE_H + 0.0025, z], 'leaf'));
    for (const [x, z, w, d, turn] of STONES) {
      parts.push(kit.box([w, STONE_H, d], [x, BASE_H + STONE_H / 2, z], 'stone', { rotate: [0, turn, 0] }));
    }
    return kit.finish(parts);
  },
};

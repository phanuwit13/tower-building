import type { Part } from '../../models/kit';
import type { PaletteColor } from '../../models/palette';
import type { FloorTile } from '../types';

const BASE_H = 0.01;
const TUFT_H = 0.003;
const FLOWER_H = 0.005; // top at 0.015, the most a tile may rise
/** Tufts then flowers: [x, z, size, colour]. Away from the cell edge so neighbouring lawns never show a seam. */
const TUFTS: Array<[number, number, number]> = [[-0.32, -0.3, 0.12], [0.3, -0.36, 0.1], [0.36, 0.3, 0.12], [-0.3, 0.34, 0.1]];
const FLOWERS: Array<[number, number, PaletteColor]> = [
  [-0.12, -0.2, 'pink'], [0.2, -0.12, 'white'], [-0.28, 0.08, 'sunYellow'], [0.04, 0.12, 'orange'],
  [0.3, 0.12, 'pink'], [-0.04, 0.38, 'white'], [0.12, -0.4, 'sunYellow'],
];

/** หญ้ามีดอกไม้: a bright lawn dotted with little pink, white, yellow and orange flowers. */
export const tile: FloorTile = {
  id: 'lawn-flowers',
  name: 'หญ้ามีดอกไม้',
  group: 'earth',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'lime')];
    for (const [x, z, s] of TUFTS) parts.push(kit.box([s, TUFT_H, s], [x, BASE_H + TUFT_H / 2, z], 'leaf'));
    for (const [x, z, c] of FLOWERS) parts.push(kit.box([0.08, FLOWER_H, 0.08], [x, BASE_H + FLOWER_H / 2, z], c));
    return kit.finish(parts);
  },
};

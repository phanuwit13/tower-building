import type { Part } from '../../models/kit';
import type { FloorTile } from '../types';

const BASE_H = 0.01;
const TRIM_H = 0.003;
const MID_H = 0.005; // top at 0.015, the most a tile may rise

/** พรมแดง: a red carpet with a darker border band and a golden diamond-ish square in the middle. */
export const tile: FloorTile = {
  id: 'carpet-red',
  name: 'พรมแดง',
  group: 'special',
  build: (kit) => {
    const y = BASE_H + TRIM_H / 2;
    const parts: Part[] = [
      kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'red'),
      // border band: north and south strips run full length, east and west fit between them
      kit.box([0.88, TRIM_H, 0.06], [0, y, -0.4], 'redDark'),
      kit.box([0.88, TRIM_H, 0.06], [0, y, 0.4], 'redDark'),
      kit.box([0.06, TRIM_H, 0.74], [-0.4, y, 0], 'redDark'),
      kit.box([0.06, TRIM_H, 0.74], [0.4, y, 0], 'redDark'),
      kit.box([0.2, MID_H, 0.2], [0, BASE_H + MID_H / 2, 0], 'brass', { rotate: [0, Math.PI / 4, 0] }),
    ];
    return kit.finish(parts);
  },
};

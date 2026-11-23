import type { Part } from '../../models/kit';
import type { PaletteColor } from '../../models/palette';
import type { FloorTile } from '../types';

const BASE_H = 0.01;
const RELIEF_H = 0.005; // top at 0.015, the most a tile may rise
/** Wind ripples and pebbles: [x, z, w, d, colour]. Away from the edge so neighbours never show a seam. */
const BITS: Array<[number, number, number, number, PaletteColor]> = [
  [-0.1, -0.32, 0.6, 0.05, 'cream'], [0.15, -0.08, 0.6, 0.05, 'cream'], [-0.12, 0.2, 0.6, 0.05, 'cream'],
  [0.3, 0.38, 0.1, 0.08, 'wood'], [-0.34, 0.02, 0.08, 0.07, 'wood'], [0.34, -0.38, 0.08, 0.07, 'wood'],
];

/** ทราย: warm sand with pale wind ripples and a few little pebbles. */
export const tile: FloorTile = {
  id: 'sand',
  name: 'ทราย',
  group: 'earth',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'sand')];
    for (const [x, z, w, d, c] of BITS) parts.push(kit.box([w, RELIEF_H, d], [x, BASE_H + RELIEF_H / 2, z], c));
    return kit.finish(parts);
  },
};

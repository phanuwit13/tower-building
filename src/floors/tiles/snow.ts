import type { Part } from '../../models/kit';
import type { PaletteColor } from '../../models/palette';
import type { FloorTile } from '../types';

const BASE_H = 0.01;
const DRIFT_H = 0.005; // top at 0.015, the most a tile may rise
/** Drifts and cool shadows: [x, z, w, d, colour]. Kept off the cell edge so neighbours never show a seam. */
const DRIFTS: Array<[number, number, number, number, PaletteColor]> = [
  [-0.22, -0.26, 0.4, 0.26, 'white'], [0.26, 0.0, 0.34, 0.36, 'white'], [-0.16, 0.3, 0.44, 0.24, 'white'],
  [0.3, -0.34, 0.2, 0.14, 'glassBlue'], [-0.36, 0.04, 0.14, 0.2, 'glassBlue'], [0.16, 0.38, 0.18, 0.1, 'glassBlue'],
];

/** หิมะ: soft white snow with gentle drifts and pale blue shadows. */
export const tile: FloorTile = {
  id: 'snow',
  name: 'หิมะ',
  group: 'special',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'white')];
    for (const [x, z, w, d, c] of DRIFTS) {
      const h = c === 'white' ? DRIFT_H : DRIFT_H * 0.4;
      parts.push(kit.box([w, h, d], [x, BASE_H + h / 2, z], c));
    }
    return kit.finish(parts);
  },
};

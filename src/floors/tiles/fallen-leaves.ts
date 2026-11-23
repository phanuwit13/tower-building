import type { Part } from '../../models/kit';
import type { PaletteColor } from '../../models/palette';
import type { FloorTile } from '../types';

const BASE_H = 0.008;
const LEAF_H = 0.007; // top at 0.015, the most a tile may rise
/** Leaves: [x, z, w, d, colour]. Kept off the cell edge so neighbours never show a seam. */
const LEAVES: Array<[number, number, number, number, PaletteColor]> = [
  [-0.3, -0.3, 0.16, 0.12, 'orange'], [0.05, -0.34, 0.12, 0.16, 'red'], [0.34, -0.22, 0.14, 0.12, 'sunYellow'],
  [-0.08, -0.06, 0.15, 0.13, 'terracotta'], [0.26, 0.06, 0.12, 0.15, 'orange'], [-0.36, 0.1, 0.12, 0.14, 'sunYellow'],
  [-0.18, 0.34, 0.16, 0.12, 'red'], [0.12, 0.3, 0.14, 0.14, 'sunYellow'], [0.38, 0.38, 0.1, 0.1, 'terracotta'],
];

/** ใบไม้ร่วง: a brown ground scattered with orange, red and yellow leaves. */
export const tile: FloorTile = {
  id: 'fallen-leaves',
  name: 'ใบไม้ร่วง',
  group: 'earth',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'wood')];
    for (const [x, z, w, d, c] of LEAVES) parts.push(kit.box([w, LEAF_H, d], [x, BASE_H + LEAF_H / 2, z], c));
    return kit.finish(parts);
  },
};

import type { Part } from '../../models/kit';
import type { PaletteColor } from '../../models/palette';
import type { FloorTile } from '../types';

const BASE_H = 0.009;
const LUMP_H = 0.006; // top at 0.015, the most a tile may rise
/** Wet patches and clods: [x, z, w, d, colour]. Kept off the cell edge so neighbours never show a seam. */
const LUMPS: Array<[number, number, number, number, PaletteColor]> = [
  [-0.25, -0.25, 0.38, 0.26, 'woodDark'], [0.28, -0.05, 0.3, 0.34, 'woodDark'], [-0.1, 0.3, 0.42, 0.22, 'woodDark'],
  [0.3, 0.36, 0.14, 0.12, 'wood'], [-0.38, 0.06, 0.12, 0.14, 'wood'], [0.08, -0.36, 0.12, 0.1, 'wood'],
];

/** ดินโคลน: soft brown mud with darker wet patches and a few dry clods. */
export const tile: FloorTile = {
  id: 'mud',
  name: 'ดินโคลน',
  group: 'earth',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'bark')];
    for (const [x, z, w, d, c] of LUMPS) parts.push(kit.box([w, LUMP_H, d], [x, BASE_H + LUMP_H / 2, z], c));
    return kit.finish(parts);
  },
};
